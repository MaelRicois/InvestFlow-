import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "InvestFlow — SaaS immobilier premium",
    template: "%s · InvestFlow",
  },
  description:
    "Base Next.js moderne pour un produit immobilier : App Router, Tailwind, Lucide et clients Supabase prêts à l’emploi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="fr"
        className={`${inter.variable} ${lora.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background font-sans text-foreground">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
