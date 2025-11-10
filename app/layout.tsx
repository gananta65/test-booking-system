import type React from "react";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Analytics } from "@vercel/analytics/next";
import NextAuthProvider from "./providers/NextAuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Barber Booking",
  description: "Book your favorite barber appointments online",
  generator: "v0.app",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <NextAuthProvider session={session}>
          {children}
          <Analytics />
        </NextAuthProvider>
      </body>
    </html>
  );
}
