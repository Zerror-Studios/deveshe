"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { toast } from 'react-toastify';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client/react";
import { CREATE_CONTACT_FORM } from "@/graphql";
import BracketSlideCta from "@/components/common/BracketSlideCta";
import { getErrorMessage } from "@/utils/api-error.util";

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
    // Scoped to this form (it renders in a drawer portal), and listeners
    // are tracked so they are removed on unmount (SF-20).
    const form = formRef.current;
    if (!form) return undefined;
    const cleanups = [];
    const listen = (element, type, handler) => {
      element.addEventListener(type, handler);
      cleanups.push(() => element.removeEventListener(type, handler));
    };

    // Handle input and textarea focus and blur
    form.querySelectorAll(".input, .textarea").forEach((i) => {
      const field = i.querySelector("input, textarea");
      if (!field) return;
      listen(field, "focus", () => {
        i.classList.add("active");
      });
      listen(field, "blur", () => {
        if (field.value === "") {
          i.classList.remove("active");
        }
      });
    });

    // Handle line animation
    form.querySelectorAll(".lineanime").forEach((i) => {
      const line = i.querySelector(".linei");
      if (!line) return;
      listen(i, "mouseenter", () => {
        gsap.to(line, {
          scaleX: 1,
          duration: 0.3,
          ease: "power1.out",
        });
      });

      listen(i, "mouseleave", () => {
        gsap.set(line, { transformOrigin: "right" });
        gsap.to(line, {
          scaleX: 0,
          duration: 0.3,
          ease: "power1.in",
          onComplete: () => {
            gsap.set(line, { transformOrigin: "left" });
          },
        });
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
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
      if (response?.submitContactForm?._id) {
        toast.success("Thank you! We will get back to you soon.");
        reset();
      } else {
        toast.error("Failed to submit the form.");
      }
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to submit the contact form"));
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

          <div className="contact-form-submit-wrap">
            <BracketSlideCta
              label="Submit"
              type="submit"
              loading={loading}
              className="contact-form-submit"
              ariaLabel="Submit contact form"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
