// ─── Auth ────────────────────────────────────────────────────────────────────
export interface CustomerUser {
  id: number
  firstName: string
  lastName: string
  fullName?: string
  email: string
  phoneNumber?: string
  dateOfBirth?: string
  gender?: number
  isEmailConfirmed?: boolean
  createdAt?: string
  lastLoginAt?: string
}

export interface AuthResponse {
  success: boolean
  message?: string
  accessToken?: string | null
  expiresIn?: number
  customer: CustomerUser   // API returns 'customer' not 'user'
  user?: CustomerUser      // keep for backwards compat
}

// ─── Branch ──────────────────────────────────────────────────────────────────
export interface TaxSettings {
  isEnabled: boolean
  ratePercent: number
  updatedAt: string
}

export interface Branch {
  id: number
  name: string
  code: string
  address?: string
  city?: string
  country: string
  isActive: boolean
}

// ─── Category ────────────────────────────────────────────────────────────────
export interface Category {
  id: number
  parentCategoryId?: number | null
  nameEn: string
  nameAr: string
  description?: string
  imagePath?: string
  isActive?: boolean
  isLeaf?: boolean
  level?: number
  childrenCount?: number
  productCount: number
}

export interface CategoryTreeNode {
  id: number
  parentCategoryId?: number | null
  nameEn: string
  nameAr: string
  description?: string
  imagePath?: string
  isActive: boolean
  isLeaf: boolean
  level: number
  productCount: number
  children: CategoryTreeNode[]
}

// ─── Product & Variant ───────────────────────────────────────────────────────
export interface ProductVariant {
  id: number
  nameEn: string
  nameAr: string
  sku: string
  basePrice: number
  currentPrice: number
  hasActiveOffer: boolean
  discountPercentage?: number
  offerEndsAt?: string
  /** Legacy flat map: { color: "red", size: "XL" } */
  variantAttributes?: Record<string, string>
  /** Rich structured attributes with colorHex, AR names, optionId */
  attributes?: VariantAttribute[]
  isActive: boolean
  quantityInStock: number
  imagePath?: string
}

// ─── Product Images ───────────────────────────────────────────────────────────
export interface ProductImage {
  id: number
  productId: number
  imagePath: string
  isPrimary: boolean
  sortOrder: number
  altText: string | null
  uploadedAt: string
}

export interface Product {
  id: number
  nameEn: string
  nameAr: string
  brand?: string
  description?: string
  descriptionAr?: string
  imagePath?: string
  categoryId: number
  categoryNameEn?: string
  categoryNameAr?: string
  attributes?: Record<string, string>
  variants: ProductVariant[]
  images?: ProductImage[]
}

// ─── Catalog ─────────────────────────────────────────────────────────────────
export interface CatalogItem {
  productId: number
  productNameEn: string
  productNameAr: string
  brand?: string
  imagePath?: string
  categoryId: number
  categoryNameEn?: string
  categoryNameAr?: string
  variantId: number
  variantNameEn: string
  variantNameAr: string
  sku: string
  variantAttributes?: Record<string, string>
  basePrice: number
  currentPrice: number
  hasActiveOffer: boolean
  discountPercentage?: number
  offerEndsAt?: string
  quantityInStock: number
  isLowStock: boolean
}

export interface BranchProductAvailabilityItem {
  variantId: number
  isAvailable: boolean
  quantityInStock: number
  minimumStock: number
  isLowStock: boolean
  isOutOfStock: boolean
}

// ─── Cart ────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: number
  productId: number
  productVariantId: number
  productNameEn: string
  productNameAr?: string
  variantNameEn: string
  variantNameAr?: string
  brand?: string
  imagePath?: string
  branchId: number
  quantity: number
  basePrice: number
  currentPrice: number
  hasActiveOffer: boolean
  discountPercentage?: number
  itemTotal: number
  isAvailable: boolean
  stockQuantity: number
}

export interface Cart {
  id: number
  totalItems: number
  subtotal: number
  discountAmount: number
  tax: number
  total: number
  fulfillmentType?: FulfillmentType
  deliveryFee?: number
  deliveryAddressId?: number
  promoCode?: string
  items: CartItem[]
}

// ─── Promo ───────────────────────────────────────────────────────────────────
export interface PromoResult {
  isValid: boolean
  code?: string
  discountAmount?: number
  finalTotal?: number
  errorMessage?: string
}

// ─── Order ───────────────────────────────────────────────────────────────────
export type OrderStatus = 0 | 1 | 2 | 3 | 4 | 5
export type OrderFulfillmentType = 1 | 2 | 'pickup' | 'delivery'

export const ORDER_STATUS_LABEL: Record<number, string> = {
  0: 'Pending',
  1: 'Confirmed',
  2: 'Processing',
  3: 'Ready for Pickup',
  4: 'Completed',
  5: 'Cancelled',
}

export interface OrderItem {
  id?: number
  productId: number
  productVariantId: number
  productNameEn: string
  productNameAr?: string
  variantNameEn: string
  variantNameAr?: string
  sku: string
  quantity: number
  baseUnitPrice: number
  unitPrice: number
  totalPrice: number
  hadOffer: boolean
}

export interface OrderStatusHistoryEntry {
  id: number
  status: OrderStatus
  statusText: string
  notes?: string
  createdAt: string
}

export interface OrderAddressDto {
  id: number
  label: string
  fullAddress: string
  city: string
  phoneNumber: string
}

export type DeliveryStatus = 0 | 1 | 2 | 3

export interface DeliveryOwnerInfo {
  id: number
  fullName: string
  nationalId: string
  phone: string
  address: string
}

export interface DeliveryAssignment {
  id: number
  orderId: number
  orderNumber: string
  vehicleId: number
  plateNumber: string
  vehicleType: string
  owner: DeliveryOwnerInfo
  deliveryStatus: DeliveryStatus
  statusText: string
  assignedAt: string
  startedAt?: string
  deliveredAt?: string
  cancelledAt?: string
  notes?: string
}

export interface Order {
  id: number
  orderNumber: string
  branchId: number
  branchName: string
  branchAddress?: string
  customerId?: number
  customerName: string
  customerPhone: string
  customerEmail?: string
  paymentMethod?: number
  paymentMethodText: string
  paymentStatus?: number
  paymentStatusText?: string
  subtotal: number
  discountAmount: number
  promoCodeUsed?: string
  tax: number
  total: number
  walletAmountApplied?: number
  amountDue?: number
  status: OrderStatus
  statusText: string
  totalItems?: number
  fulfillmentType?: OrderFulfillmentType
  deliveryFee?: number
  deliveryAddress?: OrderAddressDto | null
  pickupAddress?: OrderAddressDto | null
  pickupDate?: string
  pickedUpAt?: string
  customerNotes?: string
  adminNotes?: string
  cancellationReason?: string
  createdAt: string
  updatedAt?: string
  completedAt?: string
  cancelledAt?: string
  pointOfSaleId?: number
  pointOfSaleName?: string
  items: OrderItem[]
  statusHistory?: OrderStatusHistoryEntry[]
  deliveryAssignment?: DeliveryAssignment | null
}

// ─── Address ─────────────────────────────────────────────────────────────────
export interface CustomerAddress {
  id: number
  label: string
  street: string
  district?: string
  city: string
  country: string
  postalCode?: string
  phoneNumber: string
  isDefault: boolean
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export interface WishlistItem {
  id: number
  productId: number
  productVariantId: number
  productNameEn: string
  productNameAr: string
  variantNameEn: string
  variantNameAr?: string
  brand?: string
  imagePath?: string
  basePrice: number
  currentPrice: number
  hasActiveOffer: boolean
  discountPercentage?: number
  isAvailableInAnyBranch: boolean
  addedAt: string
}

// ─── Aliases (للتوافق مع الملفات التي تستخدم أسماء قديمة) ───────────────────
export type CustomerInfo         = CustomerUser
export type PromoValidateResult  = PromoResult
export type Address              = CustomerAddress

export interface AddToCartPayload {
  productId: number
  productVariantId: number
  branchId: number
  quantity: number
}

export type FulfillmentType = 'pickup' | 'delivery'

export interface CreateOrderPayload {
  branchId: number

  /** Backwards-compatible: API currently expects pickupAddressId. For delivery we reuse this id. */
  pickupAddressId: number

  /** New (frontend-only for now) */
  fulfillmentType?: FulfillmentType
  deliveryAddressId?: number
  deliveryFee?: number

  customerName: string
  customerPhone: string
  customerEmail?: string
  paymentMethod?: number
  customerNotes?: string
  preferredPickupDate?: string
  promoCode?: string
  useWalletBalance?: boolean
}

export type CustomerWalletTransactionType = 1 | 2 | 3 | 4

export interface CustomerWalletTransaction {
  id: number
  type: CustomerWalletTransactionType
  typeText: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  replacementRequestId?: number | null
  returnRequestId?: number | null
  orderId?: number | null
  orderNumber?: string | null
  branchId?: number | null
  notes?: string | null
  createdAt: string
}

export interface CustomerWalletDetails {
  walletId: number
  customerId: number
  customerName: string
  customerEmail: string
  customerPhone?: string | null
  balance: number
  totalTransactions: number
  branchCreditTotal: number
  lastTransactionAt?: string | null
  transactions: CustomerWalletTransaction[]
}

export interface Wishlist {
  items: WishlistItem[]
  totalItems: number
}

export interface CreateAddressPayload {
  label: string
  street: string
  district?: string
  city: string
  country?: string
  postalCode?: string
  phoneNumber: string
  latitude?: number
  longitude?: number
  isDefault?: boolean
}
// ─── Phase 3: Product Listing & Facets ───────────────────────────────────────

export interface VariantAttribute {
  attributeId: number
  attributeNameEn: string
  attributeNameAr: string
  optionId?: number
  valueEn?: string
  valueAr?: string
  colorHex?: string
  rawValue?: string
}

export interface OptionSummary {
  id: number
  valueEn: string
  valueAr: string
  colorHex?: string
}

export interface AttributeSummary {
  attributeId: number
  nameEn: string
  nameAr: string
  options: OptionSummary[]
}

export interface ProductSummary {
  id: number
  nameEn: string
  nameAr: string
  brand?: string
  brandId?: number
  brandNameEn?: string
  brandNameAr?: string
  imagePath: string
  categoryId: number
  categoryNameEn: string
  categoryNameAr: string
  minPrice: number
  minCurrentPrice: number
  hasActiveOffer: boolean
  variantCount: number
  variantAttributes: AttributeSummary[]
}

export interface ProductPage {
  items: ProductSummary[]
  totalCount: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PriceRange {
  min: number
  max: number
}

export interface FacetBrand {
  id: number
  nameEn: string
  nameAr: string
  logoPath?: string
  count: number
}

export interface FacetOption {
  optionId: number
  valueEn: string
  valueAr: string
  colorHex?: string
  count: number
}

export interface FacetAttribute {
  attributeId: number
  nameEn: string
  nameAr: string
  options: FacetOption[]
}

export interface Facets {
  priceRange: PriceRange
  brands: FacetBrand[]
  attributes: FacetAttribute[]
  totalResults: number
}

export interface ProductQuery {
  categoryId?: number
  brandId?: number
  minPrice?: number
  maxPrice?: number
  search?: string
  branchId?: number
  attrs?: Record<number, string>   // { attributeId: "optionId1,optionId2" }
  page?: number
  limit?: number
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_ar_asc'
}
