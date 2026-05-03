import { apiRequest } from './client'
import type {
  AuthResponse, CustomerUser, Category, CategoryTreeNode, CatalogItem, Product,
  Cart, PromoResult, Order, CustomerAddress, Branch,
  ProductPage, Facets, ProductQuery, CreateOrderPayload, ProductImage, Wishlist, CustomerWalletDetails,
  BranchProductAvailabilityItem,
  TaxSettings,
} from '@/types'

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: {
    firstName: string
    lastName?: string
    email?: string
    password: string
    confirmPassword: string
    phoneNumber: string
  }) => apiRequest<AuthResponse>('/api/customer/auth/register', {
    method: 'POST',
    body: data,
    credentials: 'include',
  }),

  login: (phoneNumber: string, password: string) =>
    apiRequest<AuthResponse>('/api/customer/auth/login', {
      method: 'POST',
      body: { phoneNumber, password },
      credentials: 'include',
    }),

  me: (token?: string) =>
    apiRequest<CustomerUser>('/api/customer/auth/me', { token }),

  logout: (token?: string) =>
    apiRequest<{ message: string }>('/api/customer/auth/logout', {
      method: 'POST',
      token,
    }),

  forgotPassword: (input: string | { email?: string; phoneNumber?: string }) => {
    const body =
      typeof input === 'string'
        ? { email: input.trim() }
        : {
            ...(input.email?.trim() ? { email: input.email.trim() } : {}),
            ...(input.phoneNumber?.trim() ? { phoneNumber: input.phoneNumber.trim() } : {}),
          }
    return apiRequest<{ message?: string; expiresInSeconds?: number }>('/api/customer/auth/forgot-password', {
      method: 'POST', body
    })
  },

  requestPasswordResetOtp: (phoneNumber: string) =>
    apiRequest<{ message?: string; expiresInSeconds?: number }>('/api/customer/auth/forgot-password', {
      method: 'POST',
      body: { phoneNumber: phoneNumber.trim() },
    }),

  verifyPasswordResetOtp: (phoneNumber: string, otp: string) =>
    apiRequest<{ resetToken: string; message?: string }>('/api/customer/auth/forgot-password/verify-otp', {
      method: 'POST', body: { phoneNumber, otp }
    }),

  resetPasswordWithOtp: (data: {
    phoneNumber: string
    otp?: string
    resetToken?: string
    newPassword: string
    confirmPassword: string
  }) =>
    apiRequest<{ message?: string }>('/api/customer/auth/forgot-password/reset-password', {
      method: 'POST', body: data
    }),

  updateProfile: (token: string | undefined, data: {
    firstName?: string
    lastName?: string
    phoneNumber?: string
  }) => apiRequest<{ message: string }>('/api/customer/auth/profile', {
    method: 'PUT', token, body: data
  }),

  changePassword: (token: string | undefined, data: {
    currentPassword: string; newPassword: string
  }) => apiRequest<void>('/api/customer/auth/change-password', {
    method: 'POST', token, body: data
  }),
}

// ─── Branches ────────────────────────────────────────────────────────────────
export const branchApi = {
  list: (token?: string) => apiRequest<Branch[]>('/api/branch', { token }),
}

// ─── Categories ──────────────────────────────────────────────────────────────
export const settingsApi = {
  tax: () => apiRequest<TaxSettings>('/api/admin/settings/tax', { cacheMode: 'default' }),
}

export const categoryApi = {
  list: () => apiRequest<Category[]>('/api/category', { cacheMode: 'default' }),
  tree: () => apiRequest<CategoryTreeNode[]>('/api/category/tree', { cacheMode: 'default' }),
}

// ─── Catalog (public) ────────────────────────────────────────────────────────
export const catalogApi = {
  getPublic: (branchId: number, params?: { categoryId?: number; searchTerm?: string }) => {
    const qs = new URLSearchParams()
    if (params?.categoryId) qs.set('categoryId', String(params.categoryId))
    if (params?.searchTerm) qs.set('searchTerm',  params.searchTerm)
    const query = qs.toString() ? `?${qs}` : ''
    return apiRequest<CatalogItem[]>(
      `/api/branchinventory/public/branch/${branchId}/catalog${query}`
    )
  },
  getProductAvailability: (branchId: number, productId: number) =>
    apiRequest<BranchProductAvailabilityItem[]>(
      `/api/branchinventory/public/branch/${branchId}/product/${productId}`
    ),
}

// ─── Products ────────────────────────────────────────────────────────────────
export const productApi = {
  getById: (id: number) =>
    apiRequest<Product>(`/api/product/${id}`, { cacheMode: 'default' }),

  images: (id: number) =>
    apiRequest<ProductImage[]>(`/api/product/${id}/images`, { cacheMode: 'default' }),

  list: (query: ProductQuery = {}) => {
    const qs = new URLSearchParams()
    if (query.categoryId) qs.set('categoryId', String(query.categoryId))
    if (query.brandId)    qs.set('brandId',    String(query.brandId))
    if (query.minPrice)   qs.set('minPrice',   String(query.minPrice))
    if (query.maxPrice)   qs.set('maxPrice',   String(query.maxPrice))
    if (query.search)     qs.set('search',     query.search)
    if (query.branchId)   qs.set('branchId',   String(query.branchId))
    if (query.page)       qs.set('page',       String(query.page))
    if (query.limit)      qs.set('limit',      String(query.limit))
    if (query.sort)       qs.set('sort',       query.sort)
    if (query.attrs) {
      Object.entries(query.attrs).forEach(([attrId, optionIds]) => {
        if (optionIds) qs.set(`attrs[${attrId}]`, optionIds)
      })
    }
    return apiRequest<ProductPage>(`/api/product?${qs}`, { cacheMode: 'default' })
  },

  facets: (query: ProductQuery = {}) => {
    const qs = new URLSearchParams()
    if (query.categoryId) qs.set('categoryId', String(query.categoryId))
    if (query.brandId)    qs.set('brandId',    String(query.brandId))
    if (query.minPrice)   qs.set('minPrice',   String(query.minPrice))
    if (query.maxPrice)   qs.set('maxPrice',   String(query.maxPrice))
    if (query.search)     qs.set('search',     query.search)
    if (query.branchId)   qs.set('branchId',   String(query.branchId))
    if (query.attrs) {
      Object.entries(query.attrs).forEach(([attrId, optionIds]) => {
        if (optionIds) qs.set(`attrs[${attrId}]`, optionIds)
      })
    }
    return apiRequest<Facets>(`/api/product/facets?${qs}`, { cacheMode: 'default' })
  },
}

// ─── Cart ────────────────────────────────────────────────────────────────────
export const cartApi = {
  get:        (token?: string) =>
    apiRequest<Cart>('/api/cart', { token }),

  add:        (token: string | undefined, data: { productId: number; productVariantId: number; branchId: number; quantity: number }) =>
    apiRequest<void>('/api/cart/add', { method: 'POST', token, body: data }),

  updateItem: (token: string | undefined, itemId: number, quantity: number) =>
    apiRequest<void>(`/api/cart/item/${itemId}`, { method: 'PUT', token, body: { quantity } }),

  removeItem: (token: string | undefined, itemId: number) =>
    apiRequest<void>(`/api/cart/item/${itemId}`, { method: 'DELETE', token }),

  clear:      (token: string | undefined) =>
    apiRequest<void>('/api/cart/clear', { method: 'DELETE', token }),

  count:      (token: string | undefined) =>
    apiRequest<{ count: number }>('/api/cart/count', { token }),

  mergeGuest: (token: string | undefined, sessionId: string) =>
    apiRequest<void>(`/api/cart/merge/${sessionId}`, { method: 'POST', token }),

  getGuest:        (sessionId: string) =>
    apiRequest<Cart>(`/api/cart/guest/${sessionId}`),

  addGuest:        (sessionId: string, data: { productId: number; productVariantId: number; branchId: number; quantity: number }) =>
    apiRequest<void>(`/api/cart/guest/${sessionId}/add`, { method: 'POST', body: data }),

  updateGuestItem: (sessionId: string, itemId: number, quantity: number) =>
    apiRequest<void>(`/api/cart/guest/${sessionId}/item/${itemId}`, { method: 'PUT', body: { quantity } }),

  removeGuestItem: (sessionId: string, itemId: number) =>
    apiRequest<void>(`/api/cart/guest/${sessionId}/item/${itemId}`, { method: 'DELETE' }),

  guestCount:      (sessionId: string) =>
    apiRequest<{ count: number }>(`/api/cart/guest/${sessionId}/count`),
}

// ─── Promo ───────────────────────────────────────────────────────────────────
export const promoApi = {
  validate: (token: string | undefined, code: string, cartSubtotal: number) =>
    apiRequest<PromoResult>('/api/promocode/validate', {
      method: 'POST', token, body: { code, cartSubtotal }
    }),
}

// ─── Orders ──────────────────────────────────────────────────────────────────
export const orderApi = {
  create: (token: string | undefined, data: CreateOrderPayload) =>
    apiRequest<{ success: boolean; message: string; order: Order }>(
      '/api/order/create',
      {
        method: 'POST',
        token,
        body: {
          ...data,
          orderFulfillmentType: data.fulfillmentType === 'delivery' ? 2 : 1,
        },
      }
    ).then(res => res.order),

  myOrders: (token: string | undefined, status?: number, page = 1, limit = 100) => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', String(limit))

    if (status !== undefined) {
      params.set('status', String(status))
    }

    return apiRequest<{ total: number; orders: Order[] }>(`/api/order/my-orders?${params.toString()}`, { token })
  },

  getById: (token: string | undefined, id: number) =>
    apiRequest<Order>(`/api/order/${id}`, { token }),

  cancel: (token: string | undefined, id: number) =>
    apiRequest<void>(`/api/order/${id}/cancel`, { method: 'POST', token }),
}

export const walletApi = {
  me: (token: string | undefined, limit = 20) =>
    apiRequest<CustomerWalletDetails>(`/api/customer/wallet/me?limit=${limit}`, { token }),
}

// ─── Addresses ───────────────────────────────────────────────────────────────
export const addressApi = {
  list: (token?: string) =>
    apiRequest<{ total: number; addresses: CustomerAddress[] }>('/api/customer/addresses', { token }),

  create: (token: string | undefined, data: Omit<CustomerAddress, 'id'>) =>
    apiRequest<CustomerAddress>('/api/customer/addresses', { method: 'POST', token, body: data }),

  update: (token: string | undefined, id: number, data: Partial<Omit<CustomerAddress, 'id'>>) =>
    apiRequest<{ message: string }>(`/api/customer/addresses/${id}`, { method: 'PUT', token, body: data }),

  delete: (token: string | undefined, id: number) =>
    apiRequest<void>(`/api/customer/addresses/${id}`, { method: 'DELETE', token }),

  setDefault: (token: string | undefined, id: number) =>
    apiRequest<void>(`/api/customer/addresses/${id}/set-default`, { method: 'PUT', token }),
}

// ─── Wishlist ────────────────────────────────────────────────────────────────
export const wishlistApi = {
  list: (token?: string) =>
    apiRequest<Wishlist>('/api/wishlist', { token }),

  add: (token: string | undefined, productId: number, productVariantId: number) =>
    apiRequest<void>('/api/wishlist/add', {
      method: 'POST', token, body: { productId, productVariantId }
    }),

  remove: (token: string | undefined, variantId: number) =>
    apiRequest<void>(`/api/wishlist/${variantId}`, { method: 'DELETE', token }),

  check: (token: string | undefined, variantId: number) =>
    apiRequest<{ isWishlisted?: boolean; isInWishlist?: boolean }>(
      `/api/wishlist/check/${variantId}`,
      { token }
    ).then(res => ({ isWishlisted: res.isWishlisted ?? res.isInWishlist ?? false })),

  moveToCart: (token: string | undefined, variantId: number, branchId: number) =>
    apiRequest<void>(`/api/wishlist/${variantId}/move-to-cart`, {
      method: 'POST',
      token,
      body: { branchId },
    }),
}
