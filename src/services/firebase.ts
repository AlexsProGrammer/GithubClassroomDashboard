import { initializeApp } from 'firebase/app'
import {
  GithubAuthProvider,
  getAuth,
  signInWithPopup,
  type User,
} from 'firebase/auth'

function getRequiredEnv(name: string): string {
  const value = import.meta.env[name as keyof ImportMetaEnv]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

const firebaseConfig = {
  apiKey: getRequiredEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getRequiredEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getRequiredEnv('VITE_FIREBASE_PROJECT_ID'),
  appId: getRequiredEnv('VITE_FIREBASE_APP_ID'),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
}

export const firebaseApp = initializeApp(firebaseConfig)
export const firebaseAuth = getAuth(firebaseApp)

export async function signInWithGitHub(): Promise<{ user: User; accessToken: string }> {
  const provider = new GithubAuthProvider()
  const result = await signInWithPopup(firebaseAuth, provider)
  const credential = GithubAuthProvider.credentialFromResult(result)
  const accessToken = credential?.accessToken

  if (!accessToken) {
    throw new Error('GitHub access token could not be retrieved from Firebase result.')
  }

  return {
    user: result.user,
    accessToken,
  }
}
