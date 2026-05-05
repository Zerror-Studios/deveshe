"use client";

import React from "react";
import AboutHeroSection from "@/components/about/AboutHeroSection";
import FounderSection from "@/components/about/FounderSection";
import OurJourney from "@/components/about/OurJourney";
import OurProcess from "@/components/about/OurProcess";
import FrequentQue from "@/components/about/FrequentQue";

export default function AboutClient() {
  return (
    <main id="about-page">
      <AboutHeroSection />
      <OurJourney />
      <OurProcess />
      <FrequentQue />
      <FounderSection />
    </main>
  );
}

