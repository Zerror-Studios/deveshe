import React from "react";
import styles from "@/components/lookbook/lookbook.module.css";
import Section2 from "@/components/lookbook/Section2";
import Section3 from "@/components/lookbook/Section3";

const Lookbook = () => {
  return (
    <div className={styles.archiveWrapper}>
      <Section2 />
      <Section3 />
    </div>
  );
};

export default Lookbook;
