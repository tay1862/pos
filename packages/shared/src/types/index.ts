// ──────────────────────────────────────────
// Shared Types for POS System
// ──────────────────────────────────────────

// ── Auth ──
export type UserRole = 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'CASHIER' | 'STAFF';

export interface StaffInfo {
  id: string;
  name: string;
  role: UserRole;
  storeId: string;
}

// ── Products ──
export interface ProductItem {
  id: string;
  storeId: string;
  categoryId: string | null;
  name: string;
  nameLao: string | null;
  sku: string | null;
  barcode: string | null;
  price: number;
  cost: number;
  image: string | null;
  trackStock: boolean;
  lowStockAlert: number;
  isActive: boolean;
  sortOrder: number;
  currentStock: number;
}

export interface CategoryItem {
  id: string;
  storeId: string;
  name: string;
  nameLao: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
}

// ── Cart ──
export interface CartItem {
  id: string; // unique cart line id
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  note: string | null;
  total: number; // price * quantity
}

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface CartState {
  items: CartItem[];
  customerId: string | null;
  customerName: string | null;
  discountType: DiscountType | null;
  discountValue: number;
  discountAmount: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  note: string | null;
}

// ── Tickets (Open Bills) ──
export type TicketStatus = 'OPEN' | 'COMPLETED' | 'CANCELLED';

export interface TicketInfo {
  id: string;
  storeId: string;
  staffId: string | null;
  staffName: string | null;
  customerId: string | null;
  customerName: string | null;
  name: string | null;
  status: TicketStatus;
  itemCount: number;
  total: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Orders ──
export type OrderStatus = 'COMPLETED' | 'REFUNDED' | 'VOIDED';
export type PaymentMethod = 'CASH' | 'TRANSFER' | 'OTHER';

export interface OrderInfo {
  id: string;
  orderNumber: string;
  staffName: string | null;
  customerName: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  status: OrderStatus;
  payments: PaymentInfo[];
  items: OrderItemInfo[];
  createdAt: string;
}

export interface OrderItemInfo {
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  note: string | null;
}

export interface PaymentInfo {
  method: PaymentMethod;
  amount: number;
  received: number;
  change: number;
  reference: string | null;
}

// ── Customers ──
export interface CustomerInfo {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  points: number;
}

// ── Inventory ──
export type MovementType = 'RECEIVE' | 'SALE' | 'RETURN' | 'ADJUSTMENT' | 'TRANSFER';

export interface InventoryLotInfo {
  id: string;
  productId: string;
  productName: string;
  lotNumber: string | null;
  quantity: number;
  remaining: number;
  costPerUnit: number;
  expiryDate: string | null;
  receivedAt: string;
}

// ── Sync ──
export type SyncAction = 'CREATE' | 'UPDATE' | 'DELETE';
export type SyncStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
export type ConnectionStatus = 'ONLINE' | 'SYNCING' | 'OFFLINE';

export interface SyncQueueItem {
  id: string;
  entityType: string;
  entityId: string;
  action: SyncAction;
  payload: string;
  status: SyncStatus;
  retryCount: number;
  createdAt: string;
}
