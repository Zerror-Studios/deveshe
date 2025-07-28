import React from "react";
import Link from "next/link";
import { IoBagHandleOutline } from "react-icons/io5";

const Heading = () => {
  return (
    <div role="banner" className="checkout_header">
      <span>
        <Link href={"#"} className="checkout_header_titile">
          {/* <img
                src="https://cdn.shopify.com/s/files/1/0030/2946/7203/files/NourHammour_Logo_Transparent_Black_x320.png?v=1693321966"
                alt=""
              /> */}
          <h1>De Ve She Dreams</h1>
        </Link>
      </span>
      <span>
        <Link href={"#"}>
          <span>
            <IoBagHandleOutline />
          </span>
        </Link>
      </span>
    </div>
  );
};

export default Heading;
