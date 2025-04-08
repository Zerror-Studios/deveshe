import gsap from 'gsap'
import React, { useEffect } from 'react'

const Section1 = () => {

  useEffect(()=>{
    document.querySelectorAll("#right form .input").forEach(function (i) {
      i.querySelector("input").addEventListener("focus", function () {
          i.classList.add("active")
      })
      i.querySelector("input").addEventListener("blur", function () {
          if (this.value == "") {
              i.classList.remove("active")
          }
      })
  })
  
  document.querySelectorAll("#right form .textarea").forEach(function (i) {
      i.querySelector("textarea").addEventListener("focus", function () {
          i.classList.add("active")
      })
      i.querySelector("textarea").addEventListener("blur", function () {
          if (this.value == "") {
              i.classList.remove("active")
          }
      })
  
  })
  document.querySelectorAll(".lineanime").forEach(function (i) {
    i.addEventListener("mouseenter", function () {
        gsap.to(i.querySelector(".linei"), {
            scaleX: 1, // Use scaleX directly
            duration:0.3, // Add duration for smooth animation
            ease: "power1.out", // Optional easing
        });
    });

    i.addEventListener("mouseleave", function () {
        gsap.set(i.querySelector(".linei"), {
            transformOrigin: "right", // Retract towards left
        })
        gsap.to(i.querySelector(".linei"), {
            scaleX: 0, // Revert to scaleX(0) on mouse leave
            duration: 0.3,
            ease: "power1.in", // Optional easing,
            onComplete:()=>{
                gsap.set(i.querySelector(".linei"), {
                    transformOrigin: "left", // Retract towards left
                })

            }
        });
    });
});
  
  },[])

  return (
    <section id="page1">
        <div id="form">
            <div id="left">
                <h2>contact</h2>
            </div>
            <div id="right">
                <form action="">
                    <div className="input lineanime">
                        <input type="text"/>
                        <h6>name*</h6>
                        <div className="linei"></div>
                    </div>
                    <div className="input lineanime">
                        <input type="text"/>
                        <h6>email*</h6>
                        <div className="linei"></div>
                    </div>
                    <div className="input lineanime">
                        <input type="text"/>
                        <h6>topic*</h6>
                        <div className="linei"></div>
                    </div>
                    <div className="input lineanime">
                        <input type="text"/>
                        <h6>phone number*</h6>
                        <div className="linei"></div>
                    </div>
                    <div className="textarea lineanime">
                        <h6>message*</h6>
                        <div className="linei"></div>
                        <textarea name="" id=""></textarea>
                    </div>
                    <button id='submit-btn'>Submit</button>
                </form>
            </div>
        </div>
        <div id="address">
            <div className="elem elem-lf">
                <h5>We believe in the power of digital, and we love collaborating with brands that feel the same.
                    Let's connect.</h5>
            </div>
            <div className="elem">
                <div className="add">
                    <h6>Business enquiries</h6>
                    <h5>info@wealthfusion.co.uk</h5>
                    <h5>+44 (0) 208 154 7030</h5>
                </div>
                <div className="add">
                    <h6>Address</h6>
                    <h5>70 Baker Street, <br />
                    London, W1U 7DL</h5>
                </div>
            </div>
        </div>
    </section>
  )
}

export default Section1;