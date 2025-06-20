import React  from 'react'
import styles from './archive.module.css'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
const Section2 = () => {
   
  return (
    <div className={styles.archiveSection2} id='archiveSection2'>
        <h3>Our mission is to put Indian inspired niche perfumery on the map through an uncompromising attitude towards quality and an obsession to represent the new India, one that is modern, youthful, vibrant and bold.</h3>
    </div>
  )
}

export default Section2