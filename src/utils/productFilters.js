import { SHOP_NAV_LINKS } from "@/helpers/MenuData";

const ALL_TYPES = "All types";
const ALL_SIZES = "All sizes";

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

/** Shop category rows for Product type filter (Tops, Jackets, Pants, …). */
export function getShopCategoryFilters(apiCategories = []) {
  const apiBySlug = new Map(
    (apiCategories ?? []).map((c) => [c.slug, c])
  );

  return SHOP_NAV_LINKS.filter((item) => item.link !== "/shop").map((item) => {
    const slug = item.link.replace("/shop/", "");
    const api = apiBySlug.get(slug);
    return {
      name: item.name,
      slug,
      _id: api?._id,
    };
  });
}

export function buildLookbookProductMap(lookbooks = []) {
  const map = new Map();

  for (const lookbook of lookbooks) {
    const name = lookbook?.name;
    if (!name) continue;

    const add = (productId) => {
      if (!productId) return;
      if (!map.has(productId)) map.set(productId, new Set());
      map.get(productId).add(name);
    };

    for (const id of lookbook.productIds ?? []) add(id);
    for (const product of lookbook.products ?? []) add(product?._id);
  }

  return map;
}

export function getProductMinPrice(product) {
  const variants = product?.variants ?? [];
  const prices = variants
    .map((v) => v?.variantPrice)
    .filter((p) => typeof p === "number" && p > 0);

  if (prices.length) return Math.min(...prices);

  if (product?.discountedPrice > 0) return product.discountedPrice;
  return product?.price ?? 0;
}

function collectSizes(products) {
  const sizes = new Set();

  for (const product of products) {
    for (const variant of product?.variants ?? []) {
      for (const opt of variant?.selectedOptions ?? []) {
        if (opt) sizes.add(String(opt).trim());
      }
    }

    for (const option of product?.productOptions ?? []) {
      const isSize =
        /size/i.test(option?.optionName || "") ||
        option?.showInProductPageAs === "List";
      if (!isSize) continue;
      for (const choice of option?.choices ?? []) {
        if (choice?.name) sizes.add(String(choice.name).trim());
      }
    }
  }

  return [...sizes].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a.toUpperCase());
    const bi = SIZE_ORDER.indexOf(b.toUpperCase());
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b, undefined, { numeric: true });
  });
}

export function buildFilterMenus(
  products = [],
  {
    lookbooks = [],
    shopCategories = [],
    hideCollection = false,
    hideProductType = false,
  } = {}
) {
  const menus = [];
  const lookbookNames = lookbooks
    .map((lb) => lb?.name)
    .filter((name) => name && String(name).trim());

  if (!hideCollection && lookbookNames.length > 0) {
    menus.push({
      id: "collection",
      label: "Collection",
      options: lookbookNames,
    });
  }

  if (!hideProductType && shopCategories.length > 0) {
    menus.push({
      id: "productType",
      label: "Product type",
      options: [ALL_TYPES, ...shopCategories.map((c) => c.name)],
      allValue: ALL_TYPES,
    });
  }

  const sizes = collectSizes(products);
  if (sizes.length > 0) {
    menus.push({
      id: "size",
      label: "Size",
      options: [ALL_SIZES, ...sizes],
      allValue: ALL_SIZES,
    });
  }

  menus.push({
    id: "sort",
    label: "Sort by",
    options: ["Price: low to high", "Price: high to low"],
    singleSelect: true,
  });

  return menus;
}

function getActiveValues(selections, menuId, allValue) {
  const selected = selections[menuId] ?? [];
  return selected.filter((v) => v && v !== allValue);
}

function productMatchesShopCategory(product, names, shopCategories) {
  const productCategories = product?.categories ?? [];
  if (productCategories.length) {
    return productCategories.some(
      (c) => names.includes(c?.name) || names.includes(c?.slug)
    );
  }

  const ids = new Set(product?.categoryIds ?? []);
  return shopCategories
    .filter((c) => names.includes(c.name))
    .some((c) => c._id && ids.has(c._id));
}

function productMatchesLookbook(product, lookbookNames, lookbookProductMap) {
  const names = lookbookProductMap.get(product?._id);
  if (!names?.size) return false;
  return lookbookNames.some((name) => names.has(name));
}

function productMatchesSize(product, sizes) {
  return (product?.variants ?? []).some((variant) =>
    (variant?.selectedOptions ?? []).some((opt) => sizes.includes(opt))
  );
}

export function applyProductFilters(
  products = [],
  selections = {},
  menus = [],
  { shopCategories = [], lookbookProductMap = new Map() } = {}
) {
  let result = [...products];

  const collectionMenu = menus.find((m) => m.id === "collection");
  const collectionNames = getActiveValues(
    selections,
    "collection",
    collectionMenu?.allValue
  );
  if (collectionNames.length) {
    result = result.filter((p) =>
      productMatchesLookbook(p, collectionNames, lookbookProductMap)
    );
  }

  const typeMenu = menus.find((m) => m.id === "productType");
  const typeNames = getActiveValues(selections, "productType", typeMenu?.allValue);
  if (typeNames.length) {
    result = result.filter((p) =>
      productMatchesShopCategory(p, typeNames, shopCategories)
    );
  }

  const sizeMenu = menus.find((m) => m.id === "size");
  const sizes = getActiveValues(selections, "size", sizeMenu?.allValue);
  if (sizes.length) {
    result = result.filter((p) => productMatchesSize(p, sizes));
  }

  const sort = selections.sort?.[0];
  if (sort === "Price: low to high") {
    result.sort((a, b) => getProductMinPrice(a) - getProductMinPrice(b));
  } else if (sort === "Price: high to low") {
    result.sort((a, b) => getProductMinPrice(b) - getProductMinPrice(a));
  }

  return result;
}

export function toggleFilterSelection(prev, menu, option) {
  const menuId = menu.id;

  if (menu.singleSelect) {
    const current = prev[menuId]?.[0];
    if (current === option) {
      const next = { ...prev };
      delete next[menuId];
      return next;
    }
    return { ...prev, [menuId]: [option] };
  }

  if (option === menu.allValue) {
    const next = { ...prev };
    delete next[menuId];
    return next;
  }

  const current = prev[menuId] ?? [];
  const withoutAll = current.filter((item) => item !== menu.allValue);
  const next = withoutAll.includes(option)
    ? withoutAll.filter((item) => item !== option)
    : [...withoutAll, option];

  if (!next.length) {
    const cleared = { ...prev };
    delete cleared[menuId];
    return cleared;
  }

  return { ...prev, [menuId]: next };
}
