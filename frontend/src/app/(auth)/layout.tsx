import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { AnimatedBackground } from '../../components/shared/AnimatedBackground';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 animated-bg">
      <AnimatedBackground />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-6 py-12 flex flex-col items-center">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <Image src="/logo.png" alt="HafalanKu Logo" width={48} height={48} className="w-12 h-12 object-contain drop-shadow-lg" />
          <h1 className="text-3xl font-bold font-outfit text-gradient tracking-tight">HafalanKu</h1>
        </Link>
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
