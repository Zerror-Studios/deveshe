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
    onEdit,
    onDelete,
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
        {(onEdit || onDelete) && (
          <div className='address_actions'>
            {onEdit && (
              <button type='button' onClick={onEdit}>Edit</button>
            )}
            {onDelete && (
              <button type='button' onClick={onDelete}>Remove</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AddressCard