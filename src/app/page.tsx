"use client";

import { Hero } from "@/components/landing/hero";
import { MapPreview } from "@/components/landing/map-preview";
import {
  Audiences,
  CareSection,
  DealsStrip,
  Faq,
  HowItWorks,
  Newsletter,
  ProviderCta,
  ReviewsStrip,
  WhySalaam,
} from "@/components/landing/sections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <MapPreview />
      <HowItWorks />
      <DealsStrip />
      <WhySalaam />
      <CareSection />
      <Audiences />
      <ReviewsStrip />
      <ProviderCta />
      <Faq />
      <Newsletter />
    </>
  );
}
