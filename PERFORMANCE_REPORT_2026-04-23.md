# Performance Test Report

Date: 2026-04-23
Environment: Production build, local server on `http://127.0.0.1:3001`
Tool: Lighthouse

## Executive Summary

- `product` improved strongly after the latest optimization pass.
- `shop` improved as well, but still has noticeable main-thread blocking.
- The main remaining opportunities are still `unused JavaScript` and a small amount of `unused CSS`.

## Latest Results

| Page | Performance | Accessibility | Best Practices | SEO | FCP | LCP | Speed Index | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `shop` | 70 | 85 | 96 | 100 | 1.0s | 3.5s | 2.6s | 790ms | 0.075 |
| `product` | 83 | 91 | 96 | 100 | 1.0s | 3.3s | 1.4s | 400ms | 0 |

## Before vs After

| Page | Metric | Before | After | Change |
|---|---|---:|---:|---:|
| `shop` | Performance | 63 | 70 | +7 |
| `shop` | LCP | 4.1s | 3.5s | -0.6s |
| `shop` | TBT | 1090ms | 790ms | -300ms |
| `product` | Performance | 58 | 83 | +25 |
| `product` | LCP | 4.7s | 3.3s | -1.4s |
| `product` | TBT | 1050ms | 400ms | -650ms |
| `product` | CLS | 0.075 | 0 | -0.075 |

## Resource Summary

| Page | Total Transfer | JavaScript | Images | Fonts |
|---|---:|---:|---:|---:|
| `shop` | 448.3 KB | 202.3 KB | 53.0 KB | 121.5 KB |
| `product` | 390.2 KB | 195.9 KB | 7.5 KB | 121.5 KB |

## Main Opportunities

### `shop`

- Reduce unused CSS: estimated savings `12 KiB`
- Reduce unused JavaScript: estimated savings `24 KiB`

### `product`

- Reduce unused CSS: estimated savings `13 KiB`
- Reduce unused JavaScript: estimated savings `22 KiB`

## Implemented Changes Behind This Run

- Moved related products rendering out of the heavy product client bundle.
- Deferred wishlist and branch-availability work until idle time / after initial paint.
- Restored locale server helpers required by the optimized server-rendered flow.

## Recommendation Priority

1. Continue reducing client-side JavaScript on `shop`, especially filter and sorting interactions.
2. Split more logic from [ProductPageClient.tsx](E:/FromGitHub/Store-Client-Prod-master/src/components/product/ProductPageClient.tsx) if we want to push `product` closer to the 90s.
3. Audit page CSS for `shop` and `product` to remove leftover unused rules.
4. Re-run Lighthouse after each focused optimization batch.

## Raw Reports

- [lh-report-shop.json](E:/FromGitHub/Store-Client-Prod-master/lh-report-shop.json)
- [lh-report-product.json](E:/FromGitHub/Store-Client-Prod-master/lh-report-product.json)
