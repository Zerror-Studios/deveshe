import React from 'react'
import CategoryExplore from '@/components/home/CategoryExplore'
import HeroSection from '@/components/shop/HeroSection'
import CuratedProducts from '@/components/home/CuratedProducts'

const ShopPage = () => {
  return (
    <>
    <HeroSection />
    <CuratedProducts />
    <CategoryExplore />
    </>
  )
}

export default ShopPage