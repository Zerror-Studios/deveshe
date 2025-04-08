import Link from 'next/link'
import React from 'react'

const HeaderLogo = ({headerLogo}) => {
  return (
    <Link ref={headerLogo} href="/" id='header-logo'>de ve she dreams</Link>
  )
}

export default HeaderLogo;