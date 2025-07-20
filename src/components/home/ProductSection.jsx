import React from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import styles from "@/components/home/Home.module.css";
gsap.registerPlugin(ScrollTrigger);

const ProductSection = ({ data }) => {
  if (!data && data.length === 0) return;
  return (
    <>
      <div className={styles.productListing} id="productListing">
        <div className={styles.leftProCon}>
          <Link
            href={"/product/" + data[0]?._id || ""}
            style={{ cursor: "pointer" }}
          >
            <Image
              width={1000}
              height={1000}
              alt="image"
              src={data[0]?.assets[0]?.path || ""}
            />
          </Link>

          <div className={styles.productOverlay}>
            <div className={styles.bagCont}>
              <button>
                <svg
                  class="icon-cart"
                  width="15"
                  height="18"
                  viewBox="0 0 15 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  data-v-f756b3ad=""
                >
                  <path
                    d="M1.19891 5.8049C1.2448 5.02484 1.89076 4.41576 2.67216 4.41576H12.0298C12.8112 4.41576 13.4572 5.02485 13.5031 5.8049L14.0884 15.7547C14.1382 16.6023 13.4643 17.3171 12.6151 17.3171H2.08688C1.23775 17.3171 0.563767 16.6023 0.61363 15.7547L1.19891 5.8049Z"
                    stroke-width="1.2"
                  ></path>
                  <path
                    d="M11.4354 6.3737C11.4354 3.21604 9.60694 0.65625 7.35147 0.65625C5.096 0.65625 3.26758 3.21604 3.26758 6.3737"
                    stroke-width="1.2"
                    stroke-linecap="round"
                  ></path>
                </svg>
              </button>
            </div>
            <div className={styles.proDets}>
              <h4> {data[0]?.name || ""}</h4>
              <div>
                <span>{data[0]?.price || ""}</span>
                <span>&nbsp;INR</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.rightProCon} id="productCont">
          <div className={styles.rightProConWrap}>
            {data?.slice(1, 11)?.map((item, index) => (
              <div key={`product-${index}`} className={styles.productCard}>
                <Link
                  href={"/product/" + item?._id || ""}
                  style={{ cursor: "pointer" }}
                >
                  <Image
                    width={1000}
                    height={1000}
                    alt={item?.assets[0]?.altText || ""}
                    src={item?.assets[0]?.path || ""}
                  />
                </Link>
                <div className={styles.productOverlay}>
                  <div className={styles.bagCont}>
                    <button>
                      <svg
                        class="icon-cart"
                        width="15"
                        height="18"
                        viewBox="0 0 15 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        data-v-f756b3ad=""
                      >
                        <path
                          d="M1.19891 5.8049C1.2448 5.02484 1.89076 4.41576 2.67216 4.41576H12.0298C12.8112 4.41576 13.4572 5.02485 13.5031 5.8049L14.0884 15.7547C14.1382 16.6023 13.4643 17.3171 12.6151 17.3171H2.08688C1.23775 17.3171 0.563767 16.6023 0.61363 15.7547L1.19891 5.8049Z"
                          stroke-width="1.2"
                        ></path>
                        <path
                          d="M11.4354 6.3737C11.4354 3.21604 9.60694 0.65625 7.35147 0.65625C5.096 0.65625 3.26758 3.21604 3.26758 6.3737"
                          stroke-width="1.2"
                          stroke-linecap="round"
                        ></path>
                      </svg>
                    </button>
                  </div>
                  <div className={styles.proDets}>
                    <h4>{item?.name || ""}</h4>
                    <div>
                      <span>{item?.price || ""}</span>
                      <span>&nbsp;INR</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div id="prodcut-container" className="prodcut-container-mobile">
        {data?.map((item, index) => {
          return (
            <Link
              href={"/product/" + item?._id || ""}
              className="product-lb"
              key={`mob-product-${index}`}
            >
              <Image
                width={1000}
                height={1000}
                src={item?.assets[0]?.path || ""}
                alt={item?.assets[0]?.altText || ""}
              />
              <div className="product-info">
                <p>{item?.name || ""}</p>
                <p>{item?.price || ""} INR</p>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
};

export default ProductSection;
