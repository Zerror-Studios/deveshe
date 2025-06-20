import React from "react";
import Section2 from "@/components/archive/Section2";
import Section3 from "@/components/archive/Section3";
import styles from "@/components/archive/archive.module.css";

const Lookbook = () => {
  return (
    <div className={styles.archiveWrapper}>
      <Section2 />
      <Section3 />
    </div>
  );
};

export default Lookbook;
