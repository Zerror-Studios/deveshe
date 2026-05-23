export const MATERIAL_HERO_IMAGE = "/assets/images/home/shop page.webp";

const IMG = {
  cupro:
    "https://a.storyblok.com/f/161230/886x550/8b62f9bca7/cupro.jpg",
  recycledPolyamide:
    "https://a.storyblok.com/f/161230/600x600/224b30645e/recycled-polyamide.webp",
  takisada:
    "https://a.storyblok.com/f/161230/1000x578/c7a909933a/takisada-2.jpg",
  lampo:
    "https://a.storyblok.com/f/161230/594x792/69d409ee6e/lampo-metallic-standard.jpg",
  econyl:
    "https://a.storyblok.com/f/161230/1000x587/f977ca9bc8/econyl-2.jpg",
};

export const MATERIALS = [
  {
    id: "cupro",
    code: "CUPRO",
    name: "CUPRO",
    title: "Cupro",
    image: IMG.cupro,
    imageAlt: "White cupro fabric swatch",
    description:
      "Regenerated cellulose with a silk-like fall and cool touch against skin. It breathes through humid weather and takes dye with a deep, even saturation.",
    source: { name: "Asahi Kasei", country: "JAPAN" },
    usedIn: [
      {
        title: "Fluid lining",
        image: IMG.cupro,
        href: "/shop",
      },
    ],
  },
  {
    id: "rec-pa",
    code: "REC-PA",
    name: "OLMETEX RECYCLED POLYAMIDE",
    title: "Olmetex recycled polyamide",
    image: IMG.recycledPolyamide,
    imageAlt: "Recycled polyamide fabric swatch",
    description:
      "A lightweight recycled polyamide with a crisp hand and subtle sheen. Developed for outerwear, it moves heat away from the body and recovers cleanly from pack crease.",
    source: { name: "Olmetex", country: "ITALY" },
    usedIn: [
      {
        title: "Technical shell jacket",
        image: IMG.recycledPolyamide,
        href: "/shop",
      },
    ],
  },
  {
    id: "jap-rp",
    code: "JAP-RP",
    name: "TAKISADA RECYCLED POLYESTER",
    title: "Takisada recycled polyester",
    image: IMG.takisada,
    imageAlt: "Takisada recycled polyester camouflage swatch",
    description:
      "Japanese-milled recycled polyester with bold pattern clarity and stable colour. The face is smooth, the hand is dry, and the drape stays controlled through movement.",
    source: { name: "Takisada", country: "JAPAN" },
    usedIn: [
      {
        title: "Patterned outer layer",
        image: IMG.takisada,
        href: "/shop",
      },
    ],
  },
  {
    id: "lampo",
    code: "LAMPO",
    name: "LAMPO METALLIC STANDARD",
    title: "Lampo metallic standard",
    image: IMG.lampo,
    imageAlt: "Lampo metallic standard zipper on navy tape",
    description:
      "Italian Lampo zip in metallic standard finish — consistent pull, clean tape alignment, and hardware that reads refined under studio light.",
    source: { name: "Lampo", country: "ITALY" },
    usedIn: [
      {
        title: "Outerwear closure",
        image: IMG.lampo,
        href: "/shop",
      },
    ],
  },
  {
    id: "ecnyl",
    code: "ECNYL",
    name: "ECONYL REGENERATED NYLON",
    title: "Econyl regenerated nylon",
    image: IMG.econyl,
    imageAlt: "Econyl regenerated nylon swatch",
    description:
      "Regenerated nylon from recovered waste with performance parity to virgin fibre. Strong, elastic, and colour-fast — built for swim, active, and high-wear pieces.",
    source: { name: "Aquafil", country: "ITALY" },
    usedIn: [
      {
        title: "Performance knit",
        image: IMG.econyl,
        href: "/shop",
      },
    ],
  },
];

export function getMaterialById(id) {
  return MATERIALS.find((material) => material.id === id) ?? null;
}
