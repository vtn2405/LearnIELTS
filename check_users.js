const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.$queryRawUnsafe('SELECT id, "clerkId", email FROM "User"')
  .then(r => { console.log(JSON.stringify(r, null, 2)); process.exit(0); })
  .catch(e => { console.error('ERROR:', e.message); process.exit(1); });
