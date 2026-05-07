import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function ensureUserExists(userId: string) {
  if (!userId || typeof userId !== "string" || userId.trim() === "") {
    throw new Error("ensureUserExists: userId must be a non-empty string");
  }

  // Thử currentUser() trước (browser), fallback sang clerkClient (API token)
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
    // Fallback: lấy từ clerkClient bằng userId
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

  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {},
    create: { clerkId: userId, email, name },
  });

  if (!user.clerkId) {
    throw new Error(
      `ensureUserExists: found User(id=${user.id}) with null clerkId`,
    );
  }

  return user;
}
