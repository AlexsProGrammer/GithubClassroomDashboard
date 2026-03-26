import { initializeApp } from 'firebase/app'
import {
  GithubAuthProvider,
  getAuth,
  signOut,
  signInWithPopup,
  type User,
} from 'firebase/auth'

type GitHubSignInOptions = {
  forceAccountSelection?: boolean
}

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

export function getReadableAuthError(error: unknown): string {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return error instanceof Error ? error.message : 'Login failed'
  }

  const code = (error as { code?: unknown }).code

  if (code === 'auth/account-exists-with-different-credential') {
    return 'This email is already linked to a different sign-in method in Firebase. Try another GitHub account, or change Firebase Auth setting to allow multiple accounts with the same email.'
  }

  if (code === 'auth/popup-closed-by-user') {
    return 'Login popup was closed before completion.'
  }

  if (code === 'auth/cancelled-popup-request') {
    return 'A previous login popup was cancelled. Please try again.'
  }

  return error instanceof Error ? error.message : 'Login failed'
}

export async function signInWithGitHub(
  options: GitHubSignInOptions = {},
): Promise<{ user: User; accessToken: string }> {
  const provider = new GithubAuthProvider()

  provider.setCustomParameters(
    options.forceAccountSelection
      ? { allow_signup: 'true', prompt: 'select_account' }
      : { allow_signup: 'true' },
  )

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

export async function signOutFromFirebase(): Promise<void> {
  await signOut(firebaseAuth)
}
