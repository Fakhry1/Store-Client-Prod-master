# LUXE Store — Next.js Frontend

## Quick Start

```bash
npm install
npm run dev
# → http://localhost:3000
```

## إعداد `.env.local`

```env
NEXT_PUBLIC_API_URL=https://localhost:44304
NEXT_PUBLIC_API_HOSTNAME=localhost
NEXT_PUBLIC_DEFAULT_BRANCH_ID=1
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
