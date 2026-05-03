"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, User, LogOut } from "lucide-react";

import { cn } from "@/lib/cn";
import { logoutAction } from "@/features/auth/actions";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  match?: (pathname: string) => boolean;
};

export function Sidebar({ username }: { username: string }) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { href: "/feed", label: "Feed", icon: Home, match: (p) => p === "/feed" },
    {
      href: "/post/new",
      label: "Publier",
      icon: PlusCircle,
      match: (p) => p.startsWith("/post"),
    },
    {
      href: `/profile/${username}`,
      label: "Profil",
      icon: User,
      match: (p) => p.startsWith("/profile"),
    },
  ];

  return (
    <aside className="hidden md:flex md:flex-col md:gap-1 md:w-60 md:shrink-0 md:py-8 md:pl-6 md:pr-3 md:sticky md:top-0 md:h-dvh">
      <Link
        href="/feed"
        className="px-3 mb-8 text-2xl font-bold tracking-tight bg-gradient-to-br from-rose-500 to-pink-600 text-transparent bg-clip-text"
      >
        Resound
      </Link>
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active = item.match ? item.match(pathname) : pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 h-11 rounded-2xl text-[15px] transition",
                "hover:bg-black/5 dark:hover:bg-white/5",
                active && "bg-black/5 dark:bg-white/10 font-semibold",
              )}
            >
              <Icon className={cn("size-5", active && "text-rose-500")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-3 h-11 rounded-2xl text-[15px] text-neutral-500 hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            <LogOut className="size-5" />
            Se déconnecter
          </button>
        </form>
      </div>
    </aside>
  );
}

export function MobileNav({ username }: { username: string }) {
  const pathname = usePathname();
  const items: NavItem[] = [
    { href: "/feed", label: "Feed", icon: Home, match: (p) => p === "/feed" },
    {
      href: "/post/new",
      label: "Publier",
      icon: PlusCircle,
      match: (p) => p.startsWith("/post"),
    },
    {
      href: `/profile/${username}`,
      label: "Profil",
      icon: User,
      match: (p) => p.startsWith("/profile"),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 card-strong border-t border-l-0 border-r-0 border-b-0 px-2 py-2 flex items-center justify-around">
      {items.map((item) => {
        const active = item.match ? item.match(pathname) : pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 rounded-xl transition",
              active ? "text-rose-500" : "text-neutral-500",
            )}
          >
            <Icon className="size-6" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
