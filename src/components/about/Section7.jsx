import React from 'react'
import styles from '../shop/shop.module.css'
import Image from 'next/image'

const Section7 = () => {
    return (
        <div className={styles.shopSection7}>
           <div className={styles.secPara7}>
  <h6>Where it all began</h6>
  <p>
    Raised in Mumbai, shaped by Parsons —  
    I turned daydreams into fabric,  
    and <span>fashion became my language.</span>
  </p>
</div>

            <div className={styles.secPara7}>
  <h6>Over the years</h6>
  <p>
    I've collaborated with artists,  
    explored print and detail, and found joy in  
    <span> creating stories through style.</span>
  </p>
</div>

            <div className={styles.strip7}>
            <Image width={1000} height={1000} src="/about/dress1.JPG" alt='card' />
            <Image width={1000} height={1000} src="/about/dress2.JPG" alt='card' />
            <Image width={1000} height={1000} src="/about/dress3.JPG" alt='card' />
            <Image width={1000} height={1000} src="/about/dress4.JPG" alt='card' />
            </div>
            <div className={styles.rightCardCont}>
                <div className={styles.cardLg}>
                    <Image width={1000} height={1000} src="https://emmpo.com/assets/0ef1120be377127bff85.png" alt='card' />
                </div>
                <div className={styles.cardSm}>
                    <Image width={1000} height={1000} src="https://emmpo.com/assets/96bc32349c71f8ada495.png" alt='card' />
                </div>
                <Image width={1000} height={1000} src="https://emmpo.com/assets/22234ac77fdff7b042b9.png" alt='text' />
            </div>
        </div >
    )
}

export default Section7