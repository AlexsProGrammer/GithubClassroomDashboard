import type { ClassroomQuest } from '../../types'

export type QuestCardStatus = 'pending' | 'success' | 'failure'

type QuestCardProps = {
  quest: ClassroomQuest
  status: QuestCardStatus
  solutionUrl?: string
}

const statusStyles: Record<QuestCardStatus, string> = {
  pending: 'border-slate-200 bg-white text-slate-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  failure: 'border-rose-200 bg-rose-50 text-rose-900',
}

const statusLabel: Record<QuestCardStatus, string> = {
  pending: 'Pending',
  success: 'Passed',
  failure: 'Failed',
}

function StatusIcon({ status }: { status: QuestCardStatus }) {
  if (status === 'success') {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 text-emerald-600">
        <path
          fill="currentColor"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.53-9.97a.75.75 0 0 0-1.06-1.06L9 10.44 7.53 8.97a.75.75 0 1 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l4-4Z"
        />
      </svg>
    )
  }

  if (status === 'failure') {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 text-rose-600">
        <path
          fill="currentColor"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm2.53-10.47a.75.75 0 0 0-1.06-1.06L10 7.94 8.53 6.47a.75.75 0 1 0-1.06 1.06L8.94 9l-1.47 1.47a.75.75 0 1 0 1.06 1.06L10 10.06l1.47 1.47a.75.75 0 0 0 1.06-1.06L11.06 9l1.47-1.47Z"
        />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 text-slate-400">
      <path
        fill="currentColor"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-10.75a.75.75 0 0 1 .75.75v2.75a.75.75 0 0 1-1.5 0V8a.75.75 0 0 1 .75-.75Zm0 6a.88.88 0 1 1 0-1.75.88.88 0 0 1 0 1.75Z"
      />
    </svg>
  )
}

export function QuestCard({ quest, status, solutionUrl }: QuestCardProps) {
  return (
    <article className={`rounded-lg border p-5 shadow-sm ${statusStyles[status]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold leading-tight">{quest.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{quest.description}</p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold">
          <StatusIcon status={status} />
          <span>{statusLabel[status]}</span>
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Repository: <span className="font-medium">{quest.repoOwner}/{quest.repoName}</span>
      </p>
      {solutionUrl ? (
        <a
          className="mt-4 inline-flex rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
          href={solutionUrl}
          target="_blank"
          rel="noreferrer"
        >
          View Solution
        </a>
      ) : null}
    </article>
  )
}