import SeoHeader from "@/components/seo/SeoHeader";
import AboutHeroSection from "@/components/about/AboutHeroSection";
import JourneySection from "@/components/about/JourneySection";
import WhereItAllBegan from "@/components/about/WhereItAllBegan";
import Nails_Cntr from "@/components/about/Nails_Cntr";
import FounderSection from "@/components/about/FounderSection";

export default function About({ meta }) {
  return (
    <>
      <SeoHeader meta={meta} />
      <main>
        <AboutHeroSection />
        <JourneySection />
        <WhereItAllBegan />
        <Nails_Cntr />
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
