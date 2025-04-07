import React from 'react'
import styles from './shop.module.css'
import Image from 'next/image'
import Link from 'next/link'

const ProductListing = () => {
  const products = [
    {
      image1:"/product/Emerald Kaftan top (2).jpeg",
      image2:""
    },
    {
      image1:"/product/Gold crochet bib (2).jpeg",
      image2:""
    },
    
    {
      image1:"/product/Ombré blue magia sleeve dress (1).jpeg",
      image2:""
    },
    {
      image1:"/product/Ombré crochet patch dress- Brown (1).JPG",
      image2:""
    },
    {
      image1:"/product/Emerald Kaftan top (2).jpeg",
      image2:""
    },
    {
      image1:"/product/Golden fishnet crochet bag.jpeg",
      image2:""
    },
    {
      image1:"/product/Emerald Kaftan top (2).jpeg",
      image2:""
    },
    {
      image1:"/product/Gold crochet bib (2).jpeg",
      image2:""
    },
    
    {
      image1:"/product/Ombré blue magia sleeve dress (1).jpeg",
      image2:""
    },
    {
      image1:"/product/Ombré crochet patch dress- Brown (1).JPG",
      image2:""
    },
    {
      image1:"/product/Emerald Kaftan top (2).jpeg",
      image2:""
    },
    {
      image1:"/product/Golden fishnet crochet bag.jpeg",
      image2:""
    },
    {
      image1:"/product/Emerald Kaftan top (2).jpeg",
      image2:""
    },
    {
      image1:"/product/Gold crochet bib (2).jpeg",
      image2:""
    },
    
    {
      image1:"/product/Ombré blue magia sleeve dress (1).jpeg",
      image2:""
    },
    {
      image1:"/product/Ombré crochet patch dress- Brown (1).JPG",
      image2:""
    },
    {
      image1:"/product/Emerald Kaftan top (2).jpeg",
      image2:""
    },
    {
      image1:"/product/Golden fishnet crochet bag.jpeg",
      image2:""
    },
   
    // {
    //   image1: "https://www.datocms-assets.com/136001/1727272634-khoa_swim.jpg?auto=format&fit=crop&h=900&w=900",
    //   image2: "https://www.datocms-assets.com/136001/1725218968-vazzi-water-based-lubricant-500ml-pouch.png?auto=format&fit=crop&h=620&w=520",
    // },
    // {
    //   image1: "https://www.datocms-assets.com/136001/1727275765-hugshugshugs.jpg?auto=format&fit=crop&h=900&w=900",
    //   image2: "https://www.datocms-assets.com/136001/1725129795-vazzi-stay-wet-jump-rope-sunny.png?auto=format&fit=crop&h=620&w=520"
    // },
    // {
    //   image1: "https://www.datocms-assets.com/136001/1727276364-floating.jpg?auto=format&fit=crop&h=900&w=900",
    //   image2: "https://www.datocms-assets.com/136001/1725145996-vazzi-stay-wet-water-bottle.png?auto=format&fit=crop&h=620&w=520"
    // },
    // {
    //   image1: "https://www.datocms-assets.com/136001/1727272854-pool_splash.jpg?auto=format&fit=crop&h=900&w=900",
    //   image2: "https://www.datocms-assets.com/136001/1725214634-vazzi-mouille-toi-t-shirt-2.png?auto=format&fit=crop&h=620&w=520"
    // },
    // {
    //   image1: "https://www.datocms-assets.com/136001/1727275378-face_underwater.jpg?auto=format&fit=crop&h=900&w=900",
    //   image2: "https://www.datocms-assets.com/136001/1727231836-big_slide.png?auto=format&fit=crop&h=620&w=520"
    // },
    // {
    //   image1: "https://www.datocms-assets.com/136001/1727016223-vazzi-distributor-bg.jpg?auto=format&fit=crop&h=900&w=900",
    //   image2: "https://www.datocms-assets.com/136001/1727447630-vazzi-cute-bracelet.png?auto=format&fit=crop&h=620&w=520"
    // },
    // {
    //   image1: "https://www.datocms-assets.com/136001/1727272634-khoa_swim.jpg?auto=format&fit=crop&h=900&w=900",
    //   image2: "https://www.datocms-assets.com/136001/1725218968-vazzi-water-based-lubricant-500ml-pouch.png?auto=format&fit=crop&h=620&w=520",
    // },
    // {
    //   image1: "https://www.datocms-assets.com/136001/1727275765-hugshugshugs.jpg?auto=format&fit=crop&h=900&w=900",
    //   image2: "https://www.datocms-assets.com/136001/1725129795-vazzi-stay-wet-jump-rope-sunny.png?auto=format&fit=crop&h=620&w=520"
    // },
    // {
    //   image1: "https://www.datocms-assets.com/136001/1727276364-floating.jpg?auto=format&fit=crop&h=900&w=900",
    //   image2: "https://www.datocms-assets.com/136001/1725145996-vazzi-stay-wet-water-bottle.png?auto=format&fit=crop&h=620&w=520"
    // },
    // {
    //   image1: "https://www.datocms-assets.com/136001/1727272854-pool_splash.jpg?auto=format&fit=crop&h=900&w=900",
    //   image2: "https://www.datocms-assets.com/136001/1725214634-vazzi-mouille-toi-t-shirt-2.png?auto=format&fit=crop&h=620&w=520"
    // },
    // {
    //   image1: "https://www.datocms-assets.com/136001/1727275378-face_underwater.jpg?auto=format&fit=crop&h=900&w=900",
    //   image2: "https://www.datocms-assets.com/136001/1727231836-big_slide.png?auto=format&fit=crop&h=620&w=520"
    // },
    // {
    //   image1: "https://www.datocms-assets.com/136001/1727016223-vazzi-distributor-bg.jpg?auto=format&fit=crop&h=900&w=900",
    //   image2: "https://www.datocms-assets.com/136001/1727447630-vazzi-cute-bracelet.png?auto=format&fit=crop&h=620&w=520"
    // },
    // {
    //   image1: "https://www.datocms-assets.com/136001/1727272634-khoa_swim.jpg?auto=format&fit=crop&h=900&w=900",
    //   image2: "https://www.datocms-assets.com/136001/1725218968-vazzi-water-based-lubricant-500ml-pouch.png?auto=format&fit=crop&h=620&w=520",
    // },
    // {
    //   image1: "https://www.datocms-assets.com/136001/1727275765-hugshugshugs.jpg?auto=format&fit=crop&h=900&w=900",
    //   image2: "https://www.datocms-assets.com/136001/1725129795-vazzi-stay-wet-jump-rope-sunny.png?auto=format&fit=crop&h=620&w=520"
    // },
    // {
    //   image1: "https://www.datocms-assets.com/136001/1727276364-floating.jpg?auto=format&fit=crop&h=900&w=900",
    //   image2: "https://www.datocms-assets.com/136001/1725145996-vazzi-stay-wet-water-bottle.png?auto=format&fit=crop&h=620&w=520"
    // },
    // {
    //   image1: "https://www.datocms-assets.com/136001/1727272854-pool_splash.jpg?auto=format&fit=crop&h=900&w=900",
    //   image2: "https://www.datocms-assets.com/136001/1725214634-vazzi-mouille-toi-t-shirt-2.png?auto=format&fit=crop&h=620&w=520"
    // },
    // {
    //   image1: "https://www.datocms-assets.com/136001/1727275378-face_underwater.jpg?auto=format&fit=crop&h=900&w=900",
    //   image2: "https://www.datocms-assets.com/136001/1727231836-big_slide.png?auto=format&fit=crop&h=620&w=520"
    // },
    // {
    //   image1: "https://www.datocms-assets.com/136001/1727016223-vazzi-distributor-bg.jpg?auto=format&fit=crop&h=900&w=900",
    //   image2: "https://www.datocms-assets.com/136001/1727447630-vazzi-cute-bracelet.png?auto=format&fit=crop&h=620&w=520"
    // },
  ]
  return (
    <div className={styles.productListing}>
      <Link href="/product/1" className={styles.leftProCon}>
        <Image width={1000} height={1000} alt='image' src="/product/Ombré yellow wrap shirt.jpeg" />
        {/* <div className={styles.overlayLeftp}>
          <Image width={1000} height={1000} src="https://www.datocms-assets.com/136001/1727704761-vazzi-water-based-lubricant-100ml-bottle.png?auto=format&fit=crop&h=620&w=520" alt='image' />
        </div> */}
      </Link>
      <div className={styles.rightProCon}>
        {
          products.map((product, index) => (
            <Link href={`/product/${index}`} key={index} className={styles.productCard}>
              <Image width={1000} height={1000} alt='image' src={product.image1} />
              {/* <div className={styles.overlayRightp}>
            <Image width={1000} height={1000} src={product.image2} alt='image' />
          </div> */}
            </Link>
          ))
        }
      </div>
    </div>
  )
}

export default ProductListing