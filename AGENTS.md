<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Communication Rules

- Do not use emojis in code, docs, commit messages, or chat responses unless the user explicitly asks for them.
- Do not use em dash. Use a hyphen (-) or comma instead.
- Keep responses short and factual. Reference files as `path:line_number` where useful.

## Git Commit Rules

Use Conventional Commits for all commit messages.

Format: `type(scope): short description`

- Types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`
- Scope is optional but preferred when the change is limited to one area (for example `feat(team): add member search`).
- Description uses lowercase, present tense, no trailing period, max 72 chars.
- Body (optional) explains what changed and why, with hyphen (-) lists.
- Footer (optional) for breaking changes: `BREAKING CHANGE: ...`
- Never use emojis or em dash in commit messages.

Examples:

- `feat(team): add member search and role filter`
- `fix(orders): correct revenue total calculation`
- `chore(deps): bump next to 16.2.10`
- `docs(readme): add tech stack section`
