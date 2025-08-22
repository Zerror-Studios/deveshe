import gsap from "gsap";
import React, { useEffect } from "react";
import Phone from "./Phone";

const ContactForm = () => {
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

  return (
    <section id="contact_form">
      <div className="phone_container">
        <Phone />
      </div>
      <div id="form">
        <div id="left"></div>
        <div id="right">
          <form>
            <div className="input lineanime">
              <input type="text" />
              <h6>name*</h6>
              <div className="linei"></div>
            </div>
            <div className="input lineanime">
              <input type="text" />
              <h6>email*</h6>
              <div className="linei"></div>
            </div>
            <div className="input lineanime">
              <input type="text" />
              <h6>topic*</h6>
              <div className="linei"></div>
            </div>
            <div className="input lineanime">
              <input type="text" />
              <h6>phone number*</h6>
              <div className="linei"></div>
            </div>
            <div className="textarea lineanime">
              <h6>message*</h6>
              <div className="linei"></div>
              <textarea></textarea>
            </div>
            <button type="submit" id="submit-btn">
              Submit
            </button>
          </form>
        </div>
      </div>
      <div id="address">
        <div className="elem elem-lf">
          <h5>
            We believe in the power of digital, and we love collaborating with
            brands that feel the same. Let&apos;s connect.
          </h5>
        </div>
        <div className="elem">
          <div className="add">
            <h6>Business enquiries</h6>
            <h5>deveshedreams@gmail.com</h5>
            <h5>+919833983775</h5>
          </div>
          <div className="add">
            <h6>Address</h6>
            <h5>
              1102, Mahindra Heights. <br /> 96 Tardeo Road. <br /> Mumbai
              400034
            </h5>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
