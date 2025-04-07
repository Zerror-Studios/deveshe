import React from 'react'
import styles from "./shop.module.css"
import Image from 'next/image'

const Section4 = () => {
    return (
        <div className={styles.shopSection4}>
            <div className={styles.topCont}>
                <div className={styles.topContHeader}>
                    <h2>The <span>science</span></h2>
                    <h2>behind the quiz</h2>
                </div>
                <div className={styles.bottomContPara}>
                    <h6>We leverage a model that is based on</h6>
                    <p>vocational psychology research that has been validated in studies repeatedly during the last 50 years, making it a <span>scientifically grounded tool for career</span> assessment and guidance.</p>
                </div>
            </div>
            <div className={styles.bottomCont}>
                <Image width={1000} height={1000} src="https://emmpo.com/assets/ce3c8196da068a1ba841.png" alt='image'/>
            </div>
        </div>
    )
}

export default Section4