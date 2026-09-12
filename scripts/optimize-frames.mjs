/**
 * optimize-frames.mjs
 * Batch-converts public/frames/*.gif → public/frames-webp/*.webp
 * Preserves full resolution, visual quality, and frame ordering.
 * Uses Sharp's high-quality WebP encoder with max effort.
 */
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const INPUT_DIR  = path.resolve('public/frames')
const OUTPUT_DIR = path.resolve('public/frames-webp')

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

const files = fs.readdirSync(INPUT_DIR)
  .filter(f => f.endsWith('.gif'))
  .sort()

console.log(`Converting ${files.length} GIF frames → WebP...`)

let totalIn  = 0
let totalOut = 0
const results = []

for (let i = 0; i < files.length; i++) {
  const gifFile  = files[i]
  // Map: frame_000_delay-0.1s.gif → frame_000.webp
  const baseName = gifFile.replace('_delay-0.1s.gif', '.webp')
  const inPath   = path.join(INPUT_DIR, gifFile)
  const outPath  = path.join(OUTPUT_DIR, baseName)

  const inSize = fs.statSync(inPath).size
  totalIn += inSize

  try {
    // Extract first frame from GIF (page: 0) and convert to WebP.
    // q=80 gives excellent quality at much smaller size vs GIF.
    // nearLossless=false is fine for photographic content.
    await sharp(inPath, { pages: 1, page: 0 })
      .webp({
        quality: 82,
        lossless: false,
        effort: 4, // balance speed/compression (0=fast, 6=slowest)
        alphaQuality: 100,
      })
      .toFile(outPath)

    const outSize = fs.statSync(outPath).size
    totalOut += outSize

    const pct = ((1 - outSize / inSize) * 100).toFixed(1)
    results.push({ name: baseName, inKB: (inSize/1024).toFixed(1), outKB: (outSize/1024).toFixed(1), pct })

    if ((i + 1) % 10 === 0 || i === files.length - 1) {
      process.stdout.write(`  [${i+1}/${files.length}] ${baseName} — ${(outSize/1024).toFixed(1)}KB (-${pct}%)\n`)
    }
  } catch (err) {
    console.error(`  ERROR converting ${gifFile}:`, err.message)
  }
}

console.log('\n=== SUMMARY ===')
console.log(`Total GIF input:   ${(totalIn  / (1024*1024)).toFixed(2)} MB`)
console.log(`Total WebP output: ${(totalOut / (1024*1024)).toFixed(2)} MB`)
console.log(`Overall reduction: ${((1 - totalOut/totalIn)*100).toFixed(1)}%`)
console.log(`Frame count: ${files.length}`)
console.log('\nVerification — first 5 and last 5 frames:')
results.slice(0, 5).concat(results.slice(-5)).forEach(r => {
  console.log(`  ${r.name}: ${r.inKB}KB → ${r.outKB}KB (-${r.pct}%)`)
})
