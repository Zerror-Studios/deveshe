import SeoHeader from "@/components/seo/SeoHeader";
import AboutHeroSection from "@/components/about/AboutHeroSection";
import FounderSection from "@/components/about/FounderSection";
import OurJourney from "@/components/about/OurJourney";
import OurProcess from "@/components/about/OurProcess";

export default function About({ meta }) {
  return (
    <>
      <SeoHeader meta={meta} />
      <main>
        <AboutHeroSection />
        <OurJourney/>
        <OurProcess/>
        <FounderSection />
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
