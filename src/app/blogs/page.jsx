import React from 'react'
import CommonButton from '@/components/common/CommonButton'

const page = () => {
  return (
    <div id="status_section">
      <h2>
        Work in Progress
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