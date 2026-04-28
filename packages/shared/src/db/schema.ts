// ──────────────────────────────────────────
// SQLite Schema for Mobile Offline-First POS
// ──────────────────────────────────────────
// This mirrors the server Prisma schema but is
// optimized for local SQLite usage with sync tracking.

export const CREATE_TABLES_SQL = `
  -- ════════════════════════════════════
  -- Store (cached from server)
  -- ════════════════════════════════════
  CREATE TABLE IF NOT EXISTS stores (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    logo TEXT,
    tax_id TEXT,
    tax_rate REAL DEFAULT 0,
    currency TEXT DEFAULT 'THB',
    receipt_header TEXT,
    receipt_footer TEXT,
    server_id TEXT,
    synced INTEGER DEFAULT 0,
    last_modified TEXT DEFAULT (datetime('now')),
    deleted_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- ════════════════════════════════════
  -- Staff (cached for offline PIN login)
  -- ════════════════════════════════════
  CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL,
    name TEXT NOT NULL,
    pin_hash TEXT NOT NULL,
    role TEXT DEFAULT 'CASHIER',
    is_active INTEGER DEFAULT 1,
    server_id TEXT,
    synced INTEGER DEFAULT 0,
    last_modified TEXT DEFAULT (datetime('now')),
    deleted_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (store_id) REFERENCES stores(id)
  );

  -- ════════════════════════════════════
  -- Categories
  -- ════════════════════════════════════
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL,
    name TEXT NOT NULL,
    name_lao TEXT,
    icon TEXT,
    color TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    server_id TEXT,
    synced INTEGER DEFAULT 0,
    last_modified TEXT DEFAULT (datetime('now')),
    deleted_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (store_id) REFERENCES stores(id)
  );

  -- ════════════════════════════════════
  -- Products
  -- ════════════════════════════════════
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL,
    category_id TEXT,
    name TEXT NOT NULL,
    name_lao TEXT,
    description TEXT,
    sku TEXT,
    barcode TEXT,
    price REAL NOT NULL,
    cost REAL DEFAULT 0,
    image_url TEXT,
    track_stock INTEGER DEFAULT 1,
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    server_id TEXT,
    synced INTEGER DEFAULT 0,
    last_modified TEXT DEFAULT (datetime('now')),
    deleted_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );
  CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(store_id, barcode);
  CREATE INDEX IF NOT EXISTS idx_products_category ON products(store_id, category_id);

  -- ════════════════════════════════════
  -- Inventory Lots (FIFO)
  -- ════════════════════════════════════
  CREATE TABLE IF NOT EXISTS inventory_lots (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    lot_number TEXT,
    quantity INTEGER NOT NULL,
    remaining INTEGER NOT NULL,
    cost_per_unit REAL NOT NULL,
    expiry_date TEXT,
    received_at TEXT DEFAULT (datetime('now')),
    server_id TEXT,
    synced INTEGER DEFAULT 0,
    last_modified TEXT DEFAULT (datetime('now')),
    deleted_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
  CREATE INDEX IF NOT EXISTS idx_lots_product ON inventory_lots(store_id, product_id, received_at);

  CREATE TABLE IF NOT EXISTS stock_movements (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    inventory_lot_id TEXT,
    order_id TEXT,
    type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    cost_per_unit REAL NOT NULL,
    reason TEXT,
    server_id TEXT,
    synced INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (inventory_lot_id) REFERENCES inventory_lots(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
  );
  CREATE INDEX IF NOT EXISTS idx_movements_product ON stock_movements(store_id, product_id, created_at);

  -- ════════════════════════════════════
  -- Tickets (Open Bills / Parked Orders)
  -- ════════════════════════════════════
  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL,
    device_id TEXT,
    staff_id TEXT,
    customer_id TEXT,
    name TEXT,
    comment TEXT,
    status TEXT DEFAULT 'OPEN',
    subtotal REAL DEFAULT 0,
    discount_total REAL DEFAULT 0,
    tax_total REAL DEFAULT 0,
    total REAL DEFAULT 0,
    server_id TEXT,
    synced INTEGER DEFAULT 0,
    last_modified TEXT DEFAULT (datetime('now')),
    deleted_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (staff_id) REFERENCES staff(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS ticket_items (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    cost REAL DEFAULT 0,
    quantity INTEGER NOT NULL,
    note TEXT,
    discount_type TEXT,
    discount_value REAL DEFAULT 0,
    discount_total REAL DEFAULT 0,
    tax_total REAL DEFAULT 0,
    total REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  -- ════════════════════════════════════
  -- Orders (Completed Sales)
  -- ════════════════════════════════════
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL,
    device_id TEXT,
    staff_id TEXT,
    customer_id TEXT,
    ticket_id TEXT,
    order_number TEXT NOT NULL,
    subtotal REAL NOT NULL,
    discount_total REAL DEFAULT 0,
    tax_total REAL DEFAULT 0,
    total REAL NOT NULL,
    status TEXT DEFAULT 'PAID',
    server_id TEXT,
    synced INTEGER DEFAULT 0,
    last_modified TEXT DEFAULT (datetime('now')),
    deleted_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (staff_id) REFERENCES staff(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );
  CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(store_id, created_at);

  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    cost REAL DEFAULT 0,
    quantity INTEGER NOT NULL,
    note TEXT,
    discount_type TEXT,
    discount_value REAL DEFAULT 0,
    discount_total REAL DEFAULT 0,
    tax_total REAL DEFAULT 0,
    total REAL NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  -- ════════════════════════════════════
  -- Payments
  -- ════════════════════════════════════
  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    method TEXT NOT NULL,
    amount REAL NOT NULL,
    received_amount REAL DEFAULT 0,
    change_amount REAL DEFAULT 0,
    reference_note TEXT,
    status TEXT DEFAULT 'COMPLETED',
    server_id TEXT,
    synced INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  );

  -- ════════════════════════════════════
  -- Customers
  -- ════════════════════════════════════
  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    points INTEGER DEFAULT 0,
    note TEXT,
    server_id TEXT,
    synced INTEGER DEFAULT 0,
    last_modified TEXT DEFAULT (datetime('now')),
    deleted_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (store_id) REFERENCES stores(id)
  );
  CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(store_id, phone);

  -- ════════════════════════════════════
  -- Sync Metadata (incremental sync tracking)
  -- ════════════════════════════════════
  CREATE TABLE IF NOT EXISTS sync_metadata (
    entity_type TEXT PRIMARY KEY,
    last_synced_at TEXT NOT NULL
  );

  -- ════════════════════════════════════
  -- Sync Queue (offline changes pending upload)
  -- ════════════════════════════════════
  CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    payload TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    synced_at TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_sync_status ON sync_queue(store_id, status);

  -- ════════════════════════════════════
  -- Additional Indexes for Products
  -- ════════════════════════════════════
  CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(store_id, is_active);
  CREATE INDEX IF NOT EXISTS idx_products_name ON products(store_id, name);

  -- ════════════════════════════════════
  -- Settings (local)
  -- ════════════════════════════════════
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`;
