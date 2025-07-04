"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.$runCommandRaw({
        update: 'InstallmentAccountDetails',
        updates: [
            {
                q: { createdAt: { $type: 'string' } },
                u: [
                    { $set: { createdAt: { $toDate: '$createdAt' } } },
                ],
                multi: true,
            },
        ],
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
//# sourceMappingURL=seed.js.map