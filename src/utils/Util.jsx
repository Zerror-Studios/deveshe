import parse from "html-react-parser";

export const htmlParser = (data = "") => {
    if (!data) return "";
    return parse(data || "");
  };
  