import React from 'react'
import { IoLocationOutline } from 'react-icons/io5'

const AddressCard = (
  {
    name,
    addressLine1,
    addressLine2,
    city,
    state,
    country,
    phone,
    pincode,
    type,
  }
) => {
  return (
    <div className='address_card'>
      <IoLocationOutline />
      <div className='address_details'>
        <p className='person_name'>{name}</p>
        <p>{addressLine1}</p>
        <p>{addressLine2}</p>
        <p>{`${city}, ${state}, ${country} - ${pincode}`}</p>
        <p>{phone}</p>
        <p className='person_location'>{type}</p>
      </div>
    </div>
  )
}

export default AddressCard