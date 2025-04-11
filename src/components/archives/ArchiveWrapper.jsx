import React from 'react'
import styles from './archive.module.css'
import Section3 from './Section3'
import Section2 from './Section2'
import Hero from '../home/Hero'

const ArchiveWrapper = () => {
  return (
    <div className={styles.archiveWrapper}>
        <Section2/>
        <Hero/>
        {/* <Section3/> */}
    </div>
  )
}

export default ArchiveWrapper