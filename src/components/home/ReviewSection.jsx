import Image from "next/image";
import React from "react";

const ReviewSection = () => {
  return (
    <div id="review_section">
      {[0, 1, 2, 3, 4].map((_, i) => (
        <div key={i} className="review_slide">
          {i === 0 && (
            <h2 className="review_title">
              Happy <span>customers</span>
            </h2>
          )}

          <div className="review_card">
            <div className="tweet-card" role="article" aria-label="Tweet card">
              {/* Header */}
              <div className="tweet-header">
                <Image
                  width={1000}
                  height={1000}
                  className="avatar"
                  src="/assets/images/home/home_banner.webp"
                  alt="Cassie Evans"
                />
                <div className="author">
                  <div className="name">Cassie Evans</div>
                  <div className="handle">@cassiecods</div>
                </div>

                <div className="bird" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="28" height="28">
                    <path d="M23 4.8c-.8.4-1.7.6-2.6.8.9-.6 1.6-1.4 2-2.5-.9.5-1.9.9-3 .1-1-1-2.7-1-3.7 0-1 .9-1.3 2.3-.8 3.5-3.4-.2-6.6-1.8-8.7-4.5-1.1 2-.6 4.6 1.3 6-.7 0-1.4-.2-2-.5v.1c0 2.2 1.6 4.1 3.8 4.6-.7.2-1.4.2-2.1.1.6 1.9 2.3 3.2 4.3 3.2-1.6 1.3-3.7 2.1-5.9 2.1H2c2.1 1.4 4.6 2.1 7.1 2.1 8.5 0 13.2-7.1 13.2-13.2v-.6c.9-.6 1.6-1.4 2.2-2.3z" />
                  </svg>
                </div>
              </div>

              {/* Body */}
              <p className="tweet-body">
                Not exaggerating when I say Flowfest was my web event of the
                year. I go to a lot of conferences but the vibes at this little
                web-nerd fest were immaculate.
              </p>

              {/* Footer */}
              <div className="tweet-footer">
                <span>1:21 PM</span>
                <span>·</span>
                <span>Jul 12, 2024</span>
                <span>·</span>
                <a href="#" className="tag">
                  FlowFest Love
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewSection;
