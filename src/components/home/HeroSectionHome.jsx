import React from 'react'
import Image from 'next/image'

const HeroSectionHome = () => {
    return (
        <div id="hero_section_home">
            <div className="home_banner_container_inner">
                <Image src="/assets/images/home/Homepage 1.webp" alt="home_banner" width={1000} height={1000} />
            </div>
            <div className="home_banner_container_inner">
                <Image src="/assets/images/home/Homepage 2.webp" alt="home_banner" width={1000} height={1000} />
            </div>
            <div className="home_banner_container_inner">
                <Image src="/assets/images/home/Homepage 3.webp" alt="home_banner" width={1000} height={1000} />
            </div>
            <div className="home_banner_container_inner">
                <Image src="/assets/images/home/Homepage 4.webp" alt="home_banner" width={1000} height={1000} />
            </div>
        </div>
    )
}

export default HeroSectionHome