import React from 'react'
import styles from "./shop.module.css"
import Image from 'next/image'

const Section6 = () => {
  return (
    <div className={styles.shopSection6}>
        <div>
            <h2>It's great to see you</h2>
            <h2>on <span>your journey</span> to</h2>
            <h2>discovering your</h2>
        </div>
        <Image height={1000} width={1000} alt='image' src="https://emmpo.com/assets/af3020a78265de970759.png"/>
    </div>
  )
}

export default Section6