const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  console.log(`Total users: ${userCount}`);
  const users = await prisma.user.findMany({
    select: { id: true, clerkId: true, email: true },
  });
  console.log("Users:", users);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
