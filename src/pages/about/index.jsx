import { Inter } from "next/font/google";
import Section5 from "@/components/about/Section5";
import Section6 from "@/components/about/Section6";
import Section7 from "@/components/about/Section7";
import Nails_Cntr from "@/components/about/Nails_Cntr";
import HomeSlider from "@/components/HomeSlider/HomeSlider";

const inter = Inter({ subsets: ["latin"] });

export default function About() {
  return (
    <>
      <main>
        <HomeSlider/>
        <Nails_Cntr />
        <Section5/>
        <Section6/>
        <Section7/>
      </main>
    </>
  );
}
