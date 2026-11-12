export const FOOTER_QUICK_LINKS = [
  { name: "Shop", link: "/shop" },
  { name: "About", link: "/about" },
  { name: "Blogs", link: "/blogs" },
  { name: "Material Index", link: "/material-index" },
  { name: "Customer Support", link: "/contact" },
];

export const SHOP_NAV_LINKS = [
  { name: "See all", link: "/shop" },
  { name: "Tops", link: "/shop/tops", imgsrc: "/assets/images/category/tops.png" },
  { name: "Jackets", link: "/shop/jackets", imgsrc: "/assets/images/category/jackets.png" },
  { name: "Pants", link: "/shop/pants", imgsrc: "/assets/images/category/pants.png" },
  { name: "Dresses", link: "/shop/dresses", imgsrc: "/assets/images/category/dresses.png" },
  { name: "Co cord sets", link: "/shop/co-ord-sets", imgsrc: "/assets/images/category/co-ord-sets.png" },
  { name: "Accessories", link: "/shop/accessories", imgsrc: "/assets/images/category/accessories.png" },
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
