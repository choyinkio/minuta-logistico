const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.findMany();
  const profiles = await prisma.profile.findMany();
  
  console.log('--- ROLES ---');
  console.log(JSON.stringify(roles, null, 2));
  console.log('--- PROFILES ---');
  console.log(JSON.stringify(profiles, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
