import React from 'react'
import styles from './shop.module.css'
import Image from 'next/image'

const Section3 = () => {
    return (
        <div className={styles.shopSection3}>
            <Image width={1000} height={1000} src="/shop/shop-banner1.webp" alt='image'/>
            <div className={styles.overlay3}>
                <div>
                    <h2>Discover New</h2>
                    <h2>Collection!</h2>
                </div>
                <div className={styles.Section33Btm}>
                    <p>Find which careers match <br />
                        your personality.</p>
                    <h3>Take the Quiz and receive <br />
                        recommendations just <br />
                        for You!</h3>
                    <h2 className={styles.titleh2}>you will get:</h2>
                    <div className={styles.imageContainer2}>
                        <div className={styles.imgCardSec3}>
                            <Image width={1000} height={1000} src="https://emmpo.com/assets/19fe6ba1416662966d9a.png" alt='image'/>
                            <p><span>Top 15+</span> tech and sustainability careers for your personality.</p>
                        </div>
                        <div className={styles.imgCardSec3}>
                            <Image width={1000} height={1000} src="https://emmpo.com/assets/4ad5ec5a3db01004cdd0.png" alt='image'/>
                            <p><span>Top 15+</span> tech and sustainability careers for your personality.</p>
                        </div>
                        <Image width={1000} height={1000} src="https://emmpo.com/assets/0a541af8d51a8cd9d385.png" alt='image'/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Section3