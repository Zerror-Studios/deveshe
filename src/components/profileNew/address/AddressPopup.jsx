import React, { useState } from "react";
import { IoLocationOutline } from "react-icons/io5";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

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

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.address1) newErrors.address1 = "Address line 1 is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.postal) newErrors.postal = "Postal code is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    console.log("Form Submitted", formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div onClick={onClose} className="modal-overlay" id="address_popup">
      <div onClick={(e) => e.stopPropagation()} className="modal-content">
        <h3 className="modal-title">
          Address details <span className="location-icon"><IoLocationOutline /></span>
        </h3>

        <div className="info-box">Your Address Details will be saved securely</div>

        <form className="address-form" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-row">
            <div style={{ flex: 1 }}>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && <span className="error-text">{errors.firstName}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
              />
              {errors.lastName && <span className="error-text">{errors.lastName}</span>}
            </div>
          </div>

          {/* Address */}
          <input
            type="text"
            name="address1"
            placeholder="Address Line 1"
            value={formData.address1}
            onChange={handleChange}
          />
          {errors.address1 && <span className="error-text">{errors.address1}</span>}

          <input
            type="text"
            name="address2"
            placeholder="Address Line 2 (Optional)"
            value={formData.address2}
            onChange={handleChange}
          />

          <div className="form-row">
            <div style={{ flex: 1 }}>
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
              />
              {errors.city && <span className="error-text">{errors.city}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                name="postal"
                placeholder="Postal Number"
                value={formData.postal}
                onChange={handleChange}
              />
              {errors.postal && <span className="error-text">{errors.postal}</span>}
            </div>
          </div>

          {/* Country + State */}
          <div className="form-row">
            <div style={{ flex: 1 }}>
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
              />
              {errors.state && <span className="error-text">{errors.state}</span>}
            </div>
          </div>

          {/* Phone + Address Type */}
          <div className="form-row">
            <div style={{ flex: 1 }}>
              <PhoneInput
                country={"in"}
                value={formData.phone}
                onChange={(value) => {
                  setFormData({ ...formData, phone: value });
                  setErrors({ ...errors, phone: "" });
                }}
                enableSearch={true}
                inputStyle={{ width: "100%" }}
                buttonStyle={{ border: "none" }}
                placeholder="Phone number"
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>
            <div style={{ flex: 1 }}>
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
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="btn cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn save">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressPopup;
