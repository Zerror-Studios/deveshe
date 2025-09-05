"use client";
import React, { useState } from "react";
import { IoLocationOutline } from "react-icons/io5";

const AddressPopup = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    postal: "",
    country: "India",
    state: "",
    phone: "",
    addressType: "Home",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!isOpen) return null;

  return (
    <div onClick={onClose} className="modal-overlay" id="address_popup">
      <div onClick={(e)=>e.stopPropagation()} className="modal-content">
        <h3 className="modal-title">
          Address details <span className="location-icon"><IoLocationOutline /></span>
        </h3>

        <div className="info-box">
          Your Address Details will be saved securely
        </div>

        <form className="address-form">
          <div className="form-row">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <input
            type="text"
            name="address1"
            placeholder="Address Line 1"
            value={formData.address1}
            onChange={handleChange}
          />

          <input
            type="text"
            name="address2"
            placeholder="Address Line 2"
            value={formData.address2}
            onChange={handleChange}
          />

          <div className="form-row">
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
            />
            <input
              type="text"
              name="postal"
              placeholder="Postal Number"
              value={formData.postal}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={formData.country}
              onChange={handleChange}
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
              />
            <select
              name="addressType"
              value={formData.addressType}
              onChange={handleChange}
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn save">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressPopup;
