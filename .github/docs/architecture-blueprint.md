# Architecture Blueprint

## Current Repository Topology (Detected)
- This repository currently contains planning documentation only.
- Active artifact:
  - `IMPLEMENTATION.md`: system plan and phased delivery checklist.

## Mapping for This Repo Today
- Business logic location:
  - Not implemented yet.
  - Temporary source of truth is the execution logic described in `IMPLEMENTATION.md` phases.
- Routes location:
  - Not implemented yet.
  - Planned route layer in `src/App.tsx` and route pages in `src/pages/`.
- UI components location:
  - Not implemented yet.
  - Planned UI and layout components in `src/components/`.

## Planned 2026 Agent-Oriented Frontend Layout
- `src/services/`: side-effect and integration boundary (Firebase/Auth, GitHub API).
- `src/store/`: session-scoped client state and auth/session orchestration.
- `src/pages/`: route-level composition and data-fetch orchestration.
- `src/components/ui/`: reusable presentational primitives.
- `src/components/quests/`: domain views for quest status rendering.
- `src/types/`: shared domain contracts and API response typing.

## Implementation Rule
- Do not place network and auth logic directly inside route components.
- Keep domain behavior in services/store, and keep route/page files orchestration-focused.
