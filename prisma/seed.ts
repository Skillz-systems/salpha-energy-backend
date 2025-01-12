import {
  PrismaClient,
  SubjectEnum,
  ActionEnum,
  InventoryStatus,
  InventoryClass,
} from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // Upsert Roles and Permissions
  // const adminRole = await prisma.role.upsert({
  //   where: { role: 'admin' },
  //   update: {},
  //   create: {
  //     role: 'admin',
  //     permissions: {
  //       create: [
  //         {
  //           action: ActionEnum.manage,
  //           subject: SubjectEnum.all,
  //         },
  //       ],
  //     },'
  //   },
  // });

  // const customerRole = await prisma.role.upsert({
  //   where: { role: 'customer' },
  //   update: {},
  //   create: {
  //     role: 'customer',
  //     permissions: {
  //       create: [
  //         {
  //           action: ActionEnum.manage,
  //           subject: SubjectEnum.User,
  //         },
  //       ],
  //     },
  //   },
  // });

  // console.log({ adminRole, customerRole });

  // Seed Category

  // await prisma.category.deleteMany();
await prisma.inventory.deleteMany();
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
  // await prisma.inventory.deleteMany();
  await prisma.inventoryBatch.deleteMany();
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
  // await prisma.user.deleteMany()

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

  // Seed InventoryBatches
  await prisma.inventoryBatch.deleteMany();
  await prisma.inventoryBatch.createMany({
    data: Array.from({ length: 10 }).map(() => ({
      batchNumber: Math.floor(Math.random() * 10000), // Generate a random batch number
      costOfItem: parseFloat(faker.commerce.price()), // Random cost of item
      price: parseFloat(faker.commerce.price()), // Random price
      numberOfStock: faker.number.int({ min: 1, max: 100 }), // Random stock number
      remainingQuantity: faker.number.int({ min: 1, max: 100 }), // Random remaining quantity
      inventoryId: faker.helpers.arrayElement(inventoryCategoryIds), // Set the inventory ID
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
