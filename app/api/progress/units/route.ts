import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progress = await prisma.unitProgress.findMany({
    where: {
      clerkId: userId,
      completedAt: { not: null },
    },
    select: {
      unitId: true,
      completedAt: true,
    },
    orderBy: { completedAt: "asc" },
  });

  return NextResponse.json({
    completedUnitIds: progress.map((item: { unitId: string }) => item.unitId),
  });
}
