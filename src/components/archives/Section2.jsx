import React, { useEffect } from 'react'
import styles from './archive.module.css'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
const Section2 = () => {
    // useEffect(()=>{
    //     var clutter = ""
    //     document.querySelector("#archiveSection2 h3").textContent.split("").forEach(function(letter){
    //         if(letter === ""){
    //             clutter += `<span>&nbsp;</span>`
    //         }
    //         else{
    //             clutter += `<span>${letter}</span>`
    //         }
    //     })
    //     document.querySelector("#archiveSection2 h3").innerHTML = clutter

    //     gsap.to(document.querySelectorAll("#archiveSection2 h3 span"),{
    //         opacity:1,
    //         stagger:.2,
    //         scrollTrigger:{
    //             trigger: "#archiveSection2",
    //             scroller:"body",
    //             start: "top 50%",
    //             end: "top 10%",
    //             scrub: 1,
    //         }
    //     })
    // },[])
  return (
    <div className={styles.archiveSection2} id='archiveSection2'>
        <h3>Our mission is to put Indian inspired niche perfumery on the map through an uncompromising attitude towards quality and an obsession to represent the new India, one that is modern, youthful, vibrant and bold.</h3>
    </div>
  )
}

export default Section2