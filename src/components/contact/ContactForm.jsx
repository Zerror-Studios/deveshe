import React, { useEffect } from "react";
import gsap from "gsap";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client";
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
  const [createContact, { loading }] = useMutation(CREATE_CONTACT_FORM);
  useEffect(() => {
    // Handle input focus and blur
    document.querySelectorAll("#right form .input").forEach((i) => {
      const input = i.querySelector("input");
      input.addEventListener("focus", () => {
        i.classList.add("active");
      });
      input.addEventListener("blur", function () {
        if (this.value === "") {
          i.classList.remove("active");
        }
      });
    });

    // Handle textarea focus and blur
    document.querySelectorAll("#right form .textarea").forEach((i) => {
      const textarea = i.querySelector("textarea");
      textarea.addEventListener("focus", () => {
        i.classList.add("active");
      });
      textarea.addEventListener("blur", function () {
        if (this.value === "") {
          i.classList.remove("active");
        }
      });
    });

    // Handle line animation
    document.querySelectorAll(".lineanime").forEach((i) => {
      i.addEventListener("mouseenter", () => {
        gsap.to(i.querySelector(".linei"), {
          scaleX: 1,
          duration: 0.3,
          ease: "power1.out",
        });
      });

      i.addEventListener("mouseleave", () => {
        gsap.set(i.querySelector(".linei"), { transformOrigin: "right" });
        gsap.to(i.querySelector(".linei"), {
          scaleX: 0,
          duration: 0.3,
          ease: "power1.in",
          onComplete: () => {
            gsap.set(i.querySelector(".linei"), { transformOrigin: "left" });
          },
        });
      });
    });
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
    <div id="form">
      <div id="left"></div>
      <div id="right">
        <form onSubmit={handleSubmit(onSubmit)}>
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
