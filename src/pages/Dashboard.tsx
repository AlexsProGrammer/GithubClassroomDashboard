import { useEffect, useState } from 'react'

import {
  checkSolutionExists,
  fetchAuthenticatedUsername,
  fetchUserClassroomRepos,
  fetchQuestStatus,
  getSolutionLink,
} from '../services/github'
import { QuestCard, type QuestCardStatus } from '../components/quests/QuestCard'
import { useAuthStore } from '../store/useAuthStore'
import type { ClassroomQuest } from '../types'

function formatTitleFromRepoName(repoName: string): string {
  return repoName
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export default function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const [quests, setQuests] = useState<ClassroomQuest[]>([])
  const [questStatuses, setQuestStatuses] = useState<Record<string, QuestCardStatus>>({})
  const [solutionLinks, setSolutionLinks] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const username = await fetchAuthenticatedUsername()
        const classroomRepos = await fetchUserClassroomRepos(username)

        const fetchedQuests: ClassroomQuest[] = classroomRepos.map((repo) => ({
          id: String(repo.id),
          title: formatTitleFromRepoName(repo.name),
          description: `Live repository from GitHub Classroom: ${repo.name}`,
          repoName: repo.name,
          repoOwner: repo.owner.login,
        }))

        setQuests(fetchedQuests)

        if (fetchedQuests.length === 0) {
          setQuestStatuses({})
          setSolutionLinks({})
          return
        }

        const entries = await Promise.all(
          fetchedQuests.map(async (quest) => {
            try {
              const conclusion = await fetchQuestStatus(quest.repoOwner, quest.repoName)
              const status: QuestCardStatus = conclusion === 'success'
                ? 'success'
                : conclusion === 'failure'
                  ? 'failure'
                  : 'pending'

              return [quest.id, status] as const
            } catch (error) {
              console.error(
                `[Dashboard] Failed to fetch workflow status for ${quest.repoOwner}/${quest.repoName}:`,
                error,
              )
              return [quest.id, 'pending'] as const
            }
          }),
        )

        const solutions = await Promise.all(
          fetchedQuests.map(async (quest) => {
            try {
              const exists = await checkSolutionExists(quest.repoName)
              const url = exists ? getSolutionLink(quest.repoName) : null

              return url ? [quest.id, url] as const : null
            } catch (error) {
              console.error(`[Dashboard] Failed to check solution for ${quest.id}:`, error)
              return null
            }
          }),
        )

        setQuestStatuses(Object.fromEntries(entries))
        setSolutionLinks(Object.fromEntries(solutions.filter((value) => value !== null)))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setErrorMessage(`Failed to load quest statuses: ${message}`)
        console.error('[Dashboard] Failed to load quest statuses:', error)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-700">
          Active login: <span className="font-medium">{user?.name ?? 'GitHub User'}</span>
        </p>
        {isLoading ? <p className="mt-2 text-sm text-slate-600">Loading quest statuses...</p> : null}
        {errorMessage ? <p className="mt-2 text-sm text-rose-600">{errorMessage}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {quests.map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            status={questStatuses[quest.id] ?? 'pending'}
            solutionUrl={solutionLinks[quest.id]}
          />
        ))}
      </div>

      {!isLoading && !errorMessage && quests.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          No classroom repositories found. Check your environment variables for classroom owner and prefix.
        </p>
      ) : null}
    </section>
  )
}
