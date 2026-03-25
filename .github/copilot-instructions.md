# Copilot Instructions (Repository Routing)

## Detected Stack (Phase 1 Result)
- Repository state: documentation-only bootstrap repository
- Primary language in codebase: Markdown
- Application framework: not initialized yet
- Package manager: not initialized yet
- Testing framework: not configured
- Linting tools: not configured
- Planned target stack from `IMPLEMENTATION.md`: React 18 + Vite + TypeScript + pnpm, Tailwind CSS, Zustand, Firebase Auth, Octokit

## Routing Rules
- If the task is architecture/planning/checklist design, update `IMPLEMENTATION.md` first.
- If the task is implementation, follow `IMPLEMENTATION.md` phases strictly and execute only the first unchecked item unless explicitly asked otherwise.
- Prefer minimal, focused edits. Do not refactor unrelated areas.

## Coding Standards
- Current repository standard:
  - Keep documents concise, deterministic, and executable.
  - Use stable headings and checkbox-based phase steps.
- When TypeScript app code is introduced:
  - Enforce TypeScript strict mode (`"strict": true`).
  - Prefer explicit types on exported APIs.
  - Keep side effects isolated in service layers.
  - Keep UI components presentational; place network calls in services.
  - Validate all environment variable usage at startup.
  - Follow Tailwind utility composition with predictable class merging.

## Verification Commands
- Current repository (now):
  - `ls -la .github`
  - `test -f IMPLEMENTATION.md`
- Once the planned frontend stack is initialized:
  - `pnpm install`
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm build`

## Safety Constraints
- Never persist OAuth access tokens in `localStorage`; allow session-only storage.
- Keep auth/session handling explicit and testable.
- Surface rate-limit and auth failures with clear recovery paths.
