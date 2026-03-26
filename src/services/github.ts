import { Octokit } from 'octokit'

import { useAuthStore } from '../store/useAuthStore'

export type GitHubRepo = {
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

export type HeadCommitInfo = {
  sha: string
  authorName: string
  authorEmail: string | null
  authoredAt: string | null
  message: string
  url: string
}

type SolutionsRepoConfig = {
  owner: string
  repo: string
}

function getClassroomRepoPrefix(): string {
  const value = import.meta.env[
    'VITE_GITHUB_CLASSROOM_REPO_PREFIX' as keyof ImportMetaEnv
  ]

  if (typeof value !== 'string') {
    return ''; // 'Quest-'
  }

  return value.trim()
}

function getClassroomRepoOwner(): string {
  const value = import.meta.env[
    'VITE_GITHUB_CLASSROOM_OWNER' as keyof ImportMetaEnv
  ]

  if (typeof value !== 'string') {
    return ''
  }

  return value.trim()
}

function getSolutionsRepoConfig(): SolutionsRepoConfig | null {
  const owner = String(
    import.meta.env['VITE_GITHUB_SOLUTIONS_OWNER' as keyof ImportMetaEnv] ?? '',
  ).trim()
  const repo = String(
    import.meta.env['VITE_GITHUB_SOLUTIONS_REPO' as keyof ImportMetaEnv] ?? '',
  ).trim()

  if (!owner || !repo) {
    return null
  }

  return { owner, repo }
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
  const classroomOwner = getClassroomRepoOwner().toLowerCase()

  const repos = await octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
    per_page: 100,
    sort: 'updated',
    direction: 'desc',
    affiliation: 'owner,collaborator,organization_member',
  })

  const ownRepos = repos.filter((repo) => {
    if (!classroomOwner) {
      return true
    }

    return repo.owner.login.toLowerCase() === classroomOwner
  })

  const normalizedPrefix = repoPrefix.toLowerCase()

  if (!normalizedPrefix) {
    return ownRepos
  }

  return ownRepos.filter((repo) => repo.name.toLowerCase().startsWith(normalizedPrefix))
}

export async function fetchAuthenticatedUsername(): Promise<string> {
  const octokit = createGitHubClientFromStore()
  const response = await octokit.rest.users.getAuthenticated()
  return response.data.login
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

export async function fetchHeadCommit(
  owner: string,
  repo: string,
): Promise<HeadCommitInfo | null> {
  const trimmedOwner = owner.trim()
  const trimmedRepo = repo.trim()

  if (!trimmedOwner || !trimmedRepo) {
    throw new Error('Owner and repository are required to fetch head commit.')
  }

  const octokit = createGitHubClientFromStore()
  const response = await octokit.rest.repos.listCommits({
    owner: trimmedOwner,
    repo: trimmedRepo,
    per_page: 1,
  })

  const headCommit = response.data[0]

  if (!headCommit) {
    return null
  }

  return {
    sha: headCommit.sha,
    authorName:
      headCommit.commit.author?.name ?? headCommit.author?.login ?? 'Unknown Author',
    authorEmail: headCommit.commit.author?.email ?? null,
    authoredAt: headCommit.commit.author?.date ?? null,
    message: headCommit.commit.message,
    url: headCommit.html_url,
  }
}

export function getSolutionLink(questId: string): string | null {
  const config = getSolutionsRepoConfig()

  if (!config) {
    return null
  }

  return `https://github.dev/${config.owner}/${config.repo}/tree/main/${questId}`
}

export async function checkSolutionExists(questId: string): Promise<boolean> {
  const config = getSolutionsRepoConfig()

  if (!config) {
    return false
  }

  const octokit = createGitHubClientFromStore()

  try {
    const response = await octokit.rest.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path: questId,
      ref: 'main',
    })

    return response.status === 200
  } catch (error) {
    const status = typeof error === 'object' && error !== null && 'status' in error
      ? (error as { status?: number }).status
      : undefined

    if (status === 404) {
      return false
    }

    throw error
  }
}