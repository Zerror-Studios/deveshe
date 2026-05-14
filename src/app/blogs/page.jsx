import React from 'react'
import Image from 'next/image'
import CommonButton from '@/components/common/CommonButton'

const page = () => {
  return (
    <div id="status_section">
    <Image
      width={1000}
      height={1000}
      src="/fail.gif"
      className="fail_gif"
      alt="work in progress"
    />
  
    <h2>
      Work in <span>Progress</span>
    </h2>
  
    <p>
      This section is currently under development and will be available soon.
      We're working hard to bring you fresh content and new features.
    </p>
  
    <CommonButton title={"Go Back to Home"} href={"/"} />
  </div>
  )
}

export default page