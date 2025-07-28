import React from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";

const AddressList = ({
  data = [],
  totalCount = 0,
  loading = false,
  setOpen,
  setAddressId,
}) => {
  return (
    <div className="order-div" style={{ marginInline: "-31px" }}>
      <div className="pay-top2">
        <div className="pay-head">
          <h4>Saved Address</h4>
          <p>
            Easily manage your saved addresses for seamless checkout
            experiences.
          </p>
          <p>
            Your information is kept safe and secure with us.{" "}
            {/* <span style={{ color: "#3b82f6", cursor:'pointer' }}>
                Learn more.
              </span> */}
          </p>
        </div>
        <div className="fixed-right">
          <div
            className="_btn_wrapper _btn_height _w-full"
            onClick={() => setOpen(true)}
            style={{ width: "200px" }}
          >
            Add address
          </div>
        </div>
      </div>

      <div className="pay-outer">
        <div className="my-2"></div>
        {loading ? (
          <>
            <div className="no-order-div flex-all">
              <div className="loader-btn" />
            </div>
          </>
        ) : (
          <>
            {data && data.length > 0 ? (
              <div className="setadd">
                {data?.map((item, index) => (
                  <div key={`address-${index}`} className="address-div">
                    <div className="locationlogo">
                      <IoLocationOutline className="localogo" />
                    </div>
                    <div className="add-detail">
                      <div className="name-btn">
                        <p className="add-name">
                          {item?.firstname || ""} {item?.lastname || ""}
                        </p>
                        <div className="actions">{/* <Profilebtn/> */}</div>
                      </div>
                      <p className="add-name">
                        {item?.flat || ""} {item?.addressline1 || ""}
                      </p>
                      <p className="add-name">{item?.addressline2 || ""}</p>
                      <p className="add-name">
                        {item?.city || ""}, {item?.country || ""}
                      </p>
                      <p className="add-name">{item?.pincode || ""}</p>
                      <div className="phone-btn">
                        <p
                          className="add-name"
                          style={{ fontWeight: "400", marginTop: "5px" }}
                        >
                          {" "}
                          {item?.phone || ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-order-div">
                <div>
                  <p className="no-order-p">There is no address to show</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AddressList;
