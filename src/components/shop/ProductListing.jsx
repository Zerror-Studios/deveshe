import React, { useEffect, useState } from 'react'
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
  ]
  const [displayedProducts, setDisplayedProducts] = useState(products);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 576) {
        setDisplayedProducts(products.slice(0, 6));
      } else {
        setDisplayedProducts(products);
      }
    };

    handleResize(); // check on mount

    window.addEventListener('resize', handleResize); // update on resize
    return () => window.removeEventListener('resize', handleResize);
  }, [products]);
  return (
    <div className={styles.productListing}>
      <Link href="/product?id=6752e99c935fd014e82be779" className={styles.leftProCon}>
        <Image width={1000} height={1000} alt='image' src="/product/Ombré yellow wrap shirt.jpeg" />
        {/* <div className={styles.overlayLeftp}>
          <Image width={1000} height={1000} src="https://www.datocms-assets.com/136001/1727704761-vazzi-water-based-lubricant-100ml-bottle.png?auto=format&fit=crop&h=620&w=520" alt='image' />
        </div> */}
      </Link>
      <div className={styles.rightProCon}>
        {
          displayedProducts.map((product, index) => (
            <Link href={`/product?id=6752e99c935fd014e82be779`} key={index} className={styles.productCard}>
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