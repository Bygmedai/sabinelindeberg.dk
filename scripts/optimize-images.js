// Image-optimering — kører lokalt og i CI før build hvis ønsket.
// Genererer:
//   - og-image.jpg (1200x630, mozjpeg q82)  fra hero-banner.png
//   - .avif og .webp companions for alle sabine-*.jpg portrætter
//   - re-encoder de oprindelige sabine-*.jpg ved q82 mozjpeg (in-place)
//   - genererer logo-tree.webp + logo-tree.avif
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const root = path.resolve(__dirname, "..");
const dir = path.join(root, "src/assets/materiale");
const archive = path.join(root, "src/assets/_archive");

const portraits = [
  "sabine-portrait.jpg",
  "sabine-smile.jpg",
  "sabine-natur.jpg",
  "sabine-sne-bred.jpg",
  "sabine-sne-portrait.jpg",
];

(async () => {
  // 1) Dedikeret OG-image — 1200×630 JPG fra arkivet (originalt hero-banner.png)
  //    eller fra hero-banner.png hvis den endnu ikke er flyttet til _archive/.
  const ogTarget = path.join(dir, "og-image.jpg");
  const ogSourceA = path.join(archive, "hero-banner.png");
  const ogSourceB = path.join(dir, "hero-banner.png");
  const ogSource = fs.existsSync(ogSourceA) ? ogSourceA : (fs.existsSync(ogSourceB) ? ogSourceB : null);
  if (ogSource) {
    await sharp(ogSource)
      .resize(1200, 630, { fit: "cover", position: "center" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(ogTarget);
    console.log("og-image.jpg:", fs.statSync(ogTarget).size, "bytes");
  } else {
    console.warn("OG-source not found; bevarer eksisterende og-image.jpg");
  }

  // 2) Re-encode portrætter (in-place, mozjpeg q82) + WebP (q80) + AVIF (effort 4, q60)
  for (const fname of portraits) {
    const src = path.join(dir, fname);
    if (!fs.existsSync(src)) continue;
    const buf = await fs.promises.readFile(src);
    const before = buf.length;

    const reencoded = await sharp(buf).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    if (reencoded.length < before) {
      await fs.promises.writeFile(src, reencoded);
    }

    const webpTarget = src.replace(/\.jpg$/, ".webp");
    await sharp(buf).webp({ quality: 80 }).toFile(webpTarget);

    const avifTarget = src.replace(/\.jpg$/, ".avif");
    // AVIF: lavere q OK fordi kompressionen er meget bedre. effort=4 = balance speed/size.
    await sharp(buf).avif({ quality: 55, effort: 4 }).toFile(avifTarget);

    console.log(
      `${fname}: ${before} -> ${fs.statSync(src).size} jpg, ` +
      `${fs.statSync(webpTarget).size} webp, ${fs.statSync(avifTarget).size} avif`
    );
  }

  // 3) Logo-tree: behold PNG (transparens) men gen-encode + tilføj WebP + AVIF
  const logoSrc = path.join(dir, "logo-tree.png");
  if (fs.existsSync(logoSrc)) {
    const before = fs.statSync(logoSrc).size;
    const buf = await fs.promises.readFile(logoSrc);
    const reencoded = await sharp(buf).png({ compressionLevel: 9, quality: 90 }).toBuffer();
    if (reencoded.length < before) {
      await fs.promises.writeFile(logoSrc, reencoded);
    }
    await sharp(buf).webp({ quality: 90 }).toFile(logoSrc.replace(/\.png$/, ".webp"));
    await sharp(buf).avif({ quality: 70, effort: 4 }).toFile(logoSrc.replace(/\.png$/, ".avif"));
    console.log(
      `logo-tree.png: ${before} -> ${fs.statSync(logoSrc).size} png, ` +
      `${fs.statSync(logoSrc.replace(/\.png$/, ".webp")).size} webp, ` +
      `${fs.statSync(logoSrc.replace(/\.png$/, ".avif")).size} avif`
    );
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
