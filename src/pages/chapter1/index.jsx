import ProductContainer from '@/components/lookBook/ProductContainer'
import Section1 from '@/components/lookBook/Section1'
import Section2 from '@/components/lookBook/Section2'
import Section3 from '@/components/lookBook/Section3'
import Section4 from '@/components/lookBook/Section4'
import Section5 from '@/components/lookBook/Section5'
import TextContainer from '@/components/lookBook/TextContainer'
import Text1 from '@/components/lookBook/TextContainer'
import VideoContainer from '@/components/lookBook/VideoContainer'
import React from 'react'

const index = () => {
    const text1 = "Signature camo, urban landscapes, and the vibrant colours of Zombies-mode combine with the edgy styles of 90’s gaming culture in our Call Of Duty®: Black Ops 6 capsule collection."
    const text2 = "Drawing on ARK/8’s iconic graphic tees and hoodies and infusing vintage-inspired outerwear and accessories like caps and socks, this elevated collection pays tribute to both the evolution of the iconic Black Ops franchise and the cultural era that shaped the gaming world."

    return (
        <>
            <Section1 />
            <TextContainer text={text1} />
            <ProductContainer/>
            <TextContainer text={text2} />
            <VideoContainer />
            <Section2 />
            <Section3/>
            <Section4/>
            <Section5/>

        </>
    )
}

export default index