// Image-optimering — kører lokalt og i CI før build hvis ønsket.
// Genererer:
//   - og-image.jpg (1200x630, mozjpeg q82)  fra hero-banner.png
//   - .webp companions for alle sabine-*.jpg portrætter
//   - re-encoder de oprindelige sabine-*.jpg ved q82 mozjpeg (in-place)
//   - genererer logo-tree.webp
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const root = path.resolve(__dirname, "..");
const dir = path.join(root, "src/assets/materiale");

const portraits = [
  "sabine-portrait.jpg",
  "sabine-smile.jpg",
  "sabine-natur.jpg",
  "sabine-sne-bred.jpg",
  "sabine-sne-portrait.jpg",
];

(async () => {
  // 1) Dedikeret OG-image — 1200×630 JPG fra hero-banner.png
  const ogTarget = path.join(dir, "og-image.jpg");
  await sharp(path.join(dir, "hero-banner.png"))
    .resize(1200, 630, { fit: "cover", position: "center" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(ogTarget);
  console.log("og-image.jpg:", fs.statSync(ogTarget).size, "bytes");

  // 2) Re-encode portrætter (in-place, mozjpeg q82) + WebP companion (q80)
  for (const fname of portraits) {
    const src = path.join(dir, fname);
    if (!fs.existsSync(src)) continue;
    const buf = await fs.promises.readFile(src);
    const before = buf.length;

    const reencoded = await sharp(buf).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    await fs.promises.writeFile(src, reencoded);

    const webpTarget = src.replace(/\.jpg$/, ".webp");
    await sharp(buf).webp({ quality: 80 }).toFile(webpTarget);
    console.log(
      `${fname}: ${before} -> ${reencoded.length} jpg, ${fs.statSync(webpTarget).size} webp`
    );
  }

  // 3) Logo-tree: behold PNG (transparens) men gen-encode + tilføj WebP
  const logoSrc = path.join(dir, "logo-tree.png");
  if (fs.existsSync(logoSrc)) {
    const before = fs.statSync(logoSrc).size;
    const buf = await fs.promises.readFile(logoSrc);
    const reencoded = await sharp(buf).png({ compressionLevel: 9, quality: 90 }).toBuffer();
    if (reencoded.length < before) {
      await fs.promises.writeFile(logoSrc, reencoded);
    }
    await sharp(buf).webp({ quality: 90 }).toFile(logoSrc.replace(/\.png$/, ".webp"));
    console.log(
      `logo-tree.png: ${before} -> ${fs.statSync(logoSrc).size} png, ${fs.statSync(logoSrc.replace(/\.png$/, ".webp")).size} webp`
    );
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
