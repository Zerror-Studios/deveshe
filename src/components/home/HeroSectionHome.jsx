import React from 'react'
import Image from 'next/image'

const HeroSectionHome = () => {
    return (
        <div id="hero_section_home">
            <div className="home_banner_container_inner">
                <Image src="https://saint-laurent.dam.kering.com/asset/37cb14d1-2590-4e91-93f1-b423e7e8243a/SAINT_LAURENT_520_ECOM_HP_DESK_V3.jpg" alt="home_banner" width={1000} height={1000} />
            </div>
            <div className="home_banner_container_inner">
                <Image src="https://saint-laurent.dam.kering.com/asset/00ff238a-8ca3-4a2e-8328-2e5746a4bcb2/SAINT_LAURENT_SUMMER26_TANGERINE-TEMPTATION_ECOM_HP_DESK.jpg" alt="home_banner" width={1000} height={1000} />
            </div>
            <div className="home_banner_container_inner">
                <Image src="https://saint-laurent.dam.kering.com/m/5e4da5a20a44c714/ecom-SAINT_LAURENT_MSPRING26_LB_ECOM_HP_DESK_01.jpg" alt="home_banner" width={1000} height={1000} />
            </div>
            <div className="home_banner_container_inner">
                <Image src="https://saint-laurent.dam.kering.com/asset/63f61473-6176-4af3-afce-7dd3001d9f09/SLRD_GIFTING_ECOM_HP_DESK.jpg" alt="home_banner" width={1000} height={1000} />
            </div>
        </div>
    )
}

export default HeroSectionHome