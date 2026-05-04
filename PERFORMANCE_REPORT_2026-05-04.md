# Performance Test Report

**Date:** 2026-05-04  
**Environment:** Production build, dedicated server `http://localhost:3101`  
**Tool:** Lighthouse (headless Chrome)  
**Pages tested:** Home · Shop · Product · Cart

---

## Current Scores (2026-05-04)

| Page | Performance | Accessibility | Best Practices | SEO |
|------|:-----------:|:-------------:|:--------------:|:---:|
| Home | 83 | 89 | 96 | 100 |
| Shop | 83 | 96 | 96 | 100 |
| Product | 73 | 89 | 96 | 100 |
| Cart | 79 | 100 | 96 | 66 |

---

## Core Metrics (2026-05-04)

| Page | FCP | LCP | Speed Index | TBT | CLS |
|------|----:|----:|------------:|----:|----:|
| Home | 0.96 s | 4.11 s | 2.33 s | 212 ms | 0.000 |
| Shop | 0.93 s | 4.12 s | 2.23 s | 214 ms | 0.013 |
| Product | 0.92 s | 5.68 s | 2.69 s | 283 ms | 0.013 |
| Cart | 0.78 s | 4.76 s | 0.80 s | 171 ms | 0.068 |

---

## Comparison vs Last Test (2026-05-03)

Reference: `PERFORMANCE_REPORT_2026-05-03.md` (latest baseline in repository)

| Page | Perf Δ | Acc Δ | SEO Δ | FCP Δ | LCP Δ | TBT Δ | CLS Δ |
|------|-------:|------:|------:|------:|------:|------:|------:|
| Home | +16 | 0 | 0 | +0.06 s | +0.01 s | +22 ms | -0.330 |
| Shop | +21 | 0 | 0 | +0.03 s | -0.38 s | -86 ms | -0.317 |
| Product | +10 | -7 | 0 | +0.12 s | +1.08 s | +53 ms | -0.317 |
| Cart | +19 | 0 | +8 | -0.02 s | +0.36 s | +11 ms | -0.612 |

Notes:
- Negative delta in LCP/TBT/CLS means improvement.
- Cart SEO increase from 58 to 66 is expected fluctuation around `noindex` transactional route checks.

---

## Key Takeaways

- Significant improvement in Performance score across all pages.
- CLS improved strongly on all pages (largest gain on Cart).
- Shop improved in both LCP and TBT.
- Product page regressed in LCP and TBT and needs targeted follow-up.

---

## Product Retest After Fix (2026-05-04)

Retest target: `http://localhost:3101/product?id=1&branch=1`  
Baseline in this report: `lh-reports/new-product-3101.json`  
Post-fix run: `lh-reports/new-product-3101-after-fix.json`

### Delta vs Previous Product Run (Same Port/Setup)

| Metric | Before | After | Delta |
|------|------:|------:|------:|
| Performance score | 73 | 87 | +14 |
| FCP | 0.92 s | 0.94 s | +0.02 s |
| LCP | 5.68 s | 3.70 s | -1.98 s |
| Speed Index | 2.69 s | 1.79 s | -0.90 s |
| TBT | 283 ms | 185 ms | -98 ms |
| TTI | 5.68 s | 4.30 s | -1.38 s |
| Main-thread work | 2056.84 ms | 2113.12 ms | +56.28 ms |
| Long tasks count | 7 | 7 | 0 |
| Max long task | 222 ms | 181 ms | -41 ms |

### What changed in code

- Deferred initial wishlist state check to idle time in `ProductPageClient`.
- Reduced re-execution of availability synchronization by removing unnecessary dependencies in `useAvailabilitySync`.
- Lazy-loaded `AddToCartPanel` with `next/dynamic` to reduce initial Product client payload.

### Conclusion

Product page regression is resolved in this retest. LCP and TBT both improved significantly and now outperform the previous Product baseline from the last report.

---

## Full Sweep After Product Fix (2026-05-04)

Scope: Re-ran all key routes on the same production server and Lighthouse settings.

- Before set:
	- `lh-reports/new-home-3101.json`
	- `lh-reports/new-shop-3101.json`
	- `lh-reports/new-product-3101.json`
	- `lh-reports/new-cart-3101.json`
- After set:
	- `lh-reports/new-home-3101-after-product-fix.json`
	- `lh-reports/new-shop-3101-after-product-fix.json`
	- `lh-reports/new-product-3101-after-product-fix-r2.json`
	- `lh-reports/new-cart-3101-after-product-fix.json`

### Performance Score Delta

| Page | Before | After | Delta |
|------|------:|------:|------:|
| Home | 83 | 88 | +5 |
| Shop | 83 | 89 | +6 |
| Product | 73 | 90 | +17 |
| Cart | 79 | 81 | +2 |

### Core Web Metrics Delta

| Page | LCP Before | LCP After | LCP Delta | TBT Before | TBT After | TBT Delta |
|------|-----------:|----------:|----------:|-----------:|----------:|----------:|
| Home | 4.11 s | 3.78 s | -0.33 s | 212 ms | 148 ms | -64 ms |
| Shop | 4.12 s | 3.55 s | -0.56 s | 214 ms | 148 ms | -66 ms |
| Product | 5.68 s | 3.32 s | -2.36 s | 283 ms | 165 ms | -118 ms |
| Cart | 4.76 s | 4.76 s | -0.00 s | 171 ms | 136 ms | -35 ms |

### Stability Notes

- All pages improved in Performance score and TBT.
- Product shows the largest gain and confirms the regression fix is stable.
- Cart LCP is effectively flat, while TBT still improved.
