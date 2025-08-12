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
