import ProductContainer from "@/components/lookbookChapter/ProductContainer";
import Section1 from "@/components/lookbookChapter/Section1";
import Section2 from "@/components/lookbookChapter/Section2";
import Section3 from "@/components/lookbookChapter/Section3";
import Section4 from "@/components/lookbookChapter/Section4";
import Section5 from "@/components/lookbookChapter/Section5";
import TextContainer from "@/components/lookbookChapter/TextContainer";
import VideoContainer from "@/components/lookbookChapter/VideoContainer";
import React from "react";

const LookBookChapter = () => {
  const text1 =
    "What’s on the Menu was our first collection—born from a shared love for food and creativity. Teaming up with visual artist Rhea Zaveri, we created a summer capsule inspired by her abstract prints, each based on ingredients from our favourite dishes.";

  const text2 =
    "From Avocado Toast to Honey Chilli Potatoes and Moscow Mules, each piece features art that breaks down ingredients visually—no recipes, just vibes. Shapes and colours represent every element in a fresh, wearable way.";

  const text3 =
    "Made for foodies and visual junkies alike, this collection is playful, bold, and proudly obsessed with eating. If food lives rent-free in your head too—welcome home.";

  return (
    <>
      <Section1 />
      <TextContainer text={text1} />
      <ProductContainer />
      <TextContainer text={text2} />
      <VideoContainer />
      <Section2 text={text3} />
      <Section3 />
      <Section4 />
      <Section5 />
    </>
  );
};

export default LookBookChapter;
