import { createReadStream } from "node:fs";
import OpenAI, { toFile } from "openai";

// gpt-image-1 supports exactly three sizes. The figure schema speaks in aspect
// ratios, so map each ratio to the nearest supported size.
const SIZE_BY_ASPECT: Record<string, "1024x1024" | "1536x1024" | "1024x1536"> =
  {
    "1:1": "1024x1024",
    "16:9": "1536x1024",
    "4:3": "1536x1024",
    "3:2": "1536x1024",
    "9:16": "1024x1536",
  };

export function sizeForAspect(
  aspect: string,
): "1024x1024" | "1536x1024" | "1024x1536" {
  return SIZE_BY_ASPECT[aspect] ?? "1536x1024";
}

export interface GeneratedImage {
  /** Decoded PNG bytes, ready to write to disk. */
  bytes: Buffer;
  /** Provider response id when present — persisted for reproducible regen. */
  responseId?: string;
}

export interface GenerateOptions {
  prompt: string;
  aspect: string;
  quality?: "low" | "medium" | "high" | "auto";
  /** Reference image paths (style anchor + character sheets). Switches to edit. */
  referencePaths?: string[];
}

// Override per-deployment via OPENAI_IMAGE_MODEL in .env without editing source.
const MODEL = process.env.OPENAI_IMAGE_MODEL?.trim();

const MAX_RETRIES = 5;

// Some OpenAI-compatible proxies accept only a minimal {model, prompt} payload
// and 400 on the gpt-image-1 extras (size/quality/output_format). Once we see
// that, drop the extras for the rest of the run instead of failing every call.
let minimalPayloadOnly = false;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Image endpoints rate-limit aggressively, and batch runs generate many figures
// back-to-back. Retry 429s and transient 5xx with exponential backoff.
async function withRetry<T>(label: string, fn: () => Promise<T>): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      const status = (err as { status?: number }).status;
      const retryable =
        status === 429 || (typeof status === "number" && status >= 500);
      attempt++;
      if (!retryable || attempt > MAX_RETRIES) throw err;
      const waitMs = Math.min(2 ** attempt * 1000, 30_000);
      console.log(
        `[image-client] ${label}: ${status} (attempt ${attempt}/${MAX_RETRIES}), ` +
          `retrying in ${Math.round(waitMs / 1000)}s...`,
      );
      await sleep(waitMs);
    }
  }
}

function makeClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to .env at the repo root " +
        "(copy .env.example), then re-run. The key is never logged.",
    );
  }
  if (!MODEL) {
    throw new Error(
      "OPENAI_IMAGE_MODEL is not set. Add it to .env (the image model id your " +
        "endpoint exposes, e.g. gpt-image-1).",
    );
  }
  // baseURL is honored when OPENAI_BASE_URL points at a proxy/custom endpoint.
  const baseURL = process.env.OPENAI_BASE_URL?.trim() || undefined;
  return new OpenAI({ apiKey, baseURL });
}

// A proxy/base URL may return either base64 or a URL; handle both.
async function decodeFirst(
  data: Array<{ b64_json?: string | null; url?: string | null }> | undefined,
): Promise<Buffer> {
  const first = data?.[0];
  if (!first) throw new Error("Image API returned no data.");
  if (first.b64_json) return Buffer.from(first.b64_json, "base64");
  if (first.url) {
    const res = await fetch(first.url);
    if (!res.ok)
      throw new Error(`Failed to fetch generated image: HTTP ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  }
  throw new Error("Image API response had neither b64_json nor url.");
}

export async function generateImage(
  opts: GenerateOptions,
): Promise<GeneratedImage> {
  const client = makeClient();
  const size = sizeForAspect(opts.aspect);
  const quality = opts.quality ?? "high";

  if (opts.referencePaths && opts.referencePaths.length > 0) {
    const images = await Promise.all(
      opts.referencePaths.map((p) =>
        toFile(createReadStream(p), undefined, { type: "image/png" }),
      ),
    );
    // Some endpoints reject an image array and want a single file; pass one
    // file when there is exactly one reference (the common case).
    const imageParam = images.length === 1 ? images[0] : images;
    const res = await withRetry("edit", () =>
      callEdit(client, imageParam, opts.prompt, size, quality),
    );
    return {
      bytes: await decodeFirst(res.data),
      responseId: (res as { id?: string }).id,
    };
  }

  const res = await withRetry("generate", () =>
    callGenerate(client, opts.prompt, size, quality),
  );
  return {
    bytes: await decodeFirst(res.data),
    responseId: (res as { id?: string }).id,
  };
}

type ImageParam = OpenAI.ImageEditParams["image"];

// Edit with reference image(s). input_fidelity (gpt-image-1) raises adherence
// to the references. Like generate, downgrade to a minimal payload if the
// endpoint rejects the extended params.
async function callEdit(
  client: OpenAI,
  image: ImageParam,
  prompt: string,
  size: string,
  quality: string,
): Promise<OpenAI.ImagesResponse> {
  if (!minimalPayloadOnly) {
    try {
      return await client.images.edit({
        model: MODEL,
        image,
        prompt,
        size,
        quality,
        input_fidelity: "high",
      } as OpenAI.ImageEditParams & { input_fidelity: "high" | "low" });
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (status !== 400 && status !== 422) throw err;
      console.log(
        "[image-client] edit endpoint rejected extended params; retrying with minimal payload.",
      );
      minimalPayloadOnly = true;
    }
  }
  return await client.images.edit({
    model: MODEL,
    image,
    prompt,
  } as OpenAI.ImageEditParams);
}

// Try the full gpt-image-1 payload; if the endpoint 400s on the extras, latch
// to minimal {model, prompt} and retry — covers proxies that only accept that.
async function callGenerate(
  client: OpenAI,
  prompt: string,
  size: string,
  quality: string,
): Promise<OpenAI.ImagesResponse> {
  if (!minimalPayloadOnly) {
    try {
      return await client.images.generate({
        model: MODEL,
        prompt,
        size,
        quality,
        output_format: "png",
      } as OpenAI.ImageGenerateParams);
    } catch (err) {
      if ((err as { status?: number }).status !== 400) throw err;
      console.log(
        "[image-client] endpoint rejected extended params; retrying with minimal payload.",
      );
      minimalPayloadOnly = true;
    }
  }
  return await client.images.generate({
    model: MODEL,
    prompt,
  } as OpenAI.ImageGenerateParams);
}
