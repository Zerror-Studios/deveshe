import parse from "html-react-parser";

export const htmlParser = (data = "") => {
  if (!data) return "";
  return parse(data || "");
};

export const formatePrice = (price) => {
  if (!price) return "0";
  const hasDecimal = price % 1 !== 0;
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: hasDecimal ? 1 : 0,
    maximumFractionDigits: 2,
  }).format(price);
  return formattedPrice;
};

export const getProductPriceLabel = (variants = [], discountedPrice = 0) => {
  if (!variants || variants.length === 0) {
    return formatePrice(discountedPrice || 0);
  }
  const prices = variants.map((v) => v.variantPrice).filter(Boolean);
  if (prices.length === 0) {
    return formatePrice(discountedPrice || 0);
  }
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  if (minPrice === maxPrice) {
    return formatePrice(minPrice);
  }
  return `Starts from ${formatePrice(minPrice)}`;
};
