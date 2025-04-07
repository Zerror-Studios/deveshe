import React from 'react'
import styles from './shop.module.css'
import Image from 'next/image'

const Section2 = () => {
  return (
    <div className={styles.shopSection2}>
      <div className={styles.shopSection2Top}>
        <div className={styles.crossImg}>
          <Image height={1000} width={1000} src="https://emmpo.com/assets/51deafe99e147c5239b2.png" alt='cross-img' />
        </div>
        <h2>Explore</h2>
        <h2><span>careers</span> where</h2>
        <h2>you can make</h2>
        <h2>a difference!</h2>
        <div className={styles.shopSection2TopBtm}>
          <div className={styles.leftCard}>
            <Image width={1000} height={1000} src="/shop/Peach_crochet_shirt.webp" alt='image' />
          </div>
          <div className={styles.centerCard}>
            <div className={styles.imgCont}>
              <Image width={1000} height={1000} src="/shop/Silver metallic crochet bib.jpeg" alt='image' />
            </div>
            <p>You find the careers that you would most likely Enjoy and are good at.</p>
          </div>
          <div className={styles.rightCard}>
            <Image width={1000} height={1000} src="/shop/Gold crochet bib.JPG" alt='image' />
          </div>
        </div>
      </div>
      <div className={styles.shopSection2Bottom}>
        <h5>All related to</h5>
        <h3>Creativity, <br />
          Sustainability, <br />
          and Tech.</h3>
        <h4>[Take the Quiz]</h4>
        <div className={styles.strip1}>
          <Image width={1000} height={1000} src="/shop/dress1.jpeg" alt='image' />
          <Image width={1000} height={1000} src="/shop/dress4.jpeg" alt='image' />
          <Image width={1000} height={1000} src="/shop/dress1.jpeg" alt='image' />
          <Image width={1000} height={1000} src="/shop/dress3.jpeg" alt='image' />
        </div>
        <div className={styles.strip2}>
          <Image width={1000} height={1000} src="/shop/dress5.JPG" alt='image' />
          <Image width={1000} height={1000} src="/shop/dress6.jpeg" alt='image' />
          <Image width={1000} height={1000} src="/shop/dress1.jpeg" alt='image' />
          <Image width={1000} height={1000} src="/shop/dress8.JPG" alt='image' />
        </div>
      </div>
    </div>
  )
}

export default Section2