import { readFileSync } from "node:fs";

const html = readFileSync("site/index.html", "utf8");
const requiredMarkers = [
  "IBM z/OS Batch Window Risk Console",
  "Batch windows should fail visibly",
  "Nightly settlement close",
  "Primary recommendation"
];

for (const marker of requiredMarkers) {
  if (!html.includes(marker)) {
    throw new Error(`Missing prerender marker: ${marker}`);
  }
}

console.log("smoke ok");
