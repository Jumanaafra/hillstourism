/**
 * optimize-logo.mjs
 * Converts public/logo.png → public/logo.webp using Sharp.
 * Preserves transparency, dimensions, and visual quality.
 */
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const inputPath  = path.resolve('public/logo.png')
const outputPath = path.resolve('public/logo.webp')

const inputStat = fs.statSync(inputPath)
console.log(`Input:  logo.png  → ${(inputStat.size / 1024).toFixed(1)} KB`)

const meta = await sharp(inputPath).metadata()
console.log(`Dimensions: ${meta.width}x${meta.height}, format: ${meta.format}, hasAlpha: ${meta.hasAlpha}`)

// Convert to WebP with lossless mode for logos to preserve sharp edges.
// quality:90 with lossless:false is near-lossless and gives excellent compression.
await sharp(inputPath)
  .webp({
    quality: 90,
    lossless: false,
    effort: 6, // max compression effort (0=fast,6=best)
    alphaQuality: 100, // preserve full alpha
    nearLossless: true,
  })
  .toFile(outputPath)

const outputStat = fs.statSync(outputPath)
const reduction = ((1 - outputStat.size / inputStat.size) * 100).toFixed(1)

console.log(`Output: logo.webp → ${(outputStat.size / 1024).toFixed(1)} KB`)
console.log(`Reduction: ${reduction}% smaller`)
