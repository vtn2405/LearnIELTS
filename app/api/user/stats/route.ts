import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user, streak] = await Promise.all([
    prisma.user.findUnique({
      where: { clerkId: userId },
      select: { targetBand: true, currentBand: true },
    }),
    prisma.userStreak.findUnique({
      where: { clerkId: userId },
      select: { currentStreak: true },
    }),
  ]);

  return NextResponse.json({
    targetBand: user?.targetBand ?? 7.0,
    currentBand: user?.currentBand ?? null,
    currentStreak: streak?.currentStreak ?? 0,
  });
}
