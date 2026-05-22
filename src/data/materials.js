export const MATERIAL_HERO_IMAGE = "/assets/images/home/shop page.webp";

const IMG = {
  h1: "/assets/images/home/Homepage1.webp",
  h2: "/assets/images/home/Homepage2.webp",
  h3: "/assets/images/home/Homepage3.webp",
  h4: "/assets/images/home/Homepage4.webp",
};

export const MATERIALS = [
  {
    id: "tech-d",
    code: "TECH D",
    name: "TECHNICAL DUCHESSE",
    title: "Technical duchesse",
    image: IMG.h1,
    imageAlt: "Technical duchesse fabric swatch",
    description:
      "Developed for outerwear, this recycled polyester blend is lightweight, water-resistant, and built to move heat away from the body. The hand is crisp with a subtle sheen that reads refined under city light.",
    source: { name: "Limonta", country: "ITALY" },
    usedIn: [
      {
        title: "Structured rain coat",
        image: IMG.h3,
        href: "/shop",
      },
    ],
  },
  {
    id: "lin-o",
    code: "LIN O",
    name: "OPEN WEAVE LINEN",
    title: "Open weave linen",
    image: IMG.h2,
    imageAlt: "Open weave linen swatch",
    description:
      "Woven in Europe from long-staple flax, this open weave breathes through humid commutes and softens with wear. Natural slub and variation give each garment a quiet, lived-in character.",
    source: { name: "Baird McNutt", country: "IRELAND" },
    usedIn: [
      {
        title: "Relaxed summer shirt",
        image: IMG.h2,
        href: "/shop",
      },
      {
        title: "Linen blend trouser",
        image: IMG.h4,
        href: "/shop",
      },
    ],
  },
  {
    id: "cot-p",
    code: "COT P",
    name: "COTTON POPLIN",
    title: "Cotton poplin",
    image: IMG.h3,
    imageAlt: "Cotton poplin swatch",
    description:
      "A fine cotton poplin with a clean surface and stable press. It holds shape through the morning and eases gently by afternoon — the default shirting cloth for days that move between AC and heat.",
    source: { name: "Albini Group", country: "ITALY" },
    usedIn: [
      {
        title: "Essential poplin shirt",
        image: IMG.h1,
        href: "/shop",
      },
    ],
  },
  {
    id: "wol-g",
    code: "WOL G",
    name: "WOOL GAUZE",
    title: "Wool gauze",
    image: IMG.h4,
    imageAlt: "Wool gauze swatch",
    description:
      "A sheer wool gauze that layers without bulk. It adds warmth at the shoulder and chest while staying almost weightless through the body — ideal for transitional evenings and overcooled rooms.",
    source: { name: "Vitale Barberis", country: "ITALY" },
    usedIn: [
      {
        title: "Lightweight layer jacket",
        image: IMG.h4,
        href: "/shop",
      },
    ],
  },
  {
    id: "can-c",
    code: "CAN C",
    name: "CANVAS COTTON",
    title: "Canvas cotton",
    image: IMG.h1,
    imageAlt: "Canvas cotton swatch",
    description:
      "A dense cotton canvas with a dry hand and matte finish. It sheds light rain, softens at stress points, and ages into a softer drape without losing structure at the seam.",
    source: { name: "Halley Stevensons", country: "UNITED KINGDOM" },
    usedIn: [
      {
        title: "Utility field jacket",
        image: IMG.h3,
        href: "/shop",
      },
    ],
  },
  {
    id: "silk-t",
    code: "SILK T",
    name: "TUSSAH SILK BLEND",
    title: "Tussah silk blend",
    image: IMG.h2,
    imageAlt: "Tussah silk blend swatch",
    description:
      "A silk blend with a natural grain and soft luster. It falls cleanly from the shoulder, catches light at movement, and pairs with both tailored trousers and relaxed denim.",
    source: { name: "Kamiyama", country: "JAPAN" },
    usedIn: [
      {
        title: "Evening shirt",
        image: IMG.h2,
        href: "/shop",
      },
    ],
  },
  {
    id: "tec-s",
    code: "TEC S",
    name: "TECHNICAL SHELL",
    title: "Technical shell",
    image: IMG.h3,
    imageAlt: "Technical shell fabric swatch",
    description:
      "A bonded technical shell with taped seams and a matte face. Breathable membrane keeps heat from building under the layer while shedding monsoon bursts on the walk in.",
    source: { name: "Schoeller", country: "SWITZERLAND" },
    usedIn: [
      {
        title: "Commute shell",
        image: IMG.h1,
        href: "/shop",
      },
      {
        title: "Packable rain layer",
        image: IMG.h4,
        href: "/shop",
      },
    ],
  },
  {
    id: "hem-l",
    code: "HEM L",
    name: "HEAVY LINEN TWILL",
    title: "Heavy linen twill",
    image: IMG.h4,
    imageAlt: "Heavy linen twill swatch",
    description:
      "A heavier linen twill with diagonal structure and a dry, substantial hand. It holds pleats, recovers from sitting, and reads intentional when the season turns breezy.",
    source: { name: "Tessuti Di Sondrio", country: "ITALY" },
    usedIn: [
      {
        title: "Tailored linen trouser",
        image: IMG.h2,
        href: "/shop",
      },
    ],
  },
];

export function getMaterialById(id) {
  return MATERIALS.find((material) => material.id === id) ?? null;
}
