import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

export async function ensureUserExists(userId: string) {
  if (!userId || typeof userId !== "string" || userId.trim() === "") {
    throw new Error("ensureUserExists: userId must be a non-empty string");
  }

  // Resolve email + name from Clerk
  let email: string;
  let name: string | null;

  const clerkUser = await currentUser();
  if (clerkUser) {
    email =
      clerkUser.emailAddresses?.[0]?.emailAddress || `${userId}@clerk.local`;
    name =
      clerkUser.firstName && clerkUser.lastName
        ? `${clerkUser.firstName} ${clerkUser.lastName}`
        : clerkUser.firstName || clerkUser.lastName || null;
  } else {
    // Fallback: fetch via clerkClient (API route context)
    const client = await clerkClient();
    const fetchedUser = await client.users.getUser(userId);
    email =
      fetchedUser.emailAddresses?.[0]?.emailAddress ||
      `${userId}@clerk.local`;
    name =
      fetchedUser.firstName && fetchedUser.lastName
        ? `${fetchedUser.firstName} ${fetchedUser.lastName}`
        : fetchedUser.firstName || fetchedUser.lastName || null;
  }

  // ── Step 1: Happy path — upsert by clerkId ────────────────────────────────
  try {
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: { email, name },   // keep email in sync with Clerk
      create: { clerkId: userId, email, name },
    });

    if (!user.clerkId) {
      throw new Error(
        `ensureUserExists: found User(id=${user.id}) with null clerkId`,
      );
    }

    return user;
  } catch (err) {
    // ── Step 2: Handle duplicate-email constraint (P2002) ──────────────────
    // This happens when the same email already exists under a different
    // (stale / test) clerkId. We adopt that row instead of crashing.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const existing = await prisma.user.findUnique({ where: { email } });

      if (existing) {
        // Re-claim the row: stamp it with the current Clerk user's id
        const updated = await prisma.user.update({
          where: { id: existing.id },
          data: { clerkId: userId, name },
        });

        if (!updated.clerkId) {
          throw new Error(
            `ensureUserExists: updated User(id=${updated.id}) still has null clerkId`,
          );
        }

        return updated;
      }
    }

    // ── Step 3: Anything else — re-throw ──────────────────────────────────
    throw err;
  }
}
