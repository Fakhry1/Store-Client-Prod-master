# LUXE Store — Next.js Frontend

## Quick Start

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Performance Baseline Compare

```bash
npm run perf:compare-baseline
```

- Baseline file: `lh-reports/perf-baseline.json`
- Command compares baseline against the latest matching `new-*-3101*.json` files in `lh-reports/`.
- Use this after generating fresh Lighthouse runs to get instant deltas for Home, Shop, Product, and Cart.

## إعداد `.env.local`

```env
API_URL=https://localhost:44304
NEXT_PUBLIC_API_URL=https://localhost:44304
NEXT_PUBLIC_API_HOSTNAME=localhost
NEXT_PUBLIC_DEFAULT_BRANCH_ID=1
# Optional: collect CSP violations in report-only mode before enforcing stricter policy
# CSP_REPORT_ONLY=1
# Development only, never enable this in staging/production:
# NODE_TLS_REJECT_UNAUTHORIZED=0
```

> تأكد أن الـ API (مشروع .NET) شغّال أولاً قبل `npm run dev`

---

## هيكل المشروع

```
src/
├── app/
│   ├── auth/login/page.tsx       ← تسجيل دخول
│   ├── auth/register/page.tsx    ← إنشاء حساب
│   ├── cart/page.tsx             ← سلة + checkout
│   ├── orders/page.tsx           ← طلباتي + تتبع
│   ├── product/page.tsx          ← تفاصيل منتج
│   ├── shop/page.tsx             ← الكتالوج الرئيسي
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx                  ← redirect → /shop
├── components/
│   ├── layout/Navbar.tsx
│   ├── product/ProductCard.tsx
│   └── ui/
│       ├── PriceDisplay.tsx
│       └── OfferBadge.tsx
├── context/
│   ├── auth.tsx                  ← login/logout/register + token
│   └── cart.tsx                  ← سلة authenticated + guest
├── lib/api/
│   ├── client.ts                 ← fetch wrapper
│   └── index.ts                  ← كل الـ API calls
└── types/index.ts                ← TypeScript types
```

---

## المشاكل التي تم حلها

| المشكلة | الحل |
|---|---|
| `self-signed certificate` | `NODE_TLS_REJECT_UNAUTHORIZED=0` في `.env.local` + `next.config.js` |
| `branchApi 401 Unauthorized` | `Promise.allSettled` + fallback لـ `DEFAULT_BRANCH_ID` |
| `404 Not Found` | console.log لكل request في development لتشخيص المسار |
| ملفات مكررة `(store)` / `(auth)` | هيكل نظيف بدون route groups |
| أنواع TypeScript مفقودة | aliases كاملة في `types/index.ts` |
| `lucide-react` / `react-hot-toast` | مضافتان في `package.json` |
