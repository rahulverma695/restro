import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RestroDineout | Premium Dine-In Hub",
  description: "Find local restaurants, book table reservations, and unlock direct-to-merchant dining discounts without platform commissions.",
  keywords: ["dining out", "table booking", "restaurant coupons", "food discounts", "direct upi pay"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RestroDineout",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground select-none">
        <main className="flex-1 flex flex-col w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
