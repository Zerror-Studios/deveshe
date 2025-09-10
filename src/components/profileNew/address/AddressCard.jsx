import React from 'react'
import { IoLocationOutline } from 'react-icons/io5'

const AddressCard = () => {
  return (
    <div className='address_card'>
        <IoLocationOutline />
        <div className='address_details'>
            <p className='person_name'>Ayush Ahirwar</p>
            <p>H no. 10 Basant Kunj Colony By pass Road Bhopal</p>
            <p>7354839960</p>
            <p className='person_location'>Home</p>
        </div>
    </div>
  )
}

export default AddressCard