'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import MobileNav from '@/components/layout/MobileNav';
import StickyTopNav from '@/components/layout/StickyTopNav';
import Footer from '@/components/layout/Footer';
import ChatOpenButton from '@/components/chat/ChatOpenButton';

export default function GlobalUIWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If we are in the tools section, we render a clean layout without headers/footers
  if (pathname?.startsWith('/tools')) {
    return <>{children}</>;
  }

  // Otherwise, render the standard global UI layout
  return (
    <>
      <MobileNav />

      {/* Desktop contact button — full-width row, top-right. */}
      <div className="hidden lg:flex justify-end px-[44px] pt-[44px]">
        <ChatOpenButton className="shrink-0 bg-accent border border-white/20 text-black !text-[14px] font-medium padding-x py-2 rounded-full hover:opacity-80 transition-opacity cursor-pointer">
          Entre em contato
        </ChatOpenButton>
      </div>

      {/* Main content — full-width */}
      <div className="pt-[60px] lg:pt-0">
        <main id="main-content">{children}</main>
        <Footer />
      </div>

      <StickyTopNav />
    </>
  );
}
