import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Header from "./header";

export default async function HeaderWrapper() {
  const session = await auth();

  let notifications: {
    id: string;
    titleTr: string;
    body: string;
    link: string | null;
    read: boolean;
    createdAt: Date;
  }[] = [];
  let unreadCount = 0;

  if (session?.user?.id) {
    notifications = await db.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        titleTr: true,
        body: true,
        link: true,
        read: true,
        createdAt: true,
      },
    });
    unreadCount = notifications.filter((n) => !n.read).length;
  }

  return (
    <Header
      user={
        session?.user
          ? { id: session.user.id, name: session.user.name, email: session.user.email, role: session.user.role }
          : null
      }
      notifications={notifications}
      unreadCount={unreadCount}
    />
  );
}
