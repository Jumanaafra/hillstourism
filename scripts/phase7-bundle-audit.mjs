import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const staticRoot = join(root, '.next', 'static')

function jsFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? jsFiles(path) : entry.name.endsWith('.js') ? [path] : []
  })
}

const files = jsFiles(staticRoot)
const markers = [
  'firebase-admin',
  'googleapis',
  '@google/generative-ai',
  'ADMIN_ACCESS_TOKEN',
  'RESEND_API_KEY',
  'GEMINI_API_KEY',
  'GOOGLE_SERVICE_ACCOUNT',
  'CLOUDINARY_API_SECRET',
]
const hits = Object.fromEntries(markers.map(marker => [marker, []]))

for (const file of files) {
  const contents = readFileSync(file, 'utf8')
  for (const marker of markers) {
    if (contents.includes(marker)) hits[marker].push(relative(root, file))
  }
}

console.log('Largest emitted client JS files (raw size):')
for (const file of [...files].sort((a, b) => statSync(b).size - statSync(a).size).slice(0, 12)) {
  console.log(`${(statSync(file).size / 1024).toFixed(1)} KiB  ${relative(root, file)}`)
}
console.log('\nClient files containing server-only package or credential-name markers:')
for (const [marker, matchingFiles] of Object.entries(hits)) {
  console.log(`${marker}: ${matchingFiles.length}`)
}
