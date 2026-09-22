// Rebuild the code-native brand assets with: node scripts/generate-brand.mjs
import sharp from "sharp"
import { writeFile } from "node:fs/promises"
const mark = `<rect width="128" height="128" rx="30" fill="#2454eb"/><path d="M29 84a40 40 0 1 1 70 0" fill="none" stroke="#fff" stroke-opacity=".32" stroke-width="10" stroke-linecap="round"/><path d="M29 84a40 40 0 0 1 59-51" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/><path d="M64 72 88 48" stroke="#fff" stroke-width="10" stroke-linecap="round"/><circle cx="64" cy="72" r="9" fill="#fff"/><path d="M49 103h30" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">${mark}</svg>`
await writeFile("app/icon.svg", icon)
await writeFile("public/brand/mark.svg", icon)
for (const size of [192, 512])
  await sharp(Buffer.from(icon))
    .resize(size, size)
    .png()
    .toFile(`public/brand/icon-${size}.png`)
await sharp(Buffer.from(icon))
  .resize(180, 180)
  .png()
  .toFile("app/apple-icon.png")
const sizes = [16, 32, 48]
const pngs = await Promise.all(
  sizes.map((size) =>
    sharp(Buffer.from(icon)).resize(size, size).png().toBuffer()
  )
)
const header = Buffer.alloc(6 + 16 * sizes.length)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(sizes.length, 4)
let offset = header.length
pngs.forEach((png, i) => {
  const p = 6 + 16 * i
  header[p] = sizes[i]
  header[p + 1] = sizes[i]
  header.writeUInt16LE(1, p + 4)
  header.writeUInt16LE(32, p + 6)
  header.writeUInt32LE(png.length, p + 8)
  header.writeUInt32LE(offset, p + 12)
  offset += png.length
})
await writeFile("app/favicon.ico", Buffer.concat([header, ...pngs]))
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><radialGradient id="glow"><stop stop-color="#1d46b5" stop-opacity=".5"/><stop offset="1" stop-color="#0b1020" stop-opacity="0"/></radialGradient><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#fff" stroke-opacity=".045"/></pattern></defs>
<rect width="1200" height="630" fill="#0b1020"/><rect width="1200" height="630" fill="url(#grid)"/><ellipse cx="1000" cy="300" rx="480" ry="440" fill="url(#glow)"/>
<g transform="translate(65 53) scale(.43)">${mark}</g><text x="138" y="91" font-family="DejaVu Sans,sans-serif" font-size="27" font-weight="bold" fill="#fff">AI Speedtest</text>
<text x="65" y="188" font-family="DejaVu Sans,sans-serif" font-size="15" letter-spacing="3" fill="#8dafff">THE LOCAL AI BENCHMARK</text>
<text x="61" y="276" font-family="DejaVu Sans,sans-serif" font-size="65" font-weight="bold" letter-spacing="-2" fill="#fff">How fast is</text><text x="61" y="355" font-family="DejaVu Sans,sans-serif" font-size="65" font-weight="bold" letter-spacing="-2" fill="#fff">your PC at AI?</text>
<text x="65" y="414" font-family="DejaVu Sans,sans-serif" font-size="22" fill="#a8b4cf">Real models. Your hardware. In your browser.</text>
<g transform="translate(842 190)"><circle cx="120" cy="120" r="130" fill="#122143" stroke="#385383" stroke-width="1"/><path d="M28 179a108 108 0 1 1 184 0" fill="none" stroke="#243756" stroke-width="20" stroke-linecap="round"/><path d="M28 179a108 108 0 0 1 173-126" fill="none" stroke="#699bff" stroke-width="20" stroke-linecap="round"/><path d="m120 120 62-63" stroke="#fff" stroke-width="13" stroke-linecap="round"/><circle cx="120" cy="120" r="16" fill="#fff"/><text x="120" y="199" text-anchor="middle" font-family="DejaVu Sans,sans-serif" font-size="16" letter-spacing="3" fill="#a8b4cf">WEBGPU</text></g>
<path d="M65 496h1070" stroke="#29344b"/><text x="65" y="552" font-family="DejaVu Sans,sans-serif" font-size="18" fill="#c0cce1">LLM generation   /   Prompt processing   /   Embeddings</text><text x="1135" y="552" text-anchor="end" font-family="DejaVu Sans,sans-serif" font-size="18" fill="#8dafff">speedtest.maty.as</text></svg>`
await writeFile("public/brand/og-image.svg", og)
await sharp(Buffer.from(og)).png().toFile("public/brand/og-image.png")
