import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

const APP_SECRET = process.env.APP_SECRET!;


async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create OWNER user
  const adminEmail = 'admin@kanghan.site';
  const adminPassword = 'Admin123456';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const owner = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: passwordHash,
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash: passwordHash,
      name: 'KINSAEP Admin',
      role: 'OWNER',
      isActive: true,
    },
  });
  console.log(`✅ Owner created: ${owner.email}`);

  // 2. Create STORE
  const store = await prisma.store.upsert({
    where: { id: 'demo-store-id' }, // Use a fixed ID for upsert or find first
    update: {},
    create: {
      id: 'demo-store-id',
      name: 'KINSAEP Demo Store',
      currency: 'LAK',
    },
  });
  console.log(`✅ Store created: ${store.name}`);

  // 3. Link owner to store
  await prisma.storeUser.upsert({
    where: {
      userId_storeId: {
        userId: owner.id,
        storeId: store.id,
      },
    },
    update: {},
    create: {
      userId: owner.id,
      storeId: store.id,
      role: 'OWNER',
    },
  });
  console.log('✅ Owner linked to store');

  // 4. Create STAFF
  const cashierPin = '1234';
  const pinPayload = store.id + cashierPin + APP_SECRET;
  const pinHash = crypto.createHash('sha256').update(pinPayload).digest('hex');

  const staff = await prisma.staff.upsert({
    where: { id: 'demo-staff-id' },
    update: {
      pinHash: pinHash,
    },
    create: {
      id: 'demo-staff-id',
      storeId: store.id,
      name: 'Cashier',
      role: 'CASHIER',
      pinHash: pinHash,
      isActive: true,
    },
  });
  console.log(`✅ Staff created: ${staff.name} (PIN: ${cashierPin})`);

  // 5. Create BASIC CATEGORIES
  const categories = [
    { id: 'cat-drinks', name: 'Drinks' },
    { id: 'cat-food', name: 'Food' },
    { id: 'cat-snacks', name: 'Snacks' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { name: cat.name },
      create: {
        id: cat.id,
        storeId: store.id,
        name: cat.name,
        isActive: true,
      },
    });
  }
  console.log('✅ Categories created');

  // 6. Create BASIC PRODUCTS
  const products = [
    { id: 'prod-coffee', name: 'Coffee', catId: 'cat-drinks' },
    { id: 'prod-tea', name: 'Tea', catId: 'cat-drinks' },
    { id: 'prod-water', name: 'Water', catId: 'cat-drinks' },
    { id: 'prod-chips', name: 'Chips', catId: 'cat-snacks' },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: {
        name: prod.name,
        price: 1000,
      },
      create: {
        id: prod.id,
        storeId: store.id,
        categoryId: prod.catId,
        name: prod.name,
        price: 1000,
        cost: 500,
        isActive: true,
        trackStock: true,
        stockQuantity: 50,
      },
    });
  }
  console.log('✅ Products created');

  // 7. Create INITIAL INVENTORY LOTS
  for (const prod of products) {
    await prisma.inventoryLot.upsert({
      where: { id: `lot-${prod.id}` },
      update: {},
      create: {
        id: `lot-${prod.id}`,
        storeId: store.id,
        productId: prod.id,
        quantity: 50,
        remaining: 50,
        costPerUnit: 500,
        receivedAt: new Date(),
      },
    });
  }
  console.log('✅ Inventory lots created');

  console.log('✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
