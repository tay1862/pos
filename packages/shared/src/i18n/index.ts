// ──────────────────────────────────────────
// i18n - Thai / Lao translations
// ──────────────────────────────────────────

export type Language = 'th' | 'lo';

export const translations = {
  th: {
    // ── Common ──
    app_name: 'ระบบ POS',
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    delete: 'ลบ',
    edit: 'แก้ไข',
    search: 'ค้นหา',
    confirm: 'ยืนยัน',
    back: 'กลับ',
    done: 'เสร็จ',
    loading: 'กำลังโหลด...',
    error: 'เกิดข้อผิดพลาด',
    success: 'สำเร็จ',
    yes: 'ใช่',
    no: 'ไม่',

    // ── Auth ──
    login: 'เข้าสู่ระบบ',
    logout: 'ออกจากระบบ',
    email: 'อีเมล',
    password: 'รหัสผ่าน',
    enter_pin: 'กรอก PIN',
    select_store: 'เลือกร้านค้า',
    staff_login: 'เข้าสู่ระบบพนักงาน',

    // ── POS Sell Screen ──
    sell: 'ขายหน้าร้าน',
    all_categories: 'ทั้งหมด',
    search_product: 'ค้นหาสินค้า / สแกนบาร์โค้ด',
    scan_barcode: 'สแกนบาร์โค้ด',
    out_of_stock: 'สินค้าหมด',
    low_stock: 'ใกล้หมด',

    // ── Cart ──
    cart: 'ตะกร้า',
    cart_empty: 'ยังไม่มีสินค้าในตะกร้า',
    add_customer: 'เพิ่มลูกค้า',
    add_note: 'เพิ่มหมายเหตุ',
    discount: 'ส่วนลด',
    tax: 'ภาษี',
    subtotal: 'ยอดรวม',
    total: 'ยอดสุทธิ',
    items: 'รายการ',
    quantity: 'จำนวน',

    // ── Tickets ──
    new_bill: 'บิลใหม่',
    hold_bill: 'พักบิล',
    open_tickets: 'บิลที่พักไว้',
    ticket_name: 'ชื่อบิล',
    no_tickets: 'ไม่มีบิลที่พักไว้',
    merge_tickets: 'รวมบิล',
    assign_staff: 'มอบหมายพนักงาน',

    // ── Payment ──
    pay: 'ชำระเงิน',
    payment: 'การชำระเงิน',
    cash: 'เงินสด',
    transfer: 'โอนเงิน',
    other_payment: 'อื่น ๆ',
    amount_received: 'จำนวนเงินที่รับ',
    received_amount: 'รับเงินมา',
    change: 'เงินทอน',
    transfer_ref: 'เลขที่อ้างอิงการโอน',
    reference_note: 'เลขอ้างอิง / หมายเหตุ',
    confirm_payment: 'ยืนยันการชำระเงิน',
    quick_cash: 'จำนวนเงินด่วน',
    processing: 'กำลังประมวลผล...',
    total_due: 'ยอดที่ต้องชำระ',
    exact: 'พอดี',
    round_up: 'ปัดเศษ',
    optional: 'ไม่บังคับ',
    store_name_placeholder: 'KINSAEP POS',
    order_no: 'เลขที่บิล',
    payment_method: 'วิธีชำระเงิน',
    thank_you: 'ขอบคุณที่ใช้บริการ',
    insufficient_amount: 'ยอดรับเงินน้อยกว่ายอดที่ต้องชำระ',
    payment_failed: 'การชำระเงินล้มเหลว',

    // ── Receipt ──
    receipt: 'ใบเสร็จ',
    print_receipt: 'พิมพ์ใบเสร็จ',
    email_receipt: 'ส่งทางอีเมล',
    new_sale: 'ขายรายการใหม่',

    // ── Sales History ──
    sales_history: 'ประวัติบิล',
    daily_summary: 'สรุปยอดประจำวัน',
    close_shift: 'ปิดรอบขาย',

    // ── Products ──
    products: 'สินค้า',
    add_product: 'เพิ่มสินค้า',
    product_name: 'ชื่อสินค้า',
    price: 'ราคา',
    cost: 'ต้นทุน',
    category: 'หมวดหมู่',
    categories: 'หมวดหมู่ทั้งหมด',
    barcode: 'บาร์โค้ด',
    no_categories: 'ไม่พบหมวดหมู่',
    no_products: 'ไม่พบสินค้า',

    // ── Inventory / Stock ──
    inventory: 'คลังสินค้า',
    receive_stock: 'รับสินค้าเข้า',
    confirm_receive: 'ยืนยันการรับ',
    stock_remaining: 'คงเหลือ',
    lot_number: 'เลขล็อต',
    expiry_date: 'วันหมดอายุ',
    cost_per_unit: 'ต้นทุนต่อหน่วย',
    quantity_received: 'จำนวนที่รับ',
    receive_success: 'รับสินค้าสำเร็จ',
    insufficient_stock: 'สินค้าไม่เพียงพอ',
    stock_blocked: 'ไม่สามารถชำระเงินได้ เนื่องจากสินค้าในสต็อกไม่เพียงพอ',
    invalid_quantity: 'กรุณากรอกจำนวนที่ถูกต้อง',
    invalid_cost: 'กรุณากรอกต้นทุนที่ถูกต้อง',
    stock: 'สต็อก',
    in_stock: 'มีสินค้า',
    out_of_stock_item: 'สินค้าหมด',
    low_stock_alert: 'สินค้าใกล้หมด (เหลือ {{count}} ชิ้น)',
    fifo_cost: 'ต้นทุนถัวเฉลี่ย (FIFO)',

    // ── Sync ──
    synced: 'ซิงค์แล้ว',
    syncing: 'กำลังซิงค์...',
    offline: 'ออฟไลน์',
    online: 'ออนไลน์',

    // ── Customers ──
    customers: 'ลูกค้า',
    customer_name: 'ชื่อลูกค้า',
    phone: 'เบอร์โทร',
    points: 'แต้มสะสม',

    // ── Staff ──
    staff: 'พนักงาน',
    staff_name: 'ชื่อพนักงาน',
    role: 'ตำแหน่ง',
    pin_code: 'รหัส PIN',


    // ── Reports / Dashboard ──
    reports: 'รายงาน',
    dashboard: 'Dashboard',
    sales_report: 'รายงานขาย',
    monthly_report: 'รายงานรายเดือน',
    daily_sales: 'ยอดขายรายวัน',
    monthly_sales: 'ยอดขายรายเดือน',
    top_products: 'สินค้าขายดี',
    gross_profit: 'กำไรขั้นต้น',
    total_revenue: 'รายได้รวม',
    total_cost: 'ต้นทุนรวม',
    total_orders: 'จำนวนบิล',
    items_sold: 'ชิ้นที่ขายได้',
    revenue: 'รายได้',
    profit: 'กำไร',
    orders: 'บิล',
    date: 'วันที่',
    month: 'เดือน',
    today: 'วันนี้',
    this_week: '7 วัน',
    this_week_label: 'สัปดาห์นี้',
    this_month: 'เดือนนี้',
    daily_trend: 'รายวัน',
    payment_method_breakdown: 'วิธีชำระเงิน',
    no_sales_data: 'ยังไม่มีข้อมูลการขายในช่วงเวลานี้',
    no_data: 'ไม่มีข้อมูล',

    // ── Settings ──
    settings: 'ตั้งค่า',
    store_info: 'ข้อมูลร้าน',
    printer: 'เครื่องพิมพ์',
    language: 'ภาษา',
    backup: 'สำรองข้อมูล',

    // ── Sync ──
    online: 'ออนไลน์',
    syncing: 'กำลัง sync',
    syncing_data: 'กำลังซิงก์ข้อมูล...',
    offline: 'ออฟไลน์',
    pending_sync: 'รอ sync',

    // ── Roles ──
    role_owner: 'เจ้าของร้าน',
    role_manager: 'ผู้จัดการ',
    role_cashier: 'พนักงานเก็บเงิน',
    role_staff: 'พนักงาน',

    // ── Printer ──
    'printer.settings': 'ตั้งค่าเครื่องพิมพ์',
    'printer.status': 'สถานะ',
    'printer.ready': 'พร้อมพิมพ์ ✅',
    'printer.not_ready': 'ยังไม่ได้เชื่อมต่อ',
    'printer.connect': 'เชื่อมต่อ',
    'printer.connect_failed': 'เชื่อมต่อไม่สำเร็จ',
    'printer.disconnect': 'ตัดการเชื่อมต่อ',
    'printer.connected': 'เชื่อมต่อสำเร็จ',
    'printer.not_connected': 'เครื่องพิมพ์ไม่ได้เชื่อมต่อ',
    'printer.connect_first': 'กรุณาเชื่อมต่อก่อน',
    'printer.connect_to_print': 'เชื่อมต่อเพื่อพิมพ์',
    'printer.go_to_settings': 'กรุณาเชื่อมต่อเครื่องพิมพ์ในหน้าตั้งค่าก่อน',
    'printer.scan': 'สแกน',
    'printer.paired_devices': 'อุปกรณ์ที่จับคู่แล้ว',
    'printer.no_devices': 'ไม่พบอุปกรณ์',
    'printer.pair_hint': 'กรุณาจับคู่ใน Bluetooth Settings ก่อน',
    'printer.scan_hint': 'กดสแกนเพื่อค้นหาเครื่องพิมพ์',
    'printer.test_print': 'พิมพ์ทดสอบ',
    'printer.print_failed': 'พิมพ์ไม่สำเร็จ',
    'printer.error': 'การพิมพ์ล้มเหลว',
    'printer.compatible': 'เครื่องพิมพ์ที่รองรับ',
    retry: 'ลองอีกครั้ง',
  },

  lo: {
    // ── Common ──
    app_name: 'ລະບົບ POS',
    save: 'ບັນທຶກ',
    cancel: 'ຍົກເລີກ',
    delete: 'ລຶບ',
    edit: 'ແກ້ໄຂ',
    search: 'ຄົ້ນຫາ',
    confirm: 'ຢືນຢັນ',
    back: 'ກັບຄືນ',
    done: 'ແລ້ວ',
    loading: 'ກຳລັງໂຫຼດ...',
    error: 'ເກີດຂໍ້ຜິດພາດ',
    success: 'ສຳເລັດ',
    yes: 'ແມ່ນ',
    no: 'ບໍ່',

    // ── Auth ──
    login: 'ເຂົ້າສູ່ລະບົບ',
    logout: 'ອອກຈາກລະບົບ',
    email: 'ອີເມວ',
    password: 'ລະຫັດຜ່ານ',
    enter_pin: 'ກະລຸນາໃສ່ PIN',
    select_store: 'ເລືອກຮ້ານ',
    staff_login: 'ເຂົ້າສູ່ລະບົບພະນັກງານ',

    // ── POS Sell Screen ──
    sell: 'ຂາຍໜ້າຮ້ານ',
    all_categories: 'ທັງໝົດ',
    search_product: 'ຄົ້ນຫາສິນຄ້າ / ສະແກນບາໂຄ້ດ',
    scan_barcode: 'ສະແກນບາໂຄ້ດ',
    out_of_stock: 'ສິນຄ້າໝົດ',
    low_stock: 'ໃກ້ໝົດ',

    // ── Cart ──
    cart: 'ກະຕ່າ',
    cart_empty: 'ຍັງບໍ່ມີສິນຄ້າໃນກະຕ່າ',
    add_customer: 'ເພີ່ມລູກຄ້າ',
    add_note: 'ເພີ່ມໝາຍເຫດ',
    discount: 'ສ່ວນຫຼຸດ',
    tax: 'ພາສີ',
    subtotal: 'ລວມ',
    total: 'ສຸດທິ',
    items: 'ລາຍການ',
    quantity: 'ຈຳນວນ',

    // ── Tickets ──
    new_bill: 'ບິນໃໝ່',
    hold_bill: 'ພັກບິນ',
    open_tickets: 'ບິນທີ່ພັກໄວ້',
    ticket_name: 'ຊື່ບິນ',
    no_tickets: 'ບໍ່ມີບິນທີ່ພັກໄວ້',
    merge_tickets: 'ລວມບິນ',
    assign_staff: 'ມອບໝາຍພະນັກງານ',

    // ── Payment ──
    pay: 'ຊຳລະເງິນ',
    payment: 'ການຊຳລະເງິນ',
    cash: 'ເງິນສົດ',
    transfer: 'ໂອນເງິນ',
    other_payment: 'ອື່ນໆ',
    amount_received: 'ຈຳນວນເງິນທີ່ຮັບ',
    received_amount: 'ຮັບເງິນມາ',
    change: 'ເງິນທອນ',
    transfer_ref: 'ເລກອ້າງອີງການໂອນ',
    reference_note: 'ເລກອ້າງອີງ / ໝາຍເຫດ',
    confirm_payment: 'ຢືນຢັນການຊຳລະ',
    quick_cash: 'ຈຳນວນເງິນດ່ວນ',
    processing: 'ກຳລັງປະມວນຜົນ...',
    total_due: 'ຍອດທີ່ຕ້ອງຊຳລະ',
    exact: 'ພໍດີ',
    round_up: 'ປັດເສດ',
    optional: 'ບໍ່ບັງຄັບ',
    store_name_placeholder: 'KINSAEP POS',
    order_no: 'ເລກທີບິນ',
    payment_method: 'ວິທີຊຳລະເງິນ',
    thank_you: 'ຂອບໃຈທີ່ໃຊ້ບໍລິການ',
    insufficient_amount: 'ຍອດຮັບເງິນໜ້ອຍກວ່າຍອດທີ່ຕ້ອງຊຳລະ',
    payment_failed: 'ການຊຳລະເງິນລົ້ມເຫຼວ',

    // ── Receipt ──
    receipt: 'ໃບບິນ',
    print_receipt: 'ພິມໃບບິນ',
    email_receipt: 'ສົ່ງທາງອີເມວ',
    new_sale: 'ຂາຍລາຍການໃໝ່',

    // ── Sales History ──
    sales_history: 'ປະຫວັດບິນ',
    daily_summary: 'ສະຫຼຸບຍອດປະຈຳວັນ',
    close_shift: 'ປິດຮອບຂາຍ',

    // ── Products ──
    products: 'ສິນຄ້າ',
    add_product: 'ເພີ່ມສິນຄ້າ',
    product_name: 'ຊື່ສິນຄ້າ',
    price: 'ລາຄາ',
    cost: 'ຕົ້ນທຶນ',
    category: 'ໝວດໝູ່',
    categories: 'ໝວດໝູ່ທັງໝົດ',
    barcode: 'ບາໂຄ້ດ',
    no_categories: 'ບໍ່ພົບໝວດໝູ່',
    no_products: 'ບໍ່ພົບສິນຄ້າ',

    // ── Inventory / Stock ──
    inventory: 'ຄັງສິນຄ້າ',
    receive_stock: 'ຮັບສິນຄ້າເຂົ້າ',
    confirm_receive: 'ຢືນຢັນການຮັບ',
    stock_remaining: 'ຄົງເຫຼືອ',
    lot_number: 'ເລກລ໋ອດ',
    expiry_date: 'ວັນໝົດອາຍຸ',
    cost_per_unit: 'ຕົ້ນທຶນຕໍ່ໜ່ວຍ',
    quantity_received: 'ຈຳນວນທີ່ຮັບ',
    receive_success: 'ຮັບສິນຄ້າສຳເລັດ',
    insufficient_stock: 'ສິນຄ້າບໍ່ພຽງພໍ',
    stock_blocked: 'ບໍ່ສາມາດຊໍາລະໄດ້ ເນື່ອງຈາກສິນຄ້າໃນສະຕ໋ອກບໍ່ພຽງພໍ',
    invalid_quantity: 'ກະລຸນາໃສ່ຈຳນວນທີ່ຖືກຕ້ອງ',
    invalid_cost: 'ກະລຸນາໃສ່ຕົ້ນທຶນທີ່ຖືກຕ້ອງ',
    stock: 'ສະຕ໋ອກ',
    in_stock: 'ມີສິນຄ້າ',
    out_of_stock_item: 'ສິນຄ້າໝົດ',
    low_stock_alert: 'ສິນຄ້າໃກ້ໝົດ (ເຫຼືອ {{count}} ຊິ້ນ)',
    fifo_cost: 'ຕົ້ນທຶນສະເລ່ຍ (FIFO)',

    // ── Sync ──
    synced: 'ຊິງຄ໌ແລ້ວ',
    syncing: 'ກຳລັງຊິງຄ໌...',
    offline: 'ອອຟໄລ',
    online: 'ອອນໄລ',

    // ── Customers ──
    customers: 'ລູກຄ້າ',
    customer_name: 'ຊື່ລູກຄ້າ',
    phone: 'ເບີໂທ',
    points: 'ແຕ້ມສະສົມ',

    // ── Staff ──
    staff: 'ພະນັກງານ',
    staff_name: 'ຊື່ພະນັກງານ',
    role: 'ຕຳແໜ່ງ',
    pin_code: 'ລະຫັດ PIN',

    // ── Reports / Dashboard ──
    reports: 'ລາຍງານ',
    dashboard: 'Dashboard',
    sales_report: 'ລາຍງານຂາຍ',
    monthly_report: 'ລາຍງານປະຈຳເດືອນ',
    daily_sales: 'ຍອດຂາຍປະຈຳວັນ',
    monthly_sales: 'ຍອດຂາຍປະຈຳເດືອນ',
    top_products: 'ສິນຄ້າຂາຍດີ',
    gross_profit: 'ກຳໄລຂັ້ນຕົ້ນ',
    total_revenue: 'ລາຍໄດ້ລວມ',
    total_cost: 'ຕົ້ນທຶນລວມ',
    total_orders: 'ຈຳນວນບິນ',
    items_sold: 'ຊິ້ນທີ່ຂາຍ',
    revenue: 'ລາຍໄດ້',
    profit: 'ກຳໄລ',
    orders: 'ບິນ',
    date: 'ວັນທີ',
    month: 'ເດືອນ',
    today: 'ມື້ນີ້',
    this_week: '7 ວັນ',
    this_week_label: 'ອາທິດນີ້',
    this_month: 'ເດືອນນີ້',
    daily_trend: 'ປະຈຳວັນ',
    payment_method_breakdown: 'ວິທີຊຳລະ',
    no_sales_data: 'ຍັງບໍ່ມີຂໍ້ມູນການຂາຍໃນຊ່ວງເວລານີ້',
    no_data: 'ບໍ່ມີຂໍ້ມູນ',

    // ── Settings ──
    settings: 'ຕັ້ງຄ່າ',
    store_info: 'ຂໍ້ມູນຮ້ານ',
    printer: 'ເຄື່ອງພິມ',
    language: 'ພາສາ',
    backup: 'ສຳຮອງຂໍ້ມູນ',

    // ── Sync ──
    online: 'ອອນລາຍ',
    syncing: 'ກຳລັງ sync',
    syncing_data: 'ກຳລັງຊິງກ໌ຂໍ້ມູນ...',
    offline: 'ອອບລາຍ',
    pending_sync: 'ລໍຖ້າ sync',

    // ── Roles ──
    role_owner: 'ເຈົ້າຂອງຮ້ານ',
    role_manager: 'ຜູ້ຈັດການ',
    role_cashier: 'ພະນັກງານເກັບເງິນ',
    role_staff: 'ພະນັກງານ',

    // ── Printer ──
    'printer.settings': 'ຕັ້ງຄ່າເຄື່ອງພິມ',
    'printer.status': 'ສະຖານະ',
    'printer.ready': 'ພ້ອມພິມ ✅',
    'printer.not_ready': 'ຍັງບໍ່ໄດ້ເຊື່ອມຕໍ່',
    'printer.connect': 'ເຊື່ອມຕໍ່',
    'printer.connect_failed': 'ເຊື່ອມຕໍ່ບໍ່ສຳເລັດ',
    'printer.disconnect': 'ຕັດການເຊື່ອມຕໍ່',
    'printer.connected': 'ເຊື່ອມຕໍ່ສຳເລັດ',
    'printer.not_connected': 'ເຄື່ອງພິມບໍ່ໄດ້ເຊື່ອມຕໍ່',
    'printer.connect_first': 'ກະລຸນາເຊື່ອມຕໍ່ກ່ອນ',
    'printer.connect_to_print': 'ເຊື່ອມຕໍ່ເພື່ອພິມ',
    'printer.go_to_settings': 'ກະລຸນາເຊື່ອມຕໍ່ເຄື່ອງພິມໃນໜ້າຕັ້ງຄ່າ',
    'printer.scan': 'ສະແກນ',
    'printer.paired_devices': 'ອຸປະກອນທີ່ຈັບຄູ່ແລ້ວ',
    'printer.no_devices': 'ບໍ່ພົບອຸປະກອນ',
    'printer.pair_hint': 'ກະລຸນາຈັບຄູ່ໃນ Bluetooth Settings ກ່ອນ',
    'printer.scan_hint': 'ກົດສະແກນເພື່ອຄົ້ນຫາເຄື່ອງພິມ',
    'printer.test_print': 'ພິມທົດສອບ',
    'printer.print_failed': 'ພິມບໍ່ສຳເລັດ',
    'printer.error': 'ການພິມລົ້ມເຫລວ',
    'printer.compatible': 'ເຄື່ອງພິມທີ່ຮອງຮັບ',
    retry: 'ລອງໃໝ່',
  },
} as const;

export type TranslationKey = keyof typeof translations.th;

/**
 * Get translation by key and language
 */
export function t(key: TranslationKey, lang: Language = 'th'): string {
  return translations[lang][key] || key;
}
