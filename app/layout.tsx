import type { Metadata } from "next";

import { AudioProvider } from "@/lib/audio-context";

import "./globals.css";

export const metadata: Metadata = {
  title: "Resound — partage ce que tu écoutes",
  description:
    "Le réseau social pour les passionnés de musique. Note les morceaux, découvre ce qu'écoutent tes amis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-dvh">
        <AudioProvider>{children}</AudioProvider>
      </body>
    </html>
  );
}
