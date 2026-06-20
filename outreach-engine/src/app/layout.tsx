import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'OutreachEngine - Private Cloud B2B Cold Outreach',
  description: 'Self-hosted premium outbound email platform with automated rotating inbox pools and Gemini AI customizations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="h-full bg-[#030712] text-[#E2E8F0] font-sans flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Top Header */}
          <header className="h-16 border-b border-[#1E293B] bg-[#090D1A] flex items-center justify-between px-8 shrink-0">
            <div>
              <span className="text-xs font-medium text-[#6366F1] bg-[#6366F1]/10 px-2.5 py-1 rounded-full">
                Active Node: Localhost
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs text-[#94A3B8] font-medium">DB: Connected (Neon Serverless)</span>
            </div>
          </header>

          {/* Child Page Views */}
          <main className="flex-1 overflow-y-auto bg-[#030712]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
