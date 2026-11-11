"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  applyProductFilters,
  buildFilterMenus,
  buildLookbookProductMap,
  getShopCategoryFilters,
  toggleFilterSelection,
} from "@/utils/productFilters";

const ShopFilterContext = createContext(null);

export function ShopFilterProvider({
  products = [],
  categories = [],
  lookbooks = [],
  hideCollection = false,
  hideProductType = false,
  children,
}) {
  const shopCategories = useMemo(
    () => getShopCategoryFilters(categories),
    [categories]
  );

  const lookbookProductMap = useMemo(
    () => buildLookbookProductMap(lookbooks),
    [lookbooks]
  );

  const menus = useMemo(
    () =>
      buildFilterMenus(products, {
        lookbooks,
        shopCategories,
        hideCollection,
        hideProductType,
      }),
    [products, lookbooks, shopCategories, hideCollection, hideProductType]
  );

  const [selections, setSelections] = useState({});

  useEffect(() => {
    setSelections({});
  }, [products, hideCollection, hideProductType]);

  const filteredProducts = useMemo(
    () =>
      applyProductFilters(products, selections, menus, {
        shopCategories,
        lookbookProductMap,
      }),
    [products, selections, menus, shopCategories, lookbookProductMap]
  );

  const toggleOption = useCallback(
    (menuId, option) => {
      const menu = menus.find((m) => m.id === menuId);
      if (!menu) return;
      setSelections((prev) => toggleFilterSelection(prev, menu, option));
    },
    [menus]
  );

  const resetSelections = useCallback(() => {
    setSelections({});
  }, []);

  const value = useMemo(
    () => ({
      menus,
      selections,
      products,
      filteredProducts,
      toggleOption,
      resetSelections,
      hasActiveFilters: Object.keys(selections).length > 0,
    }),
    [menus, selections, products, filteredProducts, toggleOption, resetSelections]
  );

  return (
    <ShopFilterContext.Provider value={value}>{children}</ShopFilterContext.Provider>
  );
}

export function useShopFilter() {
  return useContext(ShopFilterContext);
}
