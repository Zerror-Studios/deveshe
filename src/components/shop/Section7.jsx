import React from 'react'
import styles from './shop.module.css'
import Image from 'next/image'

const Section7 = () => {
    return (
        <div className={styles.shopSection7}>
            <div className={styles.secPara7}>
                <h6>I kicked off my journey</h6>
                <p>studying Politics and Law, worked as
                    human rights advocacy - only to realize
                    <span>my true passion lies in Creativity.</span>
                </p>
            </div>
            <div className={styles.secPara7}>
                <h6>With years of experience</h6>
                <p>providing online education, I've learned
                    that the key to supporting you is <span>helping you uncover</span> your strengths and passions.
                </p>
            </div>
            <div className={styles.strip7}>
            <Image width={1000} height={1000} src="/about/dress1.jpg" alt='card' />
            <Image width={1000} height={1000} src="/about/dress2.jpg" alt='card' />
            <Image width={1000} height={1000} src="/about/dress3.jpg" alt='card' />
            <Image width={1000} height={1000} src="/about/dress4.jpg" alt='card' />
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