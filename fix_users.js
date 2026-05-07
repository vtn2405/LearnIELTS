const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function fix() {
  // Xóa user với clerkId = null (user lỗi từ seed cũ)
  const deleted = await p.$queryRawUnsafe('DELETE FROM "User" WHERE "clerkId" IS NULL RETURNING id, email');
  console.log('Deleted bad users:', JSON.stringify(deleted));
  
  // Xác nhận còn lại
  const remaining = await p.$queryRawUnsafe('SELECT id, "clerkId", email FROM "User"');
  console.log('Remaining users:', JSON.stringify(remaining));
  
  process.exit(0);
}
fix().catch(e => { console.error(e.message); process.exit(1); });
