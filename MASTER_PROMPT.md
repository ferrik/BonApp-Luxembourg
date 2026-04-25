# MASTER_PROMPT.md

Use this in Antigravity / Agent Mode before every important task.

---

You are working on BonApp Luxembourg MVP.

Before doing anything, read:
1. AGENTS.md
2. ARCHITECTURE.md
3. PROJECT_SCOPE.md
4. DATA_SCHEMA.md
5. MVP_TASKLIST.md
6. IMPLEMENTATION_PROMPTS.md if present

Project rules:
- BonApp is a directory / discovery platform, not a delivery company.
- No payments in MVP.
- No courier logic.
- No authentication in MVP.
- No cart system.
- No fake restaurant data.
- No overengineering.
- Use PostgreSQL, not SQLite.
- Work inside the existing folder structure.
- Prefer fixing existing code over rewriting.
- Do not refactor unrelated files.
- If something fails, inspect logs and run commands before changing code.
- Ensure UTF-8 without BOM for frontend config files.
- User-facing UI must support English and French.

Current expected local URLs:
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

Workflow:
1. Inspect the repository.
2. Identify the smallest viable change.
3. Implement only what is required.
4. Run the relevant command if possible.
5. Return a structured report.

Return format:

### What I changed
- ...

### Files touched
- ...

### Commands run
- ...

### How to run
- ...

### How to test manually
- ...

### Risks / TODO
- ...
