Hier ist der detaillierte, ausführbare Bauplan (`IMPLEMENTATION.md`) für deinen AI-Engineer, basierend auf unserer Architekturentscheidung (100% Frontend, Firebase Auth Bridge, GitHub API, pnpm). 

Kopiere den folgenden Textblock und speichere ihn als `IMPLEMENTATION.md` in deinem Projektordner. Du kannst diesen Plan dann an deinen Coding-Agenten (z.B. Cursor, GitHub Copilot Workspace oder ein lokales LLM) übergeben.

***

```markdown
# IMPLEMENTATION.md

## 1. Project Context & Architecture
- **Goal:** Build a 100% serverless, frontend-only "Quest-Log" dashboard for 1st-semester university students. The application authenticates users via GitHub (using Firebase as a secure OAuth bridge), stores the access token ephemerally, and queries the GitHub REST API directly to fetch GitHub Classroom autograding results (workflow runs).
- **Tech Stack & Dependencies:**
  - **Framework:** React 18 + Vite + TypeScript
  - **Package Manager:** `pnpm`
  - **State Management:** `zustand` (configured with `sessionStorage`)
  - **Authentication:** `firebase` (Authentication module only)
  - **API Client:** `octokit` (Official GitHub REST SDK)
  - **Routing:** `react-router-dom`
  - **Styling/UI:** `tailwindcss`, `lucide-react`, `clsx`, `tailwind-merge` (shadcn/ui ecosystem)
  - **Initial Commands:** - `pnpm create vite quest-log --template react-ts`
    - `pnpm add firebase octokit zustand react-router-dom lucide-react clsx tailwind-merge`
    - `pnpm add -D tailwindcss postcss autoprefixer`
- **File Structure:**
  ```text
  ├── .env.local                  # Firebase config & GitHub Repo Owner name
  ├── index.html                  # Entry point with strict CSP meta tags
  ├── src/
  │   ├── main.tsx
  │   ├── App.tsx
  │   ├── components/
  │   │   ├── layout/             # Header, Navigation, Footer
  │   │   ├── ui/                 # Reusable shadcn/ui components (Cards, Buttons)
  │   │   └── quests/             # QuestCard, QuestList
  │   ├── pages/
  │   │   ├── Dashboard.tsx       # Main view (authenticated)
  │   │   ├── Login.tsx           # Landing page (unauthenticated)
  │   ├── services/
  │   │   ├── firebase.ts         # Firebase init and GitHub Auth Provider logic
  │   │   └── github.ts           # Octokit instance and API fetch calls
  │   ├── store/
  │   │   └── useAuthStore.ts     # Zustand store (sessionStorage persisted)
  │   └── types/
  │       └── index.ts            # TypeScript interfaces (Quest, User, WorkflowRun)
  ```
- **Attention Points:** - **Zero Data Persistence:** The GitHub access token MUST be stored in `sessionStorage` via Zustand's `persist` middleware, NEVER in `localStorage`.
  - **CSP:** A strict Content Security Policy must be enforced to mitigate XSS attacks.
  - **Rate Limits:** The GitHub API has rate limits; ensure responses are lightly cached in-memory and error boundaries are present to handle 403 Rate Limit Exceeded errors.

## 2. Execution Phases

#### Phase 1: Project Scaffolding & UI Foundation
- [x] **Step 1.1:** Initialize the Vite React TypeScript project using `pnpm`.
- [x] **Step 1.2:** Install and configure Tailwind CSS (`tailwind.config.js` and `index.css`).
- [x] **Step 1.3:** Setup basic React Router in `src/App.tsx` with two routes: `/login` and `/dashboard`.
- [x] **Step 1.4:** Create a basic Layout component (`src/components/layout/AppLayout.tsx`) with a top navigation bar.
- [x] **Verification:** Run `pnpm dev` and verify that navigating to `/login` and `/dashboard` renders the base layout without console errors.

#### Phase 2: Firebase Auth & State Management
- [x] **Step 2.1:** Create `src/services/firebase.ts`. Initialize Firebase using environment variables (`VITE_FIREBASE_API_KEY`, etc.).
- [x] **Step 2.2:** In `firebase.ts`, export a `signInWithGitHub` function that uses `signInWithPopup` and `GithubAuthProvider`. Extract the `credential.accessToken` from the result.
- [x] **Step 2.3:** Create `src/store/useAuthStore.ts` using Zustand. Define state for `user` (name, avatar), `githubToken`, and `isAuthenticated`. Wrap the store in `persist` middleware configured to use `createJSONStorage(() => sessionStorage)`.
- [x] **Step 2.4:** Implement the `Login.tsx` page with a "Login with GitHub" button that triggers `signInWithGitHub` and saves the token to the Zustand store.
- [x] **Verification:** Run `pnpm dev`. Click "Login with GitHub". Verify the popup opens, authenticates, and the `githubToken` successfully appears in the browser's Developer Tools -> Application -> Session Storage.

#### Phase 3: GitHub API Integration (Octokit)
- [x] **Step 3.1:** Create `src/services/github.ts`. Initialize an `Octokit` instance. Write a factory function that takes the `githubToken` from Zustand to authenticate Octokit.
- [x] **Step 3.2:** Implement `fetchUserClassroomRepos(username)`. Query the GitHub REST API (`GET /users/{username}/repos`) and filter for repositories matching the Classroom naming convention (e.g., prefix `Quest-`). add this to .env as config, allow no prefix to query all classrooms.
- [x] **Step 3.3:** Implement `fetchQuestStatus(owner, repo)`. Query `GET /repos/{owner}/{repo}/actions/runs`. Return the `conclusion` (success, failure, or null) of the latest workflow run.
- [x] **Verification:** Temporarily inject a valid GitHub token into the app. Call `fetchQuestStatus` in a `useEffect` and verify the console logs either `success` or `failure` matching the real GitHub Actions state of a test repository.

#### Phase 4: Dashboard & Quest UI Implementation
- [x] **Step 4.1:** Create static Quest definitions in `src/types/index.ts` (e.g., Array of objects containing `id`, `title`, `description`, `repoNameTemplate`).
- [x] **Step 4.2:** Create `src/components/quests/QuestCard.tsx`. It must accept Quest details and a `status` prop ('pending', 'success', 'failure') and render appropriate Tailwind styling/icons.
- [x] **Step 4.3:** Implement `Dashboard.tsx`. On mount, use Octokit to fetch the workflow statuses for all predefined Quests based on the logged-in user's GitHub username.
- [x] **Step 4.4:** Protect the `/dashboard` route. If `!isAuthenticated` in Zustand, redirect to `/login`.
- [x] **Step 4.5:** Implement a function `checkSolutionExists(questId)` using `octokit.rest.repos.getContent`. It should query the public solutions repository for a folder matching the `questId`. If it returns a 200 status, render the 'View Solution' button linking to `https://github.dev/{owner}/{solutions-repo}/tree/main/{questId}`. Catch 404 errors gracefully and hide the button.
- [x] **Verification:** Log in via the UI. Verify the Dashboard renders a list of QuestCards. Cards should display green checkmarks or red X's reflecting the live GitHub Actions status of the authenticated user's repositories.

#### Phase 5: Security & Deployment Prep
- [x] **Step 5.1:** Add a Content Security Policy (CSP) `<meta>` tag to `index.html` allowing scripts only from `'self'` and connections to `api.github.com` and `*.firebaseapp.com`.
- [x] **Step 5.2:** Add a "Logout" button to the Navbar that clears the Zustand store and calls Firebase `signOut()`.
- [x] **Step 5.3:** Implement an Error Boundary or UI toast to gracefully handle GitHub API rate limit errors (HTTP 403) instructing the user to try again later.
- [ ] **Verification:** Run `pnpm build` and `pnpm preview`. Test the logout flow (ensure session storage is wiped). Verify via browser network tab that CSP headers/meta tags are active and blocking unauthorized domains.

## 3. Global Testing Strategy
- **Ephemeral Token Test:** Log in, close the browser completely, and reopen it. The user MUST be logged out (verifying `sessionStorage` behavior).
- **Revoked Token Test:** Revoke the OAuth app access directly inside GitHub settings. Return to the dashboard and trigger an API call. Ensure the app catches the 401 Unauthorized error, clears the session, and redirects to `/login`.
- **Autograding Edge Case:** Ensure the UI gracefully handles the state where a student has cloned the repo but GitHub Actions hasn't finished running yet (status `in_progress` -> display a loading spinner on the Quest card).
```