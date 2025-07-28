import { Inter } from "next/font/google";
import Section5 from "@/components/about/Section5";
import Section6 from "@/components/about/Section6";
import Section7 from "@/components/about/Section7";
import Nails_Cntr from "@/components/about/Nails_Cntr";
import SeoHeader from "@/components/seo/SeoHeader";
import AboutHeroSection from "@/components/about/AboutHeroSection";

const inter = Inter({ subsets: ["latin"] });

export default function About({ meta }) {
  return (
    <>
      <SeoHeader meta={meta} />
      <main>
        <AboutHeroSection />
        <Section6 />
        <Section7 />
        <Nails_Cntr />
        <Section5 />
      </main>
    </>
  );
}

export async function getStaticProps() {
  const meta = {
    title: "About – The Story of DeVeSheDreams",
    description:
      "Born from the mind of a passionate daydreamer, DeVeSheDreams is a Mumbai-based fashion brand shaped by global influences and creative collaborations. Learn about our vision, founder, and artistic journey.",
    keywords:
      "about DeVeSheDreams, fashion brand story, designer background, Parsons School of Design, Mumbai fashion",
    author: "DeVeSheDreams",
    robots: "index,follow",
  };
  return { props: { meta } };
}
