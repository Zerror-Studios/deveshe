import React, { useEffect, useState } from 'react'
import styles from './shop.module.css'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
import { useGSAP } from '@gsap/react'
gsap.registerPlugin(ScrollTrigger)
const ProductListing = () => {
  const products = [
    {
      image1: "/product/Emerald Kaftan top (2).jpeg",
      image2: ""
    },
    {
      image1: "/product/Gold crochet bib (2).jpeg",
      image2: ""
    },

    {
      image1: "/product/Ombré blue magia sleeve dress (1).jpeg",
      image2: ""
    },
    {
      image1: "/product/Ombré crochet patch dress- Brown (1).JPG",
      image2: ""
    },
    {
      image1: "/product/Emerald Kaftan top (2).jpeg",
      image2: ""
    },
    {
      image1: "/product/Golden fishnet crochet bag.jpeg",
      image2: ""
    },
    {
      image1: "/product/Emerald Kaftan top (2).jpeg",
      image2: ""
    },
    {
      image1: "/product/Gold crochet bib (2).jpeg",
      image2: ""
    },

    {
      image1: "/product/Ombré blue magia sleeve dress (1).jpeg",
      image2: ""
    },
    {
      image1: "/product/Ombré crochet patch dress- Brown (1).JPG",
      image2: ""
    },
    {
      image1: "/product/Emerald Kaftan top (2).jpeg",
      image2: ""
    },
    {
      image1: "/product/Golden fishnet crochet bag.jpeg",
      image2: ""
    },
    {
      image1: "/product/Emerald Kaftan top (2).jpeg",
      image2: ""
    },
    {
      image1: "/product/Gold crochet bib (2).jpeg",
      image2: ""
    },

    {
      image1: "/product/Ombré blue magia sleeve dress (1).jpeg",
      image2: ""
    },
    {
      image1: "/product/Ombré crochet patch dress- Brown (1).JPG",
      image2: ""
    },
    {
      image1: "/product/Emerald Kaftan top (2).jpeg",
      image2: ""
    },
    {
      image1: "/product/Golden fishnet crochet bag.jpeg",
      image2: ""
    },
  ]
  const [displayedProducts, setDisplayedProducts] = useState(products);

  useGSAP(() => {
    if (window.innerWidth > 576) return;
    const container = document.querySelector('#productCont');
    const height = container.scrollHeight;
    const containerHeight = document.querySelector("#productContwrap").getBoundingClientRect().height * 3.66;
    const scrollHeight = height - containerHeight;

    gsap.to('#productCont', {
      y: -scrollHeight,
      // duration: 0.5,
      // ease: "power2.inOut",
      scrollTrigger: {
        trigger: '#productListing',
        scroller: "body",
        start: 'top 65px',
        end: 'top -100%',
        scrub: 1,
        // markers: true,
        pin: true
      }
    });

  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 576) {
        setDisplayedProducts(products.slice(0, 10));
      } else {
        setDisplayedProducts(products);
      }
    };

    handleResize(); // check on mount

    window.addEventListener('resize', handleResize); // update on resize
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return (
    <div className={styles.productListing} id='productListing'>
      <Link href="/product?id=6752e99c935fd014e82be779" className={styles.leftProCon}>
        <Image width={1000} height={1000} alt='image' src="/product/Ombré yellow wrap shirt.jpeg" />
        {/* <div className={styles.overlayLeftp}>
          <Image width={1000} height={1000} src="https://www.datocms-assets.com/136001/1727704761-vazzi-water-based-lubricant-100ml-bottle.png?auto=format&fit=crop&h=620&w=520" alt='image' />
        </div> */}
      </Link>
      <div className={styles.rightProCon} id='productContwrap'>
        <div id='productCont'>
          <div className={styles.rightProConWrap} >
            {
              displayedProducts.map((product, index) => (
                <Link href={`/product?id=6752e99c935fd014e82be779`} key={index} className={styles.productCard}>
                  <Image width={1000} height={1000} alt='image' src={product.image1} />
                </Link>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductListing