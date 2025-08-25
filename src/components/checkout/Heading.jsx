import React from "react";
import Link from "next/link";
import { IoBagHandleOutline } from "react-icons/io5";
import Image from "next/image";

const Heading = () => {
  return (
    <div role="banner" className="checkout_header">
      <span>
        <Link href={"#"} className="checkout_header_titile">
          <Image
          width={1000}
          height={1000}
                src="/assets/images/logo/logo-m.webp"
                alt="logo"
              />
          {/* <h1>De Ve She Dreams</h1> */}
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
