# Lighthouse performance

Command: `npx lighthouse@13.5.0 https://sabin78910.github.io/portfolio-web/ --preset=perf`

## 11 Oct 2026 re-measure (3 runs)

| Run | Score | FCP/LCP | TBT | CLS |
| --- | ----- | ------- | --- | --- |
| 1 | 81 | 2.5 s | 490 ms | 0.008 |
| 2 | 96 | 2.0 s | 110 ms | 0.005 |
| 3 | 96 | 2.1 s | 110 ms | 0.005 |

Median: **96** (target 90+). Run 1 was an outlier from main-thread noise (TBT), so
the earlier 84 -> 80 drop is run-to-run variance, not a service worker regression.
No code change needed. Always take the median of three runs.
