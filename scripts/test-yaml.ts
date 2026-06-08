import { readFileSync, writeFileSync } from "fs";
import yaml from "js-yaml";

const content = readFileSync("content/chapters/where-is-pandora/meta.yaml", "utf8");
const data = yaml.load(content);

const output = yaml.dump(data, { lineWidth: -1 });
console.log(output);
