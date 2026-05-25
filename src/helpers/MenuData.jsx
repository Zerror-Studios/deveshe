export const FOOTER_QUICK_LINKS = [
  { name: "Shop", link: "/shop" },
  { name: "About", link: "/about" },
  { name: "Blogs", link: "/blogs" },
  { name: "Material Index", link: "/material-index" },
  { name: "Customer Support", link: "/contact" },
];

export const SHOP_NAV_LINKS = [
  { name: "See all", link: "/shop" },
  { name: "Tops", link: "/shop/tops", imgsrc: "/assets/images/category/Tops final.png" },
  { name: "Jackets", link: "/shop/jackets", imgsrc: "/assets/images/category/Jackets final.png" },
  { name: "Pants", link: "/shop/pants", imgsrc: "/assets/images/category/Pants final.png" },
  { name: "Dresses", link: "/shop/dresses", imgsrc: "/assets/images/category/Dresses final.png" },
  { name: "Co cord sets", link: "/shop/co-cord-sets", imgsrc: "/assets/images/category/Co ord sets final.png" },
  { name: "Accessories", link: "/shop/accessories", imgsrc: "/assets/images/category/Accessories final.png" },
];

export const MenuData = [
  {
    name: "Shop",
    link: "/shop",
    dropdownType: "categories",
  },
  {
    name: "Lookbook",
    link: "/lookbook",
    dropdownType: "lookbooks",
  },
  {
    name: "Explore",
    link: "/about",
    dropdownLinks: [
      { name: "About", link: "/about" },
      { name: "Blogs", link: "/blogs" },
      { name: "Material Index", link: "/material-index" },
      { name: "Customer Support", link: "/contact" },
    ],
  },
];
