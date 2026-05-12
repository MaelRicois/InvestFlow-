import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
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
  metadataBase: new URL("https://invest-flow-seven.vercel.app"),
  title: "InvestFlow — Analysez votre rentabilité immo en 2 secondes",
  description:
    "L'outil gratuit pour calculer votre rendement net-net et votre fiscalité (LMNP, SCI, Nu) sans prise de tête.",
  openGraph: {
    title: "InvestFlow — Analysez votre rentabilité immo en 2 secondes",
    description:
      "L'outil gratuit pour calculer votre rendement net-net et votre fiscalité (LMNP, SCI, Nu) sans prise de tête.",
    url: "https://invest-flow-seven.vercel.app/",
    siteName: "InvestFlow",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "InvestFlow — Analysez votre rentabilité immo en 2 secondes",
    description:
      "L'outil gratuit pour calculer votre rendement net-net et votre fiscalité (LMNP, SCI, Nu) sans prise de tête.",
    images: ["/og-image.png"],
  },
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
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
