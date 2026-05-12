import CategoryExplore from '@/components/home/CategoryExplore'
import CuratedProducts from '@/components/home/CuratedProducts'
import HeroSection from '@/components/shop/HeroSection'
import React from 'react'

const ShopClient = ({ productData }) => {
    return (
        <>
            <HeroSection />
            <CuratedProducts products={productData} />
            <CategoryExplore />
        </>
    )
}
export default ShopClient