Use MASTER_PROMPT.

Task: Fix frontend startup issues.

Goal:
Frontend must run at http://localhost:5173.

Requirements:
- Inspect frontend folder.
- Check package.json, Vite config, tsconfig, PostCSS, Tailwind, index.html, src files.
- Remove BOM / invalid syntax.
- Validate JSON.
- Reinstall dependencies only if needed.
- Run npm run dev.
- If still failing, return full error log.

Do not redesign UI.
Do not change backend unless absolutely necessary.
