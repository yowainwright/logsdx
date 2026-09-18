# Agent Rules

Work with me in small, reviewable slices. Keep updates concise: decisions, changes, checks, and blockers.

- Read relevant code, tests, history, and shared guidance before editing.
- Prefer existing standards and project patterns. Do not invent architecture.
- Prefer removing duplication and reusing existing code. Add code only when necessary.
- Before writing supporting code, look for a well-maintained FOSS solution. Keep custom code focused on the core logger.
- Keep the theme schema and styled-token model shared by ANSI terminal and HTML browser output.
- Keep termcn/Ink in the CLI presentation layer; keep the core renderer framework-free.
- Preserve unrelated work. Check new and deleted files after each slice.
- Ask before changing scope, architecture, or public API.
