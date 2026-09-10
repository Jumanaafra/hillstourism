import fs from 'fs'
import path from 'path'
import admin from 'firebase-admin'

// Import seed data
import { seedHotels, seedVehicles, seedPackages, seedCategories, seedExperiences, seedTestimonials, seedKnowledge, seedSiteSettings } from '../src/lib/repositories/seed.ts'
import { seedGalleryPhotos } from '../src/lib/repositories/gallery.repo.ts'
import { defaultSocialLinks } from '../src/lib/repositories/social.repo.ts'
import { defaultPageSEOList } from '../src/lib/repositories/seo.repo.ts'

const envLocalPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf8')
  for (let line of content.split('\n')) {
    line = line.trim()
    if (!line || line.startsWith('#')) continue
    const eqIdx = line.indexOf('=')
    if (eqIdx !== -1) {
      const key = line.slice(0, eqIdx).trim()
      let val = line.slice(eqIdx + 1).trim()
      if (!process.env[key]) process.env[key] = val
    }
  }
}

const projectId = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
let rawKey = process.env.FIREBASE_PRIVATE_KEY
let cleanedKey = rawKey ? rawKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n') : undefined

const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey: cleanedKey,
  }),
  projectId,
})

const db = admin.firestore()

console.log('--- SEEDING FIRESTORE COLLECTIONS (IF EMPTY) ---')

// 1. Hotels
const hotelsSnap = await db.collection('hotels').get()
console.log(`Current hotels in Firestore: ${hotelsSnap.size}`)
if (hotelsSnap.empty) {
  console.log(`Seeding ${seedHotels.length} hotels...`)
  const batch = db.batch()
  for (const h of seedHotels) {
    batch.set(db.collection('hotels').doc(h.id), h)
  }
  await batch.commit()
  console.log('✅ Hotels seeded successfully.')
}

// 2. Vehicles
const vehiclesSnap = await db.collection('vehicles').get()
console.log(`Current vehicles in Firestore: ${vehiclesSnap.size}`)
if (vehiclesSnap.empty) {
  console.log(`Seeding ${seedVehicles.length} vehicles...`)
  const batch = db.batch()
  for (const v of seedVehicles) {
    batch.set(db.collection('vehicles').doc(v.id), v)
  }
  await batch.commit()
  console.log('✅ Vehicles seeded successfully.')
}

// 3. Gallery
const gallerySnap = await db.collection('gallery').get()
console.log(`Current gallery photos in Firestore: ${gallerySnap.size}`)
if (gallerySnap.empty) {
  console.log(`Seeding ${seedGalleryPhotos.length} gallery photos...`)
  const batch = db.batch()
  for (const g of seedGalleryPhotos) {
    batch.set(db.collection('gallery').doc(g.id), g)
  }
  await batch.commit()
  console.log('✅ Gallery photos seeded successfully.')
}

// 4. Social Links
const socialSnap = await db.collection('social_links').get()
console.log(`Current social links in Firestore: ${socialSnap.size}`)
if (socialSnap.empty) {
  console.log(`Seeding ${defaultSocialLinks.length} social links...`)
  const batch = db.batch()
  for (const s of defaultSocialLinks) {
    batch.set(db.collection('social_links').doc(s.id), s)
  }
  await batch.commit()
  console.log('✅ Social links seeded successfully.')
}

// 5. SEO Pages
const seoSnap = await db.collection('seo_pages').get()
console.log(`Current SEO pages in Firestore: ${seoSnap.size}`)
if (seoSnap.empty) {
  console.log(`Seeding ${defaultPageSEOList.length} SEO pages...`)
  const batch = db.batch()
  for (const p of defaultPageSEOList) {
    batch.set(db.collection('seo_pages').doc(p.id), p)
  }
  await batch.commit()
  console.log('✅ SEO pages seeded successfully.')
}

// 6. Packages
const pkgSnap = await db.collection('packages').get()
console.log(`Current packages in Firestore: ${pkgSnap.size}`)
// Also ensure seed packages exist if missing
const existingPkgIds = new Set(pkgSnap.docs.map(d => d.id))
const missingPackages = seedPackages.filter(p => !existingPkgIds.has(p.id))
if (missingPackages.length > 0) {
  console.log(`Adding ${missingPackages.length} default packages to Firestore...`)
  const batch = db.batch()
  for (const p of missingPackages) {
    batch.set(db.collection('packages').doc(p.id), p)
  }
  await batch.commit()
  console.log('✅ Default packages added successfully.')
}

// 7. Categories
const catSnap = await db.collection('categories').get()
if (catSnap.empty) {
  console.log(`Seeding ${seedCategories.length} categories...`)
  const batch = db.batch()
  for (const c of seedCategories) {
    batch.set(db.collection('categories').doc(c.id), c)
  }
  await batch.commit()
  console.log('✅ Categories seeded.')
}

// 8. Experiences
const expSnap = await db.collection('experiences').get()
if (expSnap.empty) {
  console.log(`Seeding ${seedExperiences.length} experiences...`)
  const batch = db.batch()
  for (const e of seedExperiences) {
    batch.set(db.collection('experiences').doc(e.id), e)
  }
  await batch.commit()
  console.log('✅ Experiences seeded.')
}

// 9. Testimonials
const testSnap = await db.collection('testimonials').get()
if (testSnap.empty) {
  console.log(`Seeding ${seedTestimonials.length} testimonials...`)
  const batch = db.batch()
  for (const t of seedTestimonials) {
    batch.set(db.collection('testimonials').doc(t.id), t)
  }
  await batch.commit()
  console.log('✅ Testimonials seeded.')
}

// 10. Site Settings
const settingsDoc = await db.collection('siteSettings').doc('general').get()
if (!settingsDoc.exists) {
  console.log('Seeding general site settings...')
  await db.collection('siteSettings').doc('general').set(seedSiteSettings)
  console.log('✅ Site settings seeded.')
}

console.log('\n--- VERIFICATION OF FIRESTORE READS ---')
const finalHotels = await db.collection('hotels').get()
const finalVehicles = await db.collection('vehicles').get()
const finalGallery = await db.collection('gallery').get()
const finalPackages = await db.collection('packages').get()
const finalSocial = await db.collection('social_links').get()
const finalSeo = await db.collection('seo_pages').get()

console.log(`Hotels in Firestore: ${finalHotels.size}`)
console.log(`Vehicles in Firestore: ${finalVehicles.size}`)
console.log(`Gallery photos in Firestore: ${finalGallery.size}`)
console.log(`Packages in Firestore: ${finalPackages.size}`)
console.log(`Social links in Firestore: ${finalSocial.size}`)
console.log(`SEO pages in Firestore: ${finalSeo.size}`)
console.log('\nAll Firestore collections are populated and readable!')
