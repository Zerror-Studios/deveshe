import React from "react";
import Section3 from "@/components/archive/Section3";
import styles from "@/components/archive/archive.module.css";
import SeoHeader from "@/components/seo/SeoHeader";

const Lookbook = ({ meta }) => {
  return (
    <>
      <SeoHeader meta={meta} />
      <div className={styles.archiveWrapper}>
        <Section3 />
      </div>
    </>
  );
};

export default Lookbook;

export async function getStaticProps() {
  const meta = {
    title: "Lookbook – Explore DeVeSheDreams Collections",
    description:
      "Browse the DeVeSheDreams lookbook to explore our bold, dream-inspired collections. Discover vibrant prints, artist-led designs, and wearable creativity.",
    keywords:
      "DeVeSheDreams lookbook, fashion capsule collection, artistic fashion photos, designer collection showcase",
    author: "DeVeSheDreams",
    robots: "index,follow",
  };
  return { props: { meta } };
}
