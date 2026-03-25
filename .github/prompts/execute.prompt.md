---
mode: agent
agent: Engineer
description: Execute implementation checklist tasks incrementally with validation.
---

Read `IMPLEMENTATION.md` and execute the first unchecked `[ ]` step.

Loop protocol:
1. Implement only that single step.
2. Run the verification commands required by that step/phase.
3. If verification passes, mark the step as `[x]`.
4. Continue with the next unchecked step.
5. Stop only when all checklist items are complete.

Mandatory directive:
Upon completing the final phase of any plan, you MUST automatically bump the semantic version in the relevant configuration file (e.g., package.json) and add a bulleted summary of changes to `CHANGELOG.md`.

Constraints:
- Do not skip steps.
- Do not batch multiple unchecked steps in one iteration unless explicitly requested.
- Apply minimal, localized edits.
