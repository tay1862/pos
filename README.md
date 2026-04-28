# KINSAEP POS — คู่มือการใช้งาน (User Manual)
## ระบบขายหน้าร้าน Offline-First Point of Sale

---

## 📑 สารบัญ

1. [ภาพรวมระบบ](#1-ภาพรวมระบบ)
2. [สถาปัตยกรรม](#2-สถาปัตยกรรม)
3. [การติดตั้ง Development](#3-การติดตั้ง-development)
4. [การ Deploy Production (VPS)](#4-การ-deploy-production-vps)
5. [การใช้งาน Mobile App](#5-การใช้งาน-mobile-app)
6. [API Reference](#6-api-reference)
7. [Database Schema](#7-database-schema)
8. [การ Sync ข้อมูล](#8-การ-sync-ข้อมูล)
9. [การสำรองข้อมูล](#9-การสำรองข้อมูล)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. ภาพรวมระบบ

KINSAEP POS เป็นระบบ Point of Sale แบบ **Offline-First** ออกแบบมาสำหรับร้านค้าปลีกในลาวและไทย

### คุณสมบัติหลัก
- ✅ **Offline-First**: ขายได้แม้ไม่มีอินเทอร์เน็ต (ข้อมูลเก็บใน SQLite บนเครื่อง)
- ✅ **FIFO Inventory**: คิดต้นทุนสินค้าแบบ First-In-First-Out อัตโนมัติ
- ✅ **Multi-Store**: รองรับหลายสาขา ข้อมูลแยกกัน
- ✅ **Open Ticket**: พักบิล / ดึงบิลกลับมาแก้ได้
- ✅ **Multi-Currency**: รองรับ LAK (กีบ) และ THB (บาท)
- ✅ **Bluetooth Printer**: พิมพ์ใบเสร็จผ่าน ESC/POS Bluetooth Printer
- ✅ **Reports & Dashboard**: รายงานยอดขาย, กำไร, สินค้าขายดี
- ✅ **Role-Based Access**: Owner / Manager / Cashier / Staff

### เทคโนโลยีที่ใช้
| Component | Technology |
|-----------|-----------|
| Mobile App | React Native (Expo) |
| Backend API | NestJS + TypeScript |
| Database (Server) | PostgreSQL + Prisma ORM |
| Database (Mobile) | SQLite (expo-sqlite) |
| Cache/Queue | Redis |
| Auth | JWT + bcrypt |
| State Management | Zustand |
| Container | Docker Compose |
| Reverse Proxy | Nginx |

---

## 2. สถาปัตยกรรม

```
┌─────────────────────────────────────────────┐
│                  MOBILE APP                  │
│  (React Native / Expo)                       │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │  Zustand  │  │  SQLite  │  │ Sync Queue│  │
│  │  Stores   │  │  (Local) │  │ (Offline) │  │
│  └──────────┘  └──────────┘  └─────┬─────┘  │
│                                     │        │
└─────────────────────────────────────┼────────┘
                                      │ POST /api/v1/sync/push
                                      ▼
┌─────────────────────────────────────────────┐
│                VPS SERVER                    │
│                                              │
│  ┌──────────────────────┐   ┌─────────────┐ │
│  │    NestJS API         │   │   Nginx     │ │
│  │  (Port 3000)         │◄──│  (80/443)   │ │
│  │                      │   └─────────────┘ │
│  │  Auth │ Sync │ Report│                    │
│  └──────┬───────────────┘                    │
│         │                                    │
│  ┌──────▼──────┐  ┌──────────┐              │
│  │ PostgreSQL  │  │  Redis   │              │
│  │ (Port 5432) │  │ (6379)   │              │
│  └─────────────┘  └──────────┘              │
└─────────────────────────────────────────────┘
```

---

## 3. การติดตั้ง Development

### ความต้องการ
- Node.js 20+
- npm 9+
- Docker & Docker Compose
- Expo CLI (`npm install -g expo-cli`)
- Android/iOS device หรือ Emulator

### ขั้นตอน

```bash
# 1. Clone repository
git clone https://github.com/tay1862/pos.git
cd pos

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# แก้ไข .env ตามต้องการ (ต้องตั้ง JWT_SECRET และ APP_SECRET)

# 4. Start database (PostgreSQL + Redis)
docker compose -f docker/docker-compose.yml up postgres redis -d

# 5. Generate Prisma client & push schema
npm run db:generate
npm run db:push

# 6. Start API server
npm run api

# 7. Start Mobile app (ใน terminal อีกหน้าต่าง)
npm run mobile
```

### Environment Variables ที่ต้องตั้ง
| Variable | Description | ตัวอย่าง |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/pos_db` |
| `JWT_SECRET` | Secret สำหรับ JWT token (**ต้องเปลี่ยน!**) | `random-string-64-chars` |
| `APP_SECRET` | Secret สำหรับ hash PIN (**ต้องเปลี่ยน!**) | `another-random-string` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `PORT` | API port | `3000` |
| `CORS_ORIGIN` | Allowed origins | `http://localhost:3001` |

---

## 4. การ Deploy Production (VPS)

### 4.1 เตรียม VPS (Ubuntu 22.04+)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io docker-compose -y
sudo systemctl enable docker
sudo systemctl start docker

# Setup Firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 4.2 Setup DNS
ชี้ Domain ไปที่ IP ของ VPS:
- `api.yourdomain.com` → VPS IP
- `admin.yourdomain.com` → VPS IP (ถ้ามี web admin)

### 4.3 Deploy

```bash
# Clone repo to VPS
git clone https://github.com/tay1862/pos.git
cd pos/docker

# Setup environment
cp .env.production.example .env
nano .env   # แก้ไข secrets ทั้งหมด!

# Deploy (Build + Start + Migrate)
chmod +x scripts/*.sh
./scripts/deploy.sh

# Setup SSL
sudo apt install certbot -y
sudo certbot certonly --webroot -w /var/www/certbot -d api.yourdomain.com
```

### 4.4 คำสั่งที่ใช้บ่อย

```bash
# ดู logs
docker compose logs -f api

# Restart ระบบ
docker compose restart api

# Backup database
./scripts/backup-db.sh

# Restore database
gunzip backups/kinsaep_pos_db_YYYYMMDD.sql.gz
docker exec -i kinsaep_pos_db psql -U pos_user kinsaep_pos < backups/kinsaep_pos_db_YYYYMMDD.sql
```

---

## 5. การใช้งาน Mobile App

### 5.1 Flow การเข้าใช้งาน

```
1. Owner Login (Email + Password)
       ↓
2. เลือกสาขา (Store Selection)
       ↓
3. Sync ข้อมูลเริ่มต้น (Categories, Products, Staff)
       ↓
4. Staff PIN Login (ใส่ PIN 4-6 หลัก)
       ↓
5. หน้าขาย POS (Sell Screen)
```

### 5.2 การขายสินค้า

1. **เลือกหมวดหมู่** จาก Sidebar ด้านซ้าย
2. **แตะสินค้า** ที่ต้องการเพิ่มในตะกร้า
3. **ปรับจำนวน** ด้วยปุ่ม +/- ในตะกร้า
4. **กด "Pay"** เพื่อชำระเงิน
5. **เลือกวิธีชำระ**: เงินสด / โอนเงิน / อื่นๆ
6. **ใส่ยอดรับ** (สำหรับเงินสด ระบบจะคำนวณเงินทอนให้)
7. **ยืนยัน** → ระบบสร้าง Order + ตัดสต็อก FIFO
8. **พิมพ์ใบเสร็จ** (ถ้าเชื่อมต่อ Printer) หรือ **ขายรายการใหม่**

### 5.3 การพักบิล (Hold Ticket)

1. เพิ่มสินค้าในตะกร้า
2. กด **"Hold"**
3. ตั้งชื่อบิล (เช่น "โต๊ะ 3") → **Save**
4. เริ่มขายบิลใหม่ได้เลย

### 5.4 การดึงบิลกลับ (Resume Ticket)

1. กด **"Open Tickets"**
2. เลือกบิลที่ต้องการ → กด **Resume**
3. แก้ไขรายการ / เพิ่มสินค้า
4. กด **Pay** เพื่อชำระ

### 5.5 รายงาน (Reports)

- **Dashboard**: ยอดรวมวันนี้/สัปดาห์/เดือน
- **Revenue**: รายได้รวม
- **Profit**: กำไรขั้นต้น (Revenue - FIFO Cost)
- **Top Products**: สินค้าขายดี
- **Payment Breakdown**: สัดส่วนการชำระเงิน

---

## 6. API Reference

### Base URL
```
Production: https://api.yourdomain.com/api/v1
Development: http://localhost:3000/api/v1
```

### Authentication
```
POST /auth/owner-login
Body: { "email": "owner@example.com", "password": "..." }
Response: { "access_token": "jwt...", "user": {...}, "stores": [...] }
```

### Protected Endpoints (ต้องส่ง Header: `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/staff/:storeId` | รายชื่อพนักงาน |
| POST | `/sync/push` | Push offline data |
| GET | `/stores/:id/inventory/lots` | รายการ Lot สินค้า |
| POST | `/stores/:id/inventory/lots` | รับสินค้าเข้า (Lot) |
| PATCH | `/stores/:id/inventory/lots/:lotId` | แก้ไข Lot |
| GET | `/stores/:id/reports/summary` | สรุปยอดขาย |
| GET | `/stores/:id/reports/top-products` | สินค้าขายดี |
| GET | `/stores/:id/reports/payments` | สัดส่วนการชำระ |
| GET | `/stores/:id/reports/daily-trend` | แนวโน้มรายวัน |
| GET | `/stores/:id/reports/monthly` | สรุปรายเดือน |
| GET | `/health` | Health check |

---

## 7. Database Schema

### PostgreSQL (Server)
- **stores** — ข้อมูลสาขา
- **users** — เจ้าของร้าน (Owner login)
- **store_users** — ความสัมพันธ์ User-Store
- **staff** — พนักงาน (PIN login)
- **categories** — หมวดหมู่สินค้า
- **products** — สินค้า
- **inventory_lots** — Lot สินค้า (FIFO)
- **stock_movements** — ประวัติการเคลื่อนไหวสต็อก
- **orders** — ออเดอร์
- **order_items** — รายการสินค้าในออเดอร์
- **payments** — การชำระเงิน
- **tickets** — บิลพัก (Open Bills)
- **sync_events** — Idempotency tracking

### SQLite (Mobile — Offline)
Mirror ของ PostgreSQL schema แต่มีเพิ่ม:
- `synced` (0/1) — flag ว่า sync กับ server แล้วหรือยัง
- `server_id` — ID จาก server
- `last_modified` — timestamp สำหรับ incremental sync
- `sync_queue` — คิวรอ upload ข้อมูลไป server
- `sync_metadata` — เก็บ last_synced_at ของแต่ละ entity type

---

## 8. การ Sync ข้อมูล

### Flow

```
[Mobile ขายสินค้า]
       ↓
[บันทึกใน SQLite + sync_queue status=PENDING]
       ↓
[เมื่อมี Internet → POST /api/v1/sync/push]
       ↓
[Server ตรวจ idempotency_key]
       ↓ (ไม่ซ้ำ)
[Server: Transaction → Order + Items + Payment + FIFO + SyncEvent]
       ↓
[Response: { successQueueIds, failedQueueIds }]
       ↓
[Mobile: mark queue items as SYNCED]
```

### Idempotency
- ทุก sync item มี `idempotency_key` (UUID unique)
- ถ้า server เคย process key นี้แล้ว → skip + return success
- ป้องกัน double-submit จาก network retry

---

## 9. การสำรองข้อมูล

### Backup อัตโนมัติ (แนะนำ)
```bash
# สร้าง cron job ทำ backup ทุกวัน ตอนตี 2
crontab -e
# เพิ่มบรรทัด:
0 2 * * * cd /path/to/pos/docker && ./scripts/backup-db.sh
```

### Backup Manual
```bash
cd docker
./scripts/backup-db.sh
# Output: backups/kinsaep_pos_db_20260428_020000.sql.gz
```

### Restore
```bash
gunzip backups/kinsaep_pos_db_YYYYMMDD.sql.gz
docker exec -i kinsaep_pos_db psql -U pos_user kinsaep_pos < backups/kinsaep_pos_db_YYYYMMDD.sql
```

---

## 10. Troubleshooting

### ❌ Mobile: "Network Error" ตอน Login
- ตรวจสอบว่า API server กำลังทำงาน (`docker compose logs api`)
- ตรวจสอบ CORS_ORIGIN ใน .env ว่ารองรับ mobile
- ตรวจสอบ `API_URL` ใน mobile config

### ❌ API: "JWT_SECRET environment variable is required"
- ต้องตั้ง `JWT_SECRET` ใน `.env` file
- Production: ใช้ random string ยาว 64+ ตัวอักษร

### ❌ Mobile: ขายได้แต่ sync ไม่ขึ้น
- ตรวจสอบ Internet connection
- ดู sync_queue ใน SQLite ว่ามี error อะไร
- ตรวจ API logs: `docker compose logs -f api`

### ❌ Printer: "เครื่องพิมพ์ไม่ได้เชื่อมต่อ"
- ตรวจว่า Bluetooth เปิดอยู่
- ไปที่ Settings → Pair Printer
- ลอง restart เครื่องพิมพ์

### ❌ Reports: ตัวเลขไม่ตรง
- ตรวจว่า orders มี `status = 'PAID'` และ `deleted_at IS NULL`
- ตรวจว่า `created_at` ใช้ UTC
- ตรวจ timezone ในหน้าแสดงผล

---

## 📋 Production Checklist

- [ ] เปลี่ยน JWT_SECRET เป็น random string ยาว 64+
- [ ] เปลี่ยน APP_SECRET เป็น random string ยาว 64+
- [ ] เปลี่ยน DB password ให้แข็งแรง
- [ ] เปลี่ยน Redis password ให้แข็งแรง
- [ ] ตั้ง CORS_ORIGIN ให้ตรงกับ domain จริง
- [ ] ตั้ง SSL certificate (Let's Encrypt)
- [ ] ตั้ง firewall (เปิดเฉพาะ 80, 443, SSH)
- [ ] ตั้ง automatic backup (cron)
- [ ] ทดสอบ sync flow ครบ (ขาย → sync → ตรวจ report)
- [ ] ทดสอบ printer กับเครื่องจริง

---

**Version:** 1.0.0  
**Last Updated:** 2026-04-28  
**Author:** KINSAEP Team
