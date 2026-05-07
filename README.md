# Web IELTS

Dự án mẫu cho web học IELTS với Next.js, TypeScript, Tailwind CSS và Prisma + PostgreSQL.

## Cài đặt

1. Sao chép `.env.example` thành `.env` và điền `DATABASE_URL`.
2. Chạy `npm install`.
3. Khởi tạo Prisma và migrate cơ sở dữ liệu:
   - `npx prisma generate`
   - `npx prisma migrate dev --name init`
4. Chạy dự án:
   - `npm run dev`

## Cấu trúc chính

- `app/` - App Router của Next.js
- `components/` - UI components chung
- `prisma/schema.prisma` - schema Prisma cho PostgreSQL
- `lib/prisma.ts` - Prisma client reuse

## Routes mẫu

- `/` - Dashboard
- `/grammar` - Grammar module
- `/writing` - Writing module
- `/speaking` - Speaking module
