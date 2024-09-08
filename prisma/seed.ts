import {
  PrismaClient,
  SubjectEnum,
  RolesEnum,
  ActionEnum,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Upsert Roles and Permissions
  const adminRole = await prisma.role.upsert({
    where: { role: RolesEnum.admin },
    update: {},
    create: {
      role: RolesEnum.admin,
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

  const customerRole = await prisma.role.upsert({
    where: { role: RolesEnum.customer },
    update: {},
    create: {
      role: RolesEnum.customer,
      permissions: {
        create: [
          {
            action: ActionEnum.read,
            subject: SubjectEnum.User,
          },
        ],
      },
    },
  });

  console.log({ adminRole, customerRole });
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
