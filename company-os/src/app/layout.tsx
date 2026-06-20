import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { StateProvider } from '@/context/StateContext';
import MainLayoutWrapper from '@/components/MainLayoutWrapper';
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
  title: 'CompanyOS - Enterprise Operations Intranet',
  description: 'Modular enterprise operating system to manage timesheets, tickets, directories, wikis, and system states.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full bg-[#F4F3EF] text-[#1A1C18] font-sans flex overflow-hidden">
        <StateProvider>
          <MainLayoutWrapper>{children}</MainLayoutWrapper>
        </StateProvider>
      </body>
    </html>
  );
}
