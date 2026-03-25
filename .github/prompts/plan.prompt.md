---
mode: agent
agent: Architect
description: Generate or refresh an execution-ready implementation checklist.
---

Read the user request and the current repository state, then generate a strict, checkbox-based `IMPLEMENTATION.md`.

Requirements:
- Organize the plan into distinct phases.
- Use atomic, testable checklist steps under each phase.
- Include explicit verification commands for each phase.
- Keep scope aligned to discovered stack and existing files only.
- Keep language concise, technical, and execution oriented.
