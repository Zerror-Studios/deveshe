import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import Image from "next/image";
import React, { Fragment, useEffect, useState } from "react";
gsap.registerPlugin(ScrollTrigger);
const FrequentQue = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index); // collapse if same is clicked
  };
  const accordionData = [
    {
      title: `Are your collections sustainable/ethical?`,
      content: [
        <p className="accordion-css__item-p">
          Yes. All our fabrics and labour are sourced ethically, and we work
          with a small team that truly cares about what they create. We release
          capsule collections and make them only to order—no endless stock, no
          excess waste. Our pieces are designed to be kept, cherished, and lived
          in for years.
        </p>,
      ],
    },
    {
      title: `How do I know my size?`,
      content: [
        <p className="accordion-css__item-p">
          You can check our size guide for all the details, or just reach
          out—we’re happy to help. Email us at{" "}
          <strong>deveshedreams@gmail.com</strong> or slide into our DMs at{" "}
          <strong>@DeVeSheDreams</strong> and we’ll guide you to your perfect
          fit.
        </p>,
      ],
    },
    {
      title: `When will my order arrive, and can I track it?`,
      content: [
        <p className="accordion-css__item-p">
          Each piece is made to order and takes about 2–3 weeks to craft and
          ship. Once it’s on the way, you’ll receive a tracking link to follow
          your order right to your doorstep.
        </p>,
      ],
    },
    {
      title: `What payment methods do you accept?`,
      content: [
        <p className="accordion-css__item-p">
          We accept bank transfers, credit and debit cards, and UPI
          payments—choose whatever feels easiest for you. Your payment details
          are processed safely and never shared.
        </p>,
      ],
    },
    {
      title: `What is your return/exchange policy?`,
      content: [
        <p className="accordion-css__item-p">
          We don’t accept returns, but if you receive the wrong piece or a
          damaged product, we’ll happily exchange it for you. If you’ve received
          an incorrect or damaged piece, just email us at{" "}
          <strong>deveshedreams@gmail.com</strong> and we’ll help you process
          your exchange right away.
        </p>,
      ],
    },
    {
      title: `Do you ship internationally?`,
      content: [
        <p className="accordion-css__item-p">
          Not just yet. We currently ship only within India. But stay tuned,
          we’re working on it.
        </p>,
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
          <Image fill src="/assets/images/about/img2.webp" alt="image" />
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
                          <Fragment key={idx}>{para}</Fragment>
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
