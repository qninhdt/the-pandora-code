// r2-client.mjs — minimal S3-compatible client for Cloudflare R2.
//
// R2 is reached through its S3 API with SigV4 rather than Wrangler, so uploads
// work from any machine or CI runner that has the four env vars below and no
// interactive Cloudflare login. Signing is implemented directly on node:crypto
// to keep the scripts workspace dependency-free.
//
// Required env:
//   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
// Optional env:
//   R2_BUCKET (default "the-pandora-code"), R2_ENDPOINT (default derived
//   from the account id), R2_PUBLIC_BASE (only used for logging a public URL)

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const SERVICE = "s3";
const REGION = "auto";
const UNSIGNED_STREAM = "UNSIGNED-PAYLOAD";

const CONTENT_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".json": "application/json",
};

export function contentTypeFor(file) {
  return CONTENT_TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream";
}

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const hmac = (key, value) => crypto.createHmac("sha256", key).update(value).digest();

/** Read R2 connection settings from the environment. */
export function readR2Config(env = process.env) {
  const accountId = env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY?.trim();
  const missing = [
    ["R2_ACCOUNT_ID", accountId],
    ["R2_ACCESS_KEY_ID", accessKeyId],
    ["R2_SECRET_ACCESS_KEY", secretAccessKey],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (missing.length) {
    throw new Error(`Missing R2 credentials: ${missing.join(", ")} (set them in .env)`);
  }

  const endpoint = (
    env.R2_ENDPOINT?.trim() || `https://${accountId}.r2.cloudflarestorage.com`
  ).replace(/\/+$/, "");
  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    endpoint,
    bucket: env.R2_BUCKET?.trim() || "the-pandora-code",
    publicBase: env.R2_PUBLIC_BASE?.trim().replace(/\/+$/, "") || null,
  };
}

// Each "/"-separated segment is encoded individually so the slashes that
// separate key segments survive into the canonical request unescaped.
function encodeKey(key) {
  return key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function signedHeaders(config, { method, key, payloadHash, headers = {} }) {
  const url = new URL(`${config.endpoint}/${config.bucket}/${encodeKey(key)}`);
  const now = new Date();
  const amzDate = `${now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 15)}Z`;
  const dateStamp = amzDate.slice(0, 8);

  const allHeaders = {
    host: url.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
    ...headers,
  };
  const canonicalNames = Object.keys(allHeaders)
    .map((name) => name.toLowerCase())
    .sort();
  const canonicalHeaders = canonicalNames
    .map((name) => {
      const [, value] = Object.entries(allHeaders).find(
        ([candidate]) => candidate.toLowerCase() === name,
      );
      return `${name}:${String(value).trim()}\n`;
    })
    .join("");
  const signedHeaderList = canonicalNames.join(";");

  const canonicalRequest = [
    method,
    url.pathname,
    "",
    canonicalHeaders,
    signedHeaderList,
    payloadHash,
  ].join("\n");
  const scope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    scope,
    sha256(canonicalRequest),
  ].join("\n");

  const signingKey = ["aws4_request"].reduce(
    (key, value) => hmac(key, value),
    hmac(hmac(hmac(`AWS4${config.secretAccessKey}`, dateStamp), REGION), SERVICE),
  );
  const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  return {
    url,
    headers: {
      ...allHeaders,
      Authorization: `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${scope}, SignedHeaders=${signedHeaderList}, Signature=${signature}`,
    },
  };
}

async function send(config, options) {
  const { url, headers } = signedHeaders(config, options);
  return fetch(url, { method: options.method, headers, body: options.body ?? undefined });
}

/**
 * Object metadata, or null when the object does not exist.
 *
 * `size` can be null even for an object that exists: Cloudflare compresses
 * text responses and then omits `content-length`, so only the ETag is a
 * dependable identity for JSON sidecars. Weak-validator and quote decoration
 * are stripped so the value compares directly against a local MD5.
 */
export async function headObject(config, key) {
  const response = await send(config, { method: "HEAD", key, payloadHash: sha256("") });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`HEAD ${key} failed: ${response.status}`);
  const length = Number.parseInt(response.headers.get("content-length") ?? "", 10);
  const etag = response.headers.get("etag");
  return {
    size: Number.isFinite(length) ? length : null,
    etag: etag ? etag.replace(/^W\//, "").replace(/^"|"$/g, "") : null,
  };
}

export async function putObject(config, key, body, contentType) {
  const payloadHash = Buffer.isBuffer(body) ? sha256(body) : UNSIGNED_STREAM;
  const response = await send(config, {
    method: "PUT",
    key,
    payloadHash,
    headers: { "content-type": contentType, "content-length": String(body.length) },
    body,
  });
  if (!response.ok) {
    throw new Error(`PUT ${key} failed: ${response.status} ${await response.text()}`);
  }
}

/**
 * Upload a file unless the stored object already has the same content.
 *
 * Every object here is written by a single-part PUT, so R2's ETag is the
 * payload MD5 and comparing it detects an unchanged render exactly. Size is
 * only a fallback for a response that carries no usable ETag.
 */
export async function putFileIfChanged(config, key, file) {
  const body = fs.readFileSync(file);
  const localSize = body.length;
  const remote = await headObject(config, key);
  const localEtag = crypto.createHash("md5").update(body).digest("hex");
  const unchanged = remote?.etag
    ? remote.etag === localEtag
    : remote?.size === localSize && remote.size !== null;
  if (unchanged) return { key, uploaded: false, localSize };
  await putObject(config, key, body, contentTypeFor(file));
  return { key, uploaded: true, localSize };
}

export function publicUrl(config, key) {
  return config.publicBase ? `${config.publicBase}/${key}` : null;
}
