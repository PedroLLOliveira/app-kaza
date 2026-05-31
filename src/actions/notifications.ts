"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/actions/auth";

export async function getUnreadNotifications() {
  const session = await getSession();
  if (!session) return [];

  return await prisma.notification.findMany({
    where: {
      OR: [
        { userId: session.userId },
        { householdId: session.householdId, userId: null }
      ],
      isRead: false
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function markAsRead(id: string) {
  const session = await getSession();
  if (!session) return;

  await prisma.notification.update({
    where: { id },
    data: { isRead: true }
  });
}
