import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const ProductListMobile = () => {
    const products = [
    {
      image1: "/newproduct/BI02.jpg",
    },
    {
      image1: "/newproduct/BI01.jpg",
    },
    {
      image1: "/newproduct/BI03.jpg",
    },
    {
      image1: "/newproduct/BI04.jpg",
    },
    {
      image1: "/newproduct/BI05.jpg",
    },
    {
      image1: "/newproduct/BI06.jpg",
    },
    {
      image1: "/newproduct/BI07.jpg",
    },
    {
      image1: "/newproduct/BI01.jpg",
    },
    {
      image1: "/newproduct/BI02.jpg",
    },
    {
      image1: "/newproduct/BI03.jpg",
    },
  ];
  return (
    <div id='prodcut-container' className='prodcut-container-mobile'>
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

export default ProductListMobile;