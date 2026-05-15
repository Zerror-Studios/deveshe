"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { toast } from 'react-toastify';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client/react";
import { CREATE_CONTACT_FORM } from "@/graphql";
import CommonButton from "../common/CommonButton";

// Contact Form Validation
const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  subject: z.string().min(1, "Topic is required"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .transform((val) => val.replace(/\D/g, ""))
    .refine((val) => val.length === 10, {
      message: "Phone number must be exactly 10 digits",
    }),

  message: z.string().min(5, "Message must be at least 5 characters"),
});
const ContactForm = () => {
  const formRef = useRef(null);
  const [createContact, { loading }] = useMutation(CREATE_CONTACT_FORM);
  useEffect(() => {
    const form = formRef.current;
    if (!form) return undefined;
    const cleanup = [];

    // Handle input focus and blur
    form.querySelectorAll(".input").forEach((i) => {
      const input = i.querySelector("input");
      const handleFocus = () => {
        i.classList.add("active");
      };
      const handleBlur = function () {
        if (this.value === "") {
          i.classList.remove("active");
        }
      };
      input.addEventListener("focus", handleFocus);
      input.addEventListener("blur", handleBlur);
      cleanup.push(() => {
        input.removeEventListener("focus", handleFocus);
        input.removeEventListener("blur", handleBlur);
      });
    });

    // Handle textarea focus and blur
    form.querySelectorAll(".textarea").forEach((i) => {
      const textarea = i.querySelector("textarea");
      const handleFocus = () => {
        i.classList.add("active");
      };
      const handleBlur = function () {
        if (this.value === "") {
          i.classList.remove("active");
        }
      };
      textarea.addEventListener("focus", handleFocus);
      textarea.addEventListener("blur", handleBlur);
      cleanup.push(() => {
        textarea.removeEventListener("focus", handleFocus);
        textarea.removeEventListener("blur", handleBlur);
      });
    });

    // Handle line animation
    form.querySelectorAll(".lineanime").forEach((i) => {
      const handleMouseEnter = () => {
        gsap.to(i.querySelector(".linei"), {
          scaleX: 1,
          duration: 0.3,
          ease: "power1.out",
        });
      };

      const handleMouseLeave = () => {
        gsap.set(i.querySelector(".linei"), { transformOrigin: "right" });
        gsap.to(i.querySelector(".linei"), {
          scaleX: 0,
          duration: 0.3,
          ease: "power1.in",
          onComplete: () => {
            gsap.set(i.querySelector(".linei"), { transformOrigin: "left" });
          },
        });
      };

      i.addEventListener("mouseenter", handleMouseEnter);
      i.addEventListener("mouseleave", handleMouseLeave);
      cleanup.push(() => {
        i.removeEventListener("mouseenter", handleMouseEnter);
        i.removeEventListener("mouseleave", handleMouseLeave);
      });
    });

    return () => cleanup.forEach((removeListener) => removeListener());
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data) => {
    try {
      const input = {
        ...data,
      };
      const { data: response } = await createContact({ variables: { input } });
      const message = response?.createContact || {};
      if (message) {
        toast.success(message);
        reset();
      } else {
        toast.error("Failed to submit the form.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to submitted contact form");
    }
  };

  return (
    <div id="form" className="contact-form-panel">
      <div id="right">
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
          <div className="input lineanime">
            <input type="text" {...register("name")} />
            <h6>name*</h6>
            <div className="linei"></div>
            {errors.name && (
              <p
                className="error-p"
                style={{ bottom: "-20px", marginTop: "5px" }}
              >
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="input lineanime">
            <input type="text" {...register("email")} />
            <h6>email*</h6>
            <div className="linei"></div>
            {errors.email && (
              <p
                className="error-p"
                style={{ bottom: "-20px", marginTop: "5px" }}
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="input lineanime">
            <input type="text" {...register("subject")} />
            <h6>topic*</h6>
            <div className="linei"></div>
            {errors.subject && (
              <p
                className="error-p"
                style={{ bottom: "-20px", marginTop: "5px" }}
              >
                {errors.subject.message}
              </p>
            )}
          </div>

          <div className="input lineanime">
            <input type="number" {...register("phoneNumber")} />
            <h6>phone number*</h6>
            <div className="linei"></div>
            {errors.phoneNumber && (
              <p
                className="error-p"
                style={{ bottom: "-20px", marginTop: "5px" }}
              >
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div className="textarea lineanime">
            <h6>message*</h6>
            <div className="linei"></div>
            <textarea {...register("message")} />
            {errors.message && (
              <p
                className="error-p"
                style={{ bottom: "-20px", marginTop: "5px" }}
              >
                {errors.message.message}
              </p>
            )}
          </div>

          <CommonButton title={"Submit"} loading={loading} />
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
