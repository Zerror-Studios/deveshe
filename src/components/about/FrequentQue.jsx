import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import Image from "next/image";
import React, { useEffect, useState } from "react";
gsap.registerPlugin(ScrollTrigger);
const FrequentQue = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index); // collapse if same is clicked
  };
  const accordionData = [
    {
      title: "Can I have a discount?",
      content: [
        `This is a non-profit event, and our goal is to make FlowFest as affordable as we possibly can whilst delivering a quality day that you’ll never forget. Due to last year’s feedback we are investing more in comfort and quality this year.`,
        `To keep ticket prices as low as we can for everyone, we are unable to offer discounts and appreciate your support for this community event.`,
      ],
    },
    {
      title: "Is food included?",
      content: [
        `Food is not included in the ticket price, but there will be a variety of stalls on-site with affordable options.`,
      ],
    },
    {
      title: "Is parking available?",
      content: [
        `Yes, free parking is available near the venue, but spaces are limited and operate on a first-come, first-served basis.`,
      ],
    },
    {
      title: "Are children allowed?",
      content: [
        `Yes, children are welcome. Kids under the age of 12 can enter for free, but they must be accompanied by an adult.`,
      ],
    },
    {
      title: "Can I get a refund if I can’t attend?",
      content: [
        `Unfortunately, tickets are non-refundable. However, you can transfer your ticket to another person by contacting our support team.`,
      ],
    },
  ];
  useEffect(() => {
    function splitText(selector) {
      document.querySelectorAll(selector).forEach((el) => {
        if (!el.dataset.split) {
          const letters = el.textContent
            .split("")
            .map((char) =>
              char === " " ? `<span>&nbsp;</span>` : `<span>${char}</span>`
            );
          el.innerHTML = letters.join("");
          el.dataset.split = "true"; // prevent re-splitting
        }
      });
    }

    splitText("#faq_section h2");
    const ctx = gsap.context(() => {
      const tl1 = gsap.timeline({
        scrollTrigger: {
          trigger: "#faq_section",
          start: "top 70%",
          end: "top 50%",
        },
      });

      tl1.fromTo(
        "#faq_section h2 span",
        { rotateX: "90deg" },
        {
          duration: 0.8,
          rotateX: "0deg",
          stagger: 0.05,
          ease: "bounce.out",
        }
      );

      setTimeout(() => ScrollTrigger.refresh(), 50);
    });

    return () => ctx.revert(); // clean up on unmount
  }, []);

  return (
    <div id="faq_section">
      <div>
        <h2>Frequently Asked</h2>
        <h2>Questions</h2>
      </div>
      <div id="faq_content">
        <div className="faq_content_left">
          <Image
            fill
            src="/assets/images/about/img2.webp"
            alt="image"
          />
        </div>
        <div className="faq_content_right">
          <ul className="accordion-css__list">
            {accordionData.map((item, i) => (
              <li
                key={i}
                className={`accordion-css__item ${
                  activeIndex === i ? "active" : ""
                }`}
              >
                <div className="accordion-css__bg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    viewBox="0 0 602 1212"
                    fill="none"
                    className="accordion-css__bg-svg"
                  >
                    <path
                      d="M601 1199C601 1205.63 595.627 1211 589 1211H13C6.37257 1211 1 1205.63 1 1199V7.00001C1 3.68631 3.68629 1 7 1H116C118.761 1 121 3.23858 121 6V6C121 8.76142 123.239 11 126 11H595C598.314 11 601 13.6863 601 17V1199Z"
                      fill="#F489A3"
                      stroke="black"
                      strokeWidth="0.125em"
                      vectorEffect="non-scaling-stroke"
                    ></path>
                  </svg>
                </div>

                <div className="accordion-css__item-bottom">
                  <div className="accordion-css__item-bottom-wrap">
                    <div className="accordion-css__item-bottom-content">
                      <div className="accordion-css__card">
                        {item.content.map((para, idx) => (
                          <p key={idx} className="accordion-css__item-p">
                            {para
                              .split(" ")
                              .map((word, wIdx) =>
                                [
                                  "non-profit",
                                  "affordable",
                                  "quality",
                                  "comfort",
                                  "low",
                                  "everyone",
                                  "unable",
                                  "support",
                                ].includes(word.toLowerCase()) ? (
                                  <strong key={wIdx}>{word} </strong>
                                ) : (
                                  word + " "
                                )
                              )}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="accordion-css__item-top"
                  onClick={() => toggleAccordion(i)}
                >
                  <h3 className="accordion-css__item-h3">
                    <strong>{item.title}</strong>
                  </h3>
                  <div className="accordion-css__item-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="100%"
                      viewBox="0 0 18 18"
                      fill="none"
                      className="accordion-css__item-icon-svg"
                    >
                      <path
                        d="M1.05469 9.40723H16.0547"
                        stroke="currentColor"
                        strokeWidth="0.125em"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                      ></path>
                      <path
                        d="M8.55176 1.90723L8.55176 16.9072"
                        stroke="currentColor"
                        strokeWidth="0.125em"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                      ></path>
                    </svg>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FrequentQue;
