import React from 'react';
import '../src/index.css';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { WhatsAppWidget } from '../components/WhatsAppWidget';

export const metadata = {
  title: 'ZYCOOBUX - Premium Robux Store. Beyond Ordinary.',
  description: 'Top Up Robux dengan mudah, cepat, dan nyaman bersama ZYCOOBUX. Premium Robux Store. Beyond Ordinary.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#09090D] text-[#E5E4E2] flex flex-col font-sans selection:bg-[#9B5CFF] selection:text-white">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
        <WhatsAppWidget />
      </body>
    </html>
  );
}
