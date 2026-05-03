import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh w-full flex flex-col items-center justify-center px-6 py-12">
      <Link
        href="/"
        className="mb-10 text-2xl font-bold tracking-tight bg-gradient-to-br from-rose-500 to-pink-600 text-transparent bg-clip-text"
      >
        Resound
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
