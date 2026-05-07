import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "../components/AppShell";
import { prisma } from "@/lib/prisma";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "The Scholarly Perspective — Học IELTS",
  description:
    "Nền tảng luyện thi IELTS toàn diện: Grammar, Writing, Speaking với AI",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();
  let userStats = null;

  if (userId) {
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
    if (user) {
      userStats = {
        targetBand: user.targetBand,
        currentBand: user.currentBand,
        currentStreak: streak?.currentStreak ?? 0,
      };
    }
  }

  return (
    <ClerkProvider>
      <html lang="vi">
        <head>
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=optional"
            rel="stylesheet"
          />
        </head>
        <body
          className={`${inter.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} bg-background text-on-background antialiased`}
        >
          <AppShell userStats={userStats}>{children}</AppShell>
        </body>
      </html>
    </ClerkProvider>
  );
}
