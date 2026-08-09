'use client';

import React from 'react';
import { Hero } from '../../components/landing/Hero';
import { Features } from '../../components/landing/Features';
import { Pricing } from '../../components/landing/Pricing';
import { Testimonials } from '../../components/landing/Testimonials';
import { FAQ } from '../../components/landing/FAQ';

export default function LandingPage() {
  return (
    <div className="space-y-4">
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      <FAQ />
    </div>
  );
}
