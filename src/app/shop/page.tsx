import { GroupedProductCard } from '@/components/product/GroupedProductCard'
import Link from 'next/link'
import { ShopHeader } from '@/components/shop/ShopHeader'
import { Pagination } from '@/components/shop/Pagination'
import { summaryToGroup } from '@/lib/groupCatalog'
import {
  CategoryName,
  ProductCount,
  ActiveFilterChip,
  EmptyState,
  SidebarSectionTitle,
} from '@/components/shop/ShopClientParts'
import { serverApiGet } from '@/lib/api/server'
import type { Branch, Category, Facets, ProductPage, ProductQuery } from '@/types'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import dynamic from 'next/dynamic'
import { getSiteUrl, STORE_NAME } from '@/lib/store'
import { getPublicApiBaseUrl, joinUrl } from '@/lib/url'

const FacetsSidebar = dynamic(
  () => import('@/components/shop/FacetsSidebar').then((mod) => mod.FacetsSidebar)
)

const MobileFiltersDrawer = dynamic(
  () => import('@/components/shop/MobileFiltersDrawer').then((mod) => mod.MobileFiltersDrawer)
)

const SortDropdown = dynamic(
  () => import('@/components/shop/SortDropdown').then((mod) => mod.SortDropdown)
)

export const revalidate = 300

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}): Promise<Metadata> {
  const params = await searchParams
  const search = params.search
  const siteUrl = getSiteUrl()
  const baseTitle = `${STORE_NAME} - Shop`

  if (search) {
    return {
      title: `نتائج "${search}" | ${STORE_NAME}`,
      description: `تصفح نتائج البحث عن "${search}" في ${STORE_NAME}`,
      robots: { index: false, follow: true },
    }
  }

  const canonicalUrl = new URL('/shop', siteUrl).toString()

  return {
    title: baseTitle,
    description: `تسوق أفضل المنتجات من ${STORE_NAME}.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: baseTitle,
      description: `تسوق أفضل المنتجات من ${STORE_NAME}.`,
      url: canonicalUrl,
      type: 'website',
    },
  }
}

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>
}

type CategoryItem = Pick<Category, 'nameEn' | 'nameAr' | 'level'> & { id?: number }

const ALL_CATEGORY_ITEM: CategoryItem = {
  id: undefined,
  nameEn: 'All',
  nameAr: '\u0627\u0644\u0643\u0644',
  level: 0,
}

const getCachedCategories = unstable_cache(
  async () => serverApiGet<Category[]>('/api/category'),
  ['shop-categories'],
  { revalidate: 300 }
)

const getCachedBranches = unstable_cache(
  async () => {
    const staffToken = process.env.INTERNAL_STAFF_TOKEN
    return staffToken ? serverApiGet<Branch[]>('/api/branch', { token: staffToken }) : Promise.resolve([] as Branch[])
  },
  ['shop-branches'],
  { revalidate: 300 }
)

const getCachedProductPage = unstable_cache(
  async (queryString: string) => serverApiGet<ProductPage>(`/api/product?${queryString}`),
  ['shop-product-page'],
  { revalidate: 300 }
)

const getCachedFacets = unstable_cache(
  async (queryString: string) => serverApiGet<Facets>(`/api/product/facets?${queryString}`),
  ['shop-facets'],
  { revalidate: 300 }
)

export default async function ShopPage({ searchParams }: PageProps) {
  const params = await searchParams
  const defaultBranch = parsePositiveInt(process.env.NEXT_PUBLIC_DEFAULT_BRANCH_ID) ?? 1
  const requestedBranch = parsePositiveInt(params.branch)

  const selectedBranch = requestedBranch || defaultBranch
  const selectedCat = parsePositiveInt(params.category)

  const query: ProductQuery = {
    branchId: selectedBranch,
    categoryId: selectedCat,
    brandId: parsePositiveInt(params.brandId),
    minPrice: parseNonNegativeNumber(params.minPrice),
    maxPrice: parseNonNegativeNumber(params.maxPrice),
    search: params.search,
    page: parsePositiveInt(params.page) ?? 1,
    limit: 24,
    sort: (params.sort as ProductQuery['sort']) ?? 'newest',
    attrs: parseAttrsFromParams(params),
  }

  const productQueryString = new URLSearchParams(toQueryParams(query)).toString()
  const facetsQueryString = new URLSearchParams(
    toQueryParams({
      branchId: query.branchId,
      categoryId: query.categoryId,
      brandId: query.brandId,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      search: query.search,
      attrs: query.attrs,
    })
  ).toString()

  const [categoriesRes, branchesRes, productsRes, facetsRes] = await Promise.allSettled([
    getCachedCategories(),
    getCachedBranches(),
    getCachedProductPage(productQueryString),
    getCachedFacets(facetsQueryString),
  ])

  const categories = categoriesRes.status === 'fulfilled' ? categoriesRes.value : []
  const branches = branchesRes.status === 'fulfilled' ? branchesRes.value : []
  let productPage = productsRes.status === 'fulfilled' ? productsRes.value : null
  let facets = facetsRes.status === 'fulfilled' ? facetsRes.value : null

  if (!requestedBranch && (!productPage || productPage.items.length === 0)) {
    const fallbackQuery: ProductQuery = {
      ...query,
      branchId: undefined,
    }

    const fallbackProductQueryString = new URLSearchParams(toQueryParams(fallbackQuery)).toString()
    const fallbackFacetsQueryString = new URLSearchParams(
      toQueryParams({
        categoryId: fallbackQuery.categoryId,
        brandId: fallbackQuery.brandId,
        minPrice: fallbackQuery.minPrice,
        maxPrice: fallbackQuery.maxPrice,
        search: fallbackQuery.search,
        attrs: fallbackQuery.attrs,
      })
    ).toString()

    const [fallbackProductsRes, fallbackFacetsRes] = await Promise.allSettled([
      getCachedProductPage(fallbackProductQueryString),
      getCachedFacets(fallbackFacetsQueryString),
    ])

    if (fallbackProductsRes.status === 'fulfilled') {
      productPage = fallbackProductsRes.value
    }

    if (fallbackFacetsRes.status === 'fulfilled') {
      facets = fallbackFacetsRes.value
    }
  }

  const activeBranches = branches.filter((branch) => branch.isActive)
  const products = productPage?.items ?? []
  const totalCount = productPage?.totalCount ?? 0
  const groups = products.map((product) => summaryToGroup(product, selectedBranch))
  const activeCategory = categories.find((category) => category.id === selectedCat)
  const activeBranch = activeBranches.find((branch) => branch.id === selectedBranch)
  const firstShopImage = products[0]?.imagePath
    ? joinUrl(getPublicApiBaseUrl(), products[0].imagePath)
    : null

  return (
    <>
      {firstShopImage && (
        <link rel="preload" as="image" href={firstShopImage} fetchPriority="high" />
      )}
      <div className="min-h-screen overflow-x-hidden bg-[#f8f6f2]">
      <ShopHeader
        totalCount={totalCount}
        search={params.search}
        categories={categories}
        activeBranches={activeBranches}
        selectedBranch={selectedBranch}
        selectedCat={selectedCat}
        currentSearch={params.search}
      />

      <div className="mx-auto flex max-w-7xl gap-6 px-3 py-5 md:px-6 md:py-8">
        <aside className="hidden w-[17rem] flex-shrink-0 flex-col gap-4 lg:flex">
          {activeBranches.length > 1 && (
            <div className="rounded-[28px] border bg-white p-4 shadow-[0_16px_34px_rgba(15,23,42,0.05)]" style={{ borderColor: 'var(--line)' }}>
              <SidebarSectionTitle titleEn="Branch" titleAr="الفرع" />
              <div className="flex flex-col gap-0.5">
                {activeBranches.map((branch) => {
                  const href = `/shop?${buildQS(params, { branch: String(branch.id), page: undefined })}`
                  const active = branch.id === selectedBranch
                  return (
                    <Link
                      key={branch.id}
                      href={href}
                      prefetch={false}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all ${active ? 'font-bold shadow-sm' : 'font-medium'}`}
                      style={active ? { background: 'var(--ink)', color: '#fff' } : { color: 'var(--mute)' }}
                    >
                      <span
                        className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                        style={{ background: active ? 'var(--orange)' : 'var(--line)' }}
                      />
                      {branch.name}
                    </Link>
                  )
                })}
              </div>
              <div className="mt-3 h-px" style={{ background: 'var(--line)' }} />
            </div>
          )}

          <div className="rounded-[28px] border bg-white p-4 shadow-[0_16px_34px_rgba(15,23,42,0.05)]" style={{ borderColor: 'var(--line)' }}>
            <SidebarSectionTitle titleEn="Category" titleAr="التصنيف" />
            <div className="flex flex-col gap-0.5">
              {[ALL_CATEGORY_ITEM, ...categories].map((category) => {
                const href = `/shop?${buildQS(params, { category: category.id ? String(category.id) : undefined, page: undefined })}`
                const active = category.id === selectedCat || (!category.id && !selectedCat)
                return (
                  <Link
                    key={category.id ?? 'all'}
                    href={href}
                    prefetch={false}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all ${active ? 'border font-bold' : 'font-medium'}`}
                    style={{
                      ...(active
                        ? { borderColor: 'rgba(255,107,44,0.25)', background: 'rgba(255,107,44,0.08)', color: 'var(--ink)' }
                        : { color: 'var(--mute)' }
                      ),
                      ...(category.id ? { marginInlineStart: `${((category.level ?? 0) * 12)}px` } : {})
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                      style={{ background: active ? 'var(--orange)' : 'var(--line)' }}
                    />
                    <CategoryName cat={category} />
                  </Link>
                )
              })}
            </div>
            <div className="mt-3 h-px" style={{ background: 'var(--line)' }} />
          </div>

          {facets && <FacetsSidebar facets={facets} currentQuery={query} />}
        </aside>

        <main className="min-w-0 flex-1">
          <div className="sticky top-[7.4rem] z-20 mb-5 rounded-[28px] border bg-white/92 p-3 shadow-[0_16px_34px_rgba(15,23,42,0.08)] backdrop-blur md:static md:bg-white/90 md:shadow-[0_16px_34px_rgba(15,23,42,0.04)]"
            style={{ borderColor: 'var(--line)' }}>
            <div className="mb-2 flex items-center justify-between gap-3 md:hidden">
              <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: 'var(--mute)' }}>
                {params.search ? 'Focused results' : 'Browse tools'}
              </p>
              <span className="rounded-full px-3 py-1 text-[10px] font-black" style={{ background: 'var(--paper)', color: 'var(--mute)' }}>
                {totalCount} items
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex items-center gap-3">
                <MobileFiltersDrawer
                  categories={categories}
                  activeBranches={activeBranches}
                  selectedBranch={selectedBranch}
                  selectedCat={selectedCat}
                />

                <ProductCount total={totalCount} page={query.page ?? 1} />

                {(query.brandId || query.minPrice || query.maxPrice) && (
                  <div className="flex items-center gap-1">
                    {query.minPrice && (
                      <ActiveFilterChip
                        labelEn={`From ${query.minPrice}`}
                        labelAr={`من ${query.minPrice}`}
                        href={`/shop?${buildQS(params, { minPrice: undefined, page: undefined })}`}
                      />
                    )}
                    {query.maxPrice && (
                      <ActiveFilterChip
                        labelEn={`To ${query.maxPrice}`}
                        labelAr={`إلى ${query.maxPrice}`}
                        href={`/shop?${buildQS(params, { maxPrice: undefined, page: undefined })}`}
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="flex-shrink-0">
                <SortDropdown currentSort={query.sort} />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3" style={{ borderColor: 'var(--line)' }}>
              {params.search && (
                <ActiveFilterChip
                  labelEn={`Search: ${params.search}`}
                  labelAr={`بحث: ${params.search}`}
                  href={`/shop?${buildQS(params, { search: undefined, page: undefined })}`}
                />
              )}
              {activeCategory && (
                <ActiveFilterChip
                  labelEn={`Category: ${activeCategory.nameEn}`}
                  labelAr={`التصنيف: ${activeCategory.nameAr}`}
                  href={`/shop?${buildQS(params, { category: undefined, page: undefined })}`}
                />
              )}
              {activeBranch && activeBranches.length > 1 && (
                <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold"
                  style={{ borderColor: 'var(--line)', background: 'var(--paper)', color: 'var(--mute)' }}>
                  {activeBranch.name}
                </span>
              )}
            </div>
          </div>

          {groups.length === 0 ? (
            <EmptyState search={params.search} />
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-600">
                    {params.search
                      ? 'Search / بحث'
                      : activeCategory
                        ? 'Category / تصنيف'
                        : 'Collection / التشكيلة'}
                  </p>
                  <h2 className="mt-1 text-lg font-black md:text-2xl" style={{ color: 'var(--ink)' }}>
                    {params.search
                      ? params.search
                      : activeCategory
                        ? `${activeCategory.nameAr || activeCategory.nameEn}`
                        : 'منتجات مختارة | Curated Picks'}
                  </h2>
                </div>

                <div className="rounded-2xl border bg-white px-4 py-3 text-sm shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
                  style={{ borderColor: 'var(--line)', color: 'var(--mute)' }}>
                  <span className="font-black" style={{ color: 'var(--ink)' }}>{totalCount}</span>{' '}
                  {params.search
                    ? 'نتيجة مطابقة / matches'
                    : activeCategory
                      ? 'منتج داخل هذا التصنيف / items in this category'
                      : 'منتج متاح الآن / available items'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 md:gap-4">
                {groups.map((group, index) => (
                  <GroupedProductCard
                    key={group.productId}
                    group={group}
                    branchId={selectedBranch}
                    priority={index === 0}
                  />
                ))}
              </div>

              {productPage && (
                <div className="mt-8">
                  <Pagination
                    currentPage={productPage.page}
                    totalPages={productPage.totalPages}
                    hasNext={productPage.hasNext}
                    hasPrev={productPage.hasPrev}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>
      </div>
    </>
  )
}

function buildQS(
  current: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>
): URLSearchParams {
  const qs = new URLSearchParams()
  const merged = { ...current, ...overrides }

  Object.entries(merged).forEach(([key, value]) => {
    if (value !== undefined) qs.set(key, value)
  })

  return qs
}

function parseAttrsFromParams(params: Record<string, string | undefined>): Record<number, string> {
  const attrs: Record<number, string> = {}

  Object.entries(params).forEach(([key, value]) => {
    const match = key.match(/^attrs\[(\d+)\]$/)
    if (match && value) attrs[Number(match[1])] = value
  })

  return attrs
}

function toQueryParams(query: ProductQuery): Record<string, string> {
  const params: Record<string, string> = {}

  if (query.categoryId) params.categoryId = String(query.categoryId)
  if (query.brandId) params.brandId = String(query.brandId)
  if (query.minPrice) params.minPrice = String(query.minPrice)
  if (query.maxPrice) params.maxPrice = String(query.maxPrice)
  if (query.search) params.search = query.search
  if (query.branchId) params.branchId = String(query.branchId)
  if (query.page) params.page = String(query.page)
  if (query.limit) params.limit = String(query.limit)
  if (query.sort) params.sort = query.sort

  if (query.attrs) {
    Object.entries(query.attrs).forEach(([attrId, optionIds]) => {
      if (optionIds) params[`attrs[${attrId}]`] = optionIds
    })
  }

  return params
}

function parsePositiveInt(value?: string | null): number | undefined {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

function parseNonNegativeNumber(value?: string | null): number | undefined {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}