import SeoHeader from "@/components/seo/SeoHeader";
import AboutHeroSection from "@/components/about/AboutHeroSection";
import FounderSection from "@/components/about/FounderSection";
import OurJourney from "@/components/about/OurJourney";
import OurProcess from "@/components/about/OurProcess";
import FrequentQue from "@/components/about/FrequentQue";

export default function About({ meta }) {
  return (
    <>
      <SeoHeader meta={meta} />
      <main id="about-page">
        <AboutHeroSection />
        <OurJourney />
        <OurProcess />
        <FrequentQue />
        <FounderSection />
      </main>
    </>
  );
}

export async function getStaticProps() {
  const meta = {
    title: "About – The Story of DeVeSheDreams",
    description:
      "DeVeSheDreams is a Mumbai-based fashion brand born from a passion for creativity and global influences. Discover our vision, founder, and artistic journey through innovative fashion and collaborations.",
    keywords: [
      "DeVeSheDreams about",
      "fashion brand story",
      "Mumbai fashion",
      "brand vision",
      "founder journey",
      "creative collaborations"
    ],
    primaryKeywords: ["DeVeSheDreams story", "fashion brand"],
    author: "DeVeSheDreams",
    robots: "index, follow",
    og: {
      title: "About – The Story of DeVeSheDreams",
      description:
        "Explore the journey of DeVeSheDreams, a Mumbai-based fashion brand driven by creativity, global influences, and artistic collaborations."
    },
    twitter: {
      card: "summary_large_image",
      title: "About – The Story of DeVeSheDreams",
      description:
        "Learn about DeVeSheDreams, our vision, founder, and artistic journey as a creative and globally-inspired fashion brand."
    }
  };

  return { props: { meta } };
}
