import React from 'react'
import styles from './shop.module.css'
import Image from 'next/image'

const Section8 = () => {
    return (
        <div className={styles.shopSection8}>
            <div>
                <h2>Your interests and values are</h2>
                <h2>your guiding stars <span>to happiness</span></h2>
                <h2><span>and success.</span></h2>
            </div>
            <div className={styles.secPara7}>
                <h6>With years of experience</h6>
                <p>providing online education, I've learned
                    that the key to supporting you is <span>helping you uncover</span> your strengths and passions.
                </p>
            </div>
            <div className={styles.strip8}>
                <Image width={1000} height={1000} src="/about/dress5.jpg" alt='image' />
                <Image width={1000} height={1000} src="/about/dress6.jpeg" alt='image' />
                <Image width={1000} height={1000} src="/about/dress7.jpeg" alt='image' />
                <Image width={1000} height={1000} src="/about/dress8.jpg" alt='image' />
            </div>
        </div>
    )
}

export default Section8