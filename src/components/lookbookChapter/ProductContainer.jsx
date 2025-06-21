import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const ProductContainer = () => {
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
      ]
  return (
    <div id='prodcut-container'>
        {
            products.map((item, index) => {
                return (
                    <Link href="/product?id=6752e99c935fd014e82be779" className="product-lb" key={index}>
                        <Image width={1000} height={1000} src={item.image1} alt={`Product image`} />
                        <div className="product-info">
                            <p>Belted Leather Jacket</p>
                            <p>1,545 INR</p>
                        </div>
                    </Link>
                )
            })
        }
    </div>
  )
}

export default ProductContainer