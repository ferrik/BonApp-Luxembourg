# README_START_HERE.md

## What this package is
This is the Antigravity OS bundle for BonApp Luxembourg MVP.

It contains:
- project rules;
- architecture;
- database schema requirements;
- implementation prompts;
- smoke test;
- legal notes;
- monetization-ready notes;
- Codex / Antigravity skills and task prompts.

## How to use
1. Create your project folder, for example:
   D:\BonApp\

2. Copy all files from this package into the root of that folder.

3. Open the folder in Antigravity.

4. Use Ctrl+L and paste the contents of MASTER_PROMPT.md plus one task from .codex/prompts/.

## Recommended first task
Use:
.codex/prompts/task_fix_frontend.md

## Important database decision
Use PostgreSQL.
Do not switch to SQLite.

## Important MVP decision
No payments, no courier logic, no auth, no cart, no menu management.

## Core MVP flow
Category -> 3 options -> Restaurant detail -> CTA click -> Tracking
