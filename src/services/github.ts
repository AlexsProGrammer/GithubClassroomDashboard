import { Octokit } from 'octokit'

import { useAuthStore } from '../store/useAuthStore'

type GitHubRepo = {
  id: number
  name: string
  full_name: string
  html_url: string
  private: boolean
  owner: {
    login: string
  }
}

export type QuestStatusConclusion = 'success' | 'failure' | null

function getClassroomRepoPrefix(): string {
  const value = import.meta.env[
    'VITE_GITHUB_CLASSROOM_REPO_PREFIX' as keyof ImportMetaEnv
  ]

  if (typeof value !== 'string') {
    return ''; // 'Quest-'
  }

  return value.trim()
}

export function createGitHubClient(githubToken: string): Octokit {
  if (!githubToken.trim()) {
    throw new Error('GitHub token is required to create an authenticated Octokit client.')
  }

  return new Octokit({ auth: githubToken })
}

export function createGitHubClientFromStore(): Octokit {
  const { githubToken } = useAuthStore.getState()

  if (!githubToken) {
    throw new Error('No GitHub token found in auth store. Please sign in first.')
  }

  return createGitHubClient(githubToken)
}

export async function fetchUserClassroomRepos(username: string): Promise<GitHubRepo[]> {
  const trimmedUsername = username.trim()

  if (!trimmedUsername) {
    throw new Error('Username is required to fetch GitHub repositories.')
  }

  const octokit = createGitHubClientFromStore()
  const repoPrefix = getClassroomRepoPrefix()

  const repos = await octokit.paginate(octokit.rest.repos.listForUser, {
    username: trimmedUsername,
    per_page: 100,
    sort: 'updated',
    direction: 'desc',
  })

  const normalizedPrefix = repoPrefix.toLowerCase()

  if (!normalizedPrefix) {
    return repos
  }

  return repos.filter((repo) => repo.name.toLowerCase().startsWith(normalizedPrefix))
}

export async function fetchQuestStatus(
  owner: string,
  repo: string,
): Promise<QuestStatusConclusion> {
  const trimmedOwner = owner.trim()
  const trimmedRepo = repo.trim()

  if (!trimmedOwner || !trimmedRepo) {
    throw new Error('Owner and repository are required to fetch quest status.')
  }

  const octokit = createGitHubClientFromStore()
  const response = await octokit.rest.actions.listWorkflowRunsForRepo({
    owner: trimmedOwner,
    repo: trimmedRepo,
    per_page: 1,
  })

  const latestRun = response.data.workflow_runs[0]
  const conclusion = latestRun?.conclusion

  if (conclusion === 'success') {
    return 'success'
  }

  if (conclusion === 'failure') {
    return 'failure'
  }

  return null
}