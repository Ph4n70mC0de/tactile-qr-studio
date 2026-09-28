# AGENTS.md

## Project: tactile-qr-studio

React 19 + TypeScript + Vite + Tailwind CSS QR editor.

## Commands

| Command          | Description                      |
| ---------------- | -------------------------------- |
| `npm run dev`    | Start dev server (port 3000)     |
| `npm run build`  | Production build                 |
| `npm run lint`   | Lint all files (`eslint .`)     |
| `npm run lint:fix` | Auto-fix lint issues            |
| `npm run typecheck` | TypeScript type check (`tsc --noEmit`) |
| `npm run test`   | Run tests (`vitest run`)         |
| `npm run test:watch` | Run tests in watch mode        |
| `npm run clean`  | Remove `dist/`                   |

## Quality Gates

- TypeScript: `npm run typecheck` must pass with 0 errors
- ESLint: `npm run lint` must pass with 0 errors (warnings acceptable)
- Tests: `npm run test` must pass (170 tests)
- Build: `npm run build` must complete in <120s

## Stack

- React 19.3 + TypeScript 5.8 + Vite 6
- Tailwind CSS 4
- ESLint 9 (flat config via `eslint.config.mjs`)
- Vitest 5 with happy-dom
