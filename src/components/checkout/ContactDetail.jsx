import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";

const ContactDetail = ({ register, errors }) => {
  const { isLoggedIn } = useAuthStore((state) => state);
  return (
    <div className="contact_container">
      <div className="contact_text_cntr">
        <h2 className="same_style_text">Contact</h2>
        {!isLoggedIn && <Link href={"/login"}>Login</Link>}
      </div>
      <div className="contact_input_cntr">
        <input
          type="email"
          placeholder="Email"
          {...register("email", { required: "Email is required" })}
        />
      </div>
      {errors?.email && (
        <span className="error" style={{marginBottom: "10px"}}>{errors?.email?.message || ""}</span>
      )}
      <label class="checkbox-container">
        <input type="checkbox" {...register("emailSubscribedStatus")} />
        <span class="checkmark">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 14 14"
            focusable="false"
            aria-hidden="true"
            class="arrow"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m12.1 2.8-5.877 8.843a.35.35 0 0 1-.54.054L1.4 7.4"
            ></path>
          </svg>
        </span>
        <h6 className="">Email me with news and offers</h6>
      </label>
    </div>
  );
};

export default ContactDetail;
