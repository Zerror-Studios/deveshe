import React from 'react'
import styles from "./shop.module.css"
import Image from 'next/image'
const Section5 = () => {
    return (
        <div className={styles.shopSection5}>
            <Image width={1000} height={1000} src="/about/about-banner1.jpeg" alt='ig5-banner'/>
            <div className={styles.overlay5}>
                <div>
                    <h2>The person</h2>
                    <h2>behind the quiz</h2>
                </div>
                <div className={styles.bigCardContainer}>
                    <div className={styles.bigCard}>
                        <video autoPlay muted loop playsInline src="https://emmpo.com/assets/395808beb2e10735b70b.mp4"></video>
                    <p>follow my instagram</p>
                    </div>
                </div>
                <h2>Hey there!</h2>
            </div>
        </div>
    )
}

export default Section5