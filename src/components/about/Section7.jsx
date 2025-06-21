import React from "react";
import styles from "../shop/shop.module.css";
import Image from "next/image";

const Section7 = () => {
  return (
    <div className={styles.shopSection7}>
      <div className={styles.secPara7}>
        <h6>Where it all began</h6>
        <p>
          Raised in Mumbai, shaped by Parsons — I turned daydreams into fabric,
          and <span>fashion became my language.</span>
        </p>
      </div>

      <div className={styles.secPara7}>
        <h6>Over the years</h6>
        <p>
          I've collaborated with artists, explored print and detail, and found
          joy in
          <span> creating stories through style.</span>
        </p>
      </div>

      <div className={styles.strip7}>
        <Image width={1000} height={1000} src="/about/dress1.JPG" alt="card" />
        <Image width={1000} height={1000} src="/about/dress2.JPG" alt="card" />
        <Image width={1000} height={1000} src="/about/dress3.JPG" alt="card" />
        <Image width={1000} height={1000} src="/about/dress4.JPG" alt="card" />
      </div>
      <div className={styles.rightCardCont}>
        <div className={styles.cardLg}>
          <Image
            width={1000}
            height={1000}
            src="/about/about1.jpg"
            alt="card"
          />
        </div>
        <div className={styles.cardSm}>
          <Image
            width={1000}
            height={1000}
            src="/about/about2.jpg"
            alt="card"
          />
        </div>
      </div>
    </div>
  );
};

export default Section7;
