import admin from 'firebase-admin'

let initializedAdmin: typeof admin | null = null

export function getFirebaseAdmin() {
  if (initializedAdmin) {
    return initializedAdmin
  }

  if (admin.apps.length > 0) {
    initializedAdmin = admin
    return initializedAdmin
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  let privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (privateKey) {
    // Handle escaped newlines in environment variable
    privateKey = privateKey.replace(/\\n/g, '\n')
  }

  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      })
      initializedAdmin = admin
      console.log('[Firebase Admin] Initialized successfully with service account.')
      return initializedAdmin
    } catch (err) {
      console.warn('[Firebase Admin] Failed to initialize with provided credentials:', err)
      return null
    }
  }

  // If application default credentials or local emulator is available
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    try {
      admin.initializeApp({ projectId: projectId || 'hillstourism-dev' })
      initializedAdmin = admin
      console.log('[Firebase Admin] Initialized with Firestore emulator.')
      return initializedAdmin
    } catch (err) {
      console.warn('[Firebase Admin] Failed to initialize emulator:', err)
      return null
    }
  }

  return null
}

export function getFirestoreDB() {
  const adminApp = getFirebaseAdmin()
  if (adminApp) {
    return adminApp.firestore()
  }
  return null
}
