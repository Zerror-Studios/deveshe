import React from "react";
import AddressCard from "./AddressCard";

const AddressContainer = (
  {
    data = [],
    totalCount = 0,
    loading = false,
    setOpen,
    setAddressId
  }) => {
  return (
    <div id="address_container">
      {loading ? (
        <>
          <div className="no-order-div flex-all">
            <div className="loader-btn" />
          </div>
        </>
      ) : (
        <>
          {data && data.length > 0 ? (
            <>
              {data?.map((item, index) => (
                <AddressCard
                  key={`address-${index}`}
                  name={`${item?.firstname || ""} ${item?.lastname || ""}`}
                  addressLine1={`${item?.flat || ""} ${item?.addressline1 || ""}`}
                  addressLine2={item?.addressline2 || ""}
                  city={item?.city || ""}
                  state={item?.states || ""}
                  phone={item?.phone || ""}
                  country={item?.country || ""}
                  pincode={item?.pincode || ""}
                  type={item?.addressType || ""}
                />
              ))}
            </>
          ) : (
            <p className="no-data">There is no address to show</p>
          )}
        </>
      )
      }

    </div>
  );
};

export default AddressContainer;
