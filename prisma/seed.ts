import { PrismaClient, SubjectEnum, ActionEnum } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  await prisma.financialSettings.deleteMany();
  await prisma.financialSettings.createMany({
    data: Array.from({ length: 1 }).map(() => ({
      outrightMargin: 0.2, // 20%
      loanMargin: 0.15, // 15%
      monthlyInterest: 0.04, // 4%
    })),
  });
  
  await prisma.product.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productInventory.deleteMany();
  await prisma.inventoryBatch.deleteMany(); // Clear the existing batches
  await prisma.category.createMany({
    data: Array.from({ length: 10 }).map(() => ({
      name: faker.commerce.department(),
      type: faker.helpers.arrayElement(['INVENTORY', 'PRODUCT']),
    })),
  });

  const insertedInventoryCategories = await prisma.category.findMany();
  const inventoryCategoryIds = insertedInventoryCategories.map(
    (category) => category.id,
  );

  // Seed Inventories
  await prisma.inventory.createMany({
    data: Array.from({ length: 10 }).map(() => ({
      name: faker.commerce.productName(),
      manufacturerName: faker.person.fullName(),
      sku: faker.lorem.word(10),
      image: faker.image.url(),
      status: faker.helpers.arrayElement([
        'IN_STOCK',
        'OUT_OF_STOCK',
        'DISCONTINUED',
      ]), // Random inventory status
      class: faker.helpers.arrayElement(['REGULAR', 'RETURNED', 'REFURBISHED']), // Random inventory class
      inventoryCategoryId: faker.helpers.arrayElement(inventoryCategoryIds),
      inventorySubCategoryId: faker.helpers.arrayElement(inventoryCategoryIds),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null, // If not deleted, set as null
    })),
  });

  // Retrieve inserted inventories to get their ids
  const insertedInventories = await prisma.inventory.findMany();
  const inventoryIds = insertedInventories.map((inventory) => inventory.id);

  const insertedCategories = await prisma.category.findMany();
  const categoryIds = insertedCategories.map((category) => category.id);

  await prisma.product.createMany({
    data: Array.from({ length: 10 }).map(() => ({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      image: faker.image.url(),
      currency: 'NGN',
      paymentModes: faker.helpers.arrayElement(['CASH', 'CARD', 'PAYPAL']),
      isTokenable: faker.datatype.boolean(), // Randomly set tokenable to true or false
      categoryId: faker.helpers.arrayElement(categoryIds),
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  });

  // Query inserted products to get their ids
  const productIds = await prisma.product.findMany();
  const productIdsList = productIds.map((product) => product.id);

  // Seed ProductInventory (linking Products to Inventories)
  await prisma.productInventory.createMany({
    data: Array.from({ length: 10 }).map(() => ({
      productId: faker.helpers.arrayElement(productIdsList),
      inventoryId: faker.helpers.arrayElement(inventoryIds),
    })),
  });

  // Seed InventoryBatches
  await prisma.inventoryBatch.createMany({
    data: Array.from({ length: 10 }).map(() => ({
      batchNumber: Math.floor(Math.random() * 10000), // Generate a random batch number
      costOfItem: parseFloat(faker.commerce.price()), // Random cost of item
      price: parseFloat(faker.commerce.price()), // Random price
      numberOfStock: faker.number.int({ min: 1, max: 100 }), // Random stock number
      remainingQuantity: faker.number.int({ min: 1, max: 100 }), // Random remaining quantity
      inventoryId: faker.helpers.arrayElement(inventoryIds), // Set the inventory ID
    })),
  });

  // Seed Admin Role
  const adminRole = await prisma.role.upsert({
    where: { role: 'admin' },
    update: {},
    create: {
      role: 'admin',
      permissions: {
        create: [
          {
            action: ActionEnum.manage,
            subject: SubjectEnum.all,
          },
        ],
      },
    },
  });

  await prisma.agent.deleteMany();

  // Seed Users
  await prisma.user.createMany({
    data: Array.from({ length: 10 }).map(() => ({
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      username: faker.internet.username(),
      password: faker.internet.password(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      location: faker.location.city(),
      roleId: adminRole.id,
    })),
  });

  // Retrieve inserted users
  const users = await prisma.user.findMany();
  const userIds = users.map((user) => user.id);

  // Seed Agents
  await prisma.agent.createMany({
    data: Array.from({ length: 10 }).map(() => ({
      userId: faker.helpers.arrayElement(userIds),
      agentId: Math.floor(Math.random() * 900000) + 100000,
    })),
  });

  // Retrieve inserted agents
  const agents = await prisma.agent.findMany();
  const agentIds = agents.map((agent) => agent.id);

  // Seed Customers
  await prisma.customer.deleteMany();
  await prisma.customer.createMany({
    data: Array.from({ length: 10 }).map(() => ({
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      location: faker.location.city(),
      addressType: 'HOME',
      creatorId: faker.helpers.arrayElement(userIds),
      agentId: faker.helpers.arrayElement(agentIds),
      type: 'lead',
    })),
  });

  console.log('Seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
