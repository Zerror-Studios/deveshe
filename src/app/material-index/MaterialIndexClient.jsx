import HeroSection from "@/components/shop/HeroSection";
import MaterialListing from "@/components/material-index/MaterialListing";
import { MATERIAL_HERO_IMAGE } from "@/data/materials";

export default function MaterialIndexClient({ materials }) {
  return (
    <>
      <HeroSection
        heroImageSrc={MATERIAL_HERO_IMAGE}
        isDefault
        showFilter={false}
        animateNav={false}
        description="A catalogue of cloth — where each fabric comes from, how it behaves, and what we build with it."
      />
      <MaterialListing materials={materials} />
    </>
  );
}
