import React from "react";
import style from "@/styles/checkout-loader.module.css";

const Loader = ({ isLoading }) => {
  if (!isLoading) return null;
  return (
    <div className={style.checkoutBgBackdrop}>
      <div className={style.spinLoader}></div>
    </div>
  );
};

export default Loader;
