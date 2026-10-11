# Portfolio
Sabin Khanal's developer portfolio: work grid, case studies, live product status.

## Stack
React 19 · TypeScript (strict) · Vite · Vitest · ESLint. Installable PWA with offline support.
Design: #07070C base, violet #7C3AED and cyan #22D3EE, Space Grotesk + Inter. Shared with sabin-labs.

## Commands
- Dev: `npm run dev` · Build: `npm run build`
- Test: `npm test` · Lint: `npm run lint && npm run typecheck`

## Architecture
- `src/data.ts` is the single source of truth for projects · `src/hero/` WebGL particle range
- `src/components/` Work, Systems, ContactForm · `src/status.ts` live health checks

## Data rules
- Project data is static in `src/data.ts`; add new products there.
- Test counts are recorded manually and go stale; update them when you touch them.

## Testing rules
- Every behaviour change needs a test. Pure logic in `src/*.ts` is unit-tested; components get the
  behaviour test, not the markup. Run lint, typecheck and tests before finishing.

## Frontend rules
- Keep the existing design system, dark-first with a working light theme. Editorial layouts, not dashboard
  grids. Respect `prefers-reduced-motion`, keep AA contrast and 44px targets.
- Self-host fonts with @fontsource; a Google Fonts link blocks first paint and costs ~2s on mobile.
- Keep gzipped JS under ~180KB and Lighthouse mobile performance at 90+.

## Security and git
- Never commit secrets, keystores, .env files or email addresses.
- Keep the Content-Security-Policy strict; add a host to connect-src only when a feature needs it.
- `main` is protected: branch, open a PR, merge when CI is green. One issue per PR, under ~300 lines.

## Done when
Lint clean, tests pass, CI green, PR opened with a three line summary.
