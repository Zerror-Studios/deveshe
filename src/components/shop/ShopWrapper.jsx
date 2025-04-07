import React from 'react'
// import Section1 from './Section1'
import Section2 from './Section2'
import styles from './shop.module.css'
import Section3 from './Section3'
import Section4 from './Section4'
import ProductListing from './ProductListing'
import Footer from '../footer/Footer'

const ShopWrapper = () => {
  return (
    <div className={styles.shopWrapper}>
        <Section3/>
        <Section2/>
        <ProductListing/>
        <Section4/>
        <Footer />
    </div>
  )
}

export default ShopWrapper