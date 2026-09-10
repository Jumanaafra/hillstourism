import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Error: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be set.')
  process.exit(1)
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
})

const framesDir = path.resolve(__dirname, '../public/frames')
if (!fs.existsSync(framesDir)) {
  console.error('Frames directory not found:', framesDir)
  process.exit(1)
}

const files = fs.readdirSync(framesDir).filter(f => f.endsWith('.gif'))
console.log(`Found ${files.length} frames to migrate to Cloudinary folder "hills-tourism/hero"...`)

async function uploadFile(fileName) {
  const filePath = path.join(framesDir, fileName)
  const publicId = `hills-tourism/hero/${fileName.replace(/\.gif$/, '')}`

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder: 'hills-tourism/hero',
        public_id: fileName.replace(/\.gif$/, ''),
        overwrite: true,
        resource_type: 'image',
      },
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
}

async function runMigration() {
  let count = 0
  for (const file of files) {
    try {
      await uploadFile(file)
      count++
      if (count % 10 === 0 || count === files.length) {
        console.log(`Uploaded ${count}/${files.length} frames...`)
      }
    } catch (err) {
      console.error(`Failed to upload ${file}:`, err.message || err)
    }
  }
  console.log(`\nMigration completed! ${count}/${files.length} frames successfully migrated to Cloudinary.`)
}

runMigration()
