import React from "react";
import AddressCard from "./AddressCard";

const AddressContainer = () => {
  const addressData = [0, 1];
  return (
    <div id="address_container">
      {addressData.length > 0 ? (
        addressData.map((a, i) => <AddressCard key={i} />)
      ) : (
        <p className="no-data">There is no address to show</p>
      )}
    </div>
  );
};

export default AddressContainer;
