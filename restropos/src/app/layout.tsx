import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "RestroPOS | All-in-One Flat-Rate Subscription POS",
  description: "Bespoke restaurant billing and operations software. Flat ₹14,999/year, all 13+ modules and hosting included.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} theme-cabernet mode-dark`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var theme = 'theme-cabernet';
            var mode = 'mode-dark';
            document.documentElement.classList.add(theme, mode);
          })();
        ` }} />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
