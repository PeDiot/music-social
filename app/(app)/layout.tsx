import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { Sidebar, MobileNav } from "@/components/Sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.username) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-row min-h-dvh">
      <Sidebar username={session.user.username} />
      <div className="flex-1 min-w-0 pb-24 md:pb-12 md:pl-2">{children}</div>
      <MobileNav username={session.user.username} />
    </div>
  );
}
