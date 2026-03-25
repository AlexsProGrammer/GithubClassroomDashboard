---
mode: agent
agent: Engineer
description: Apply the minimal verified fix for a concrete runtime or test failure.
---

Read the terminal error output and identify the failing file and failure cause.

Execution protocol:
1. Reproduce or target the exact failing command.
2. Locate the precise failure point.
3. Apply the minimal fix that resolves the error.
4. Re-run the failing command or test.
5. Confirm the failure is resolved before stopping.

Constraints:
- No speculative refactors.
- No broad cleanup unrelated to the active failure.
- Keep fixes narrowly scoped and test-verified.
