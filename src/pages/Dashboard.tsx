import { useEffect, useState } from 'react'

import {
  fetchQuestStatus,
  type QuestStatusConclusion,
} from '../services/github'
import { useAuthStore } from '../store/useAuthStore'

function getVerificationTarget(): { owner: string; repo: string } {
  const owner = String(
    import.meta.env['VITE_GITHUB_VERIFY_OWNER' as keyof ImportMetaEnv] ?? '',
  ).trim()
  const repo = String(
    import.meta.env['VITE_GITHUB_VERIFY_REPO' as keyof ImportMetaEnv] ?? '',
  ).trim()

  return { owner, repo }
}

export default function Dashboard() {
  const { owner, repo } = getVerificationTarget()
  const missingVerificationTarget = !owner || !repo
  const missingTargetMessage =
    'Phase 3 verification target missing. Set VITE_GITHUB_VERIFY_OWNER and VITE_GITHUB_VERIFY_REPO in .env.local.'

  const user = useAuthStore((state) => state.user)
  const [verificationStatus, setVerificationStatus] = useState<QuestStatusConclusion>(null)
  const [verificationMessage, setVerificationMessage] = useState(
    missingVerificationTarget ? missingTargetMessage : 'Running API verification...',
  )

  useEffect(() => {
    if (missingVerificationTarget) {
      console.info('[Phase 3 Verification] Skipped: missing VITE_GITHUB_VERIFY_OWNER or VITE_GITHUB_VERIFY_REPO.')
      return
    }

    void (async () => {
      try {
        const status = await fetchQuestStatus(owner, repo)
        setVerificationStatus(status)
        setVerificationMessage(`Latest workflow conclusion for ${owner}/${repo}: ${status ?? 'null'}`)

        console.log(`[Phase 3 Verification] fetchQuestStatus(${owner}, ${repo}) ->`, status)
        if (status === 'success') {
          console.log('[Phase 3 Verification] SUCCESS check passed.')
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setVerificationMessage(`Phase 3 verification failed: ${message}`)
        console.error('[Phase 3 Verification] fetchQuestStatus failed:', error)
      }
    })()
  }, [missingVerificationTarget, owner, repo])

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-slate-700">
        Active login: <span className="font-medium">{user?.name ?? 'GitHub User'}</span>
      </p>
      <p className="text-sm text-slate-600">{verificationMessage}</p>
      <p className="text-sm text-slate-600">
        Verification status: <span className="font-medium">{verificationStatus ?? 'null'}</span>
      </p>
    </section>
  )
}
