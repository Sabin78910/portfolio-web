# Sabin Khanal — Portfolio

Personal developer portfolio: projects, skills and contact.

![CI](https://github.com/Sabin78910/portfolio-web/actions/workflows/ci.yml/badge.svg)
![Deploy](https://github.com/Sabin78910/portfolio-web/actions/workflows/deploy.yml/badge.svg)

**Live:** https://sabin78910.github.io/portfolio-web/

Built with React, TypeScript and Vite. Tested with Vitest and Testing Library.

## Develop (VS Code)
```bash
npm install
npm run dev     # http://localhost:5173
npm test
npm run build
```

## Automation (runs on GitHub, no laptop needed)
| Workflow | Trigger | What it does |
|---|---|---|
| CI | push / PR to main | lint, typecheck, tests, build, npm audit |
| Deploy to GitHub Pages | push to main | publishes the site |
| CodeQL | push / PR / weekly | security analysis |
| Dependabot | weekly | dependency update PRs |

## Security
Vulnerability reports: see `public/.well-known/security.txt` (RFC 9116). Renew its `Expires` date yearly.

## Performance budget
| Check | Where | Fails when |
|---|---|---|
| Lighthouse budget | `.github/workflows/lighthouse.yml` + `lighthouserc.json` | mobile performance < 0.9, accessibility < 0.95, or CLS > 0.05 (median of 3 runs) |

Run it locally: `npm run build && npx @lhci/cli@0.15.1 autorun`.
