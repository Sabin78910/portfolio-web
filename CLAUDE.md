# Portfolio
Sabin Khanal's CV portfolio: hero, about, experience, education, projects, contact.

## Stack
React 19 · TypeScript (strict) · Vite · Vitest · ESLint. Installable PWA with offline support.
Design: #060912 navy base, blue #3B6CF6 → sky #60A5FA → violet #7C3AED, Space Grotesk + Inter.

## Commands
- Dev: `npm run dev` · Build: `npm run build`
- Test: `npm test` · Lint: `npm run lint && npm run typecheck`

## Architecture
- `src/data.ts` is the single source of truth for all page content · `src/hero/` WebGL particle range
- `src/components/` Hero, Projects, ContactForm, CountUp

## Data rules
- All content (about, experience, education, projects, skills) is static in `src/data.ts`.
- The hero photo is `public/portrait.jpg`; a missing file falls back to the SK monogram.

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
Lint clean, tests pass, CI green, PR opened with a three line summary. User facing work follows `docs/FEEL.md`.
