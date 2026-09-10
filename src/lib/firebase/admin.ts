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
    // Handle surrounding quotes and escaped newlines in environment variable
    privateKey = privateKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n')
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

export function isFirestoreConfigured(): boolean {
  if (process.env.DISABLE_FIRESTORE === 'true') {
    return false
  }
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  )
}

/**
 * Determines whether in-memory fallback is allowed.
 * - In production: STRICTLY FALSE. Any Firestore error must bubble up as a controlled error.
 * - In tests: TRUE (for Vitest offline unit testing).
 * - In development: TRUE only if Firebase credentials are not provided or if ENABLE_DEV_MEMORY_FALLBACK=true.
 */
export function allowMemoryFallback(): boolean {
  if (process.env.NODE_ENV === 'test') {
    return true
  }
  if (process.env.NODE_ENV === 'production') {
    return false
  }
  if (!isFirestoreConfigured() || process.env.ENABLE_DEV_MEMORY_FALLBACK === 'true') {
    return true
  }
  return false
}

export const FIRESTORE_TIMEOUT_MS = 15000

/**
 * Executes a Firestore promise with a sensible database timeout (default 15000ms / 15s).
 * Allows cold-start TLS/OAuth2/gRPC handshakes (~2-5s, up to 10s during heavy CPU builds)
 * to complete normally while protecting against indefinite gRPC hangs.
 */
export async function withFirestoreTimeout<T>(
  operation: Promise<T>,
  timeoutOrName: number | string = FIRESTORE_TIMEOUT_MS,
  nameOrTimeout?: string | number
): Promise<T> {
  let timeoutMs = FIRESTORE_TIMEOUT_MS
  let operationName = 'Firestore query'

  if (typeof timeoutOrName === 'number') {
    timeoutMs = timeoutOrName
    if (typeof nameOrTimeout === 'string') operationName = nameOrTimeout
  } else if (typeof timeoutOrName === 'string') {
    operationName = timeoutOrName
    if (typeof nameOrTimeout === 'number') timeoutMs = nameOrTimeout
  }

  let timer: NodeJS.Timeout
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`[Firestore Timeout] ${operationName} timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  try {
    const result = await Promise.race([operation, timeoutPromise])
    clearTimeout(timer!)
    return result
  } catch (err) {
    clearTimeout(timer!)
    throw err
  }
}

export function getFirestoreDB() {
  if (process.env.DISABLE_FIRESTORE === 'true') {
    return null
  }

  const adminApp = getFirebaseAdmin()
  if (adminApp) {
    return adminApp.firestore()
  }
  return null
}
