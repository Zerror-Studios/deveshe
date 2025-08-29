import Image from "next/image";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const SizeAssistance = ({ onClose }) => {
  const overlayRef = useRef(null);
  const wrapRef = useRef(null);
useEffect(() => {
  const tl = gsap.timeline();

  // First overlay fades in, then wrap slides in
  tl.to(overlayRef.current, {
    opacity: 1,
    duration: 0.5,
    ease: "power2.out"
  })
  .fromTo(
    wrapRef.current,
    { y: "-100%", opacity: 0 },
    {
      y: "0%",
      opacity: 1,
      duration: 0.8,
      ease: "power4.out"
    },
    "-=0.2" // start slightly before overlay finishes
  );
}, []);

const handleCloseClick = () => {
  const tl = gsap.timeline({
    onComplete: onClose, // call onClose after everything finishes
  });

  // First wrap slides out, then overlay fades
  tl.to(wrapRef.current, {
    y: "-100%",
    opacity: 0,
    duration: 0.7,
    ease: "power4.inOut"
  })
  .to(
    overlayRef.current,
    {
      opacity: 0,
      duration: 0.5,
      ease: "power2.in"
    },
    "-=0.2" // overlap slightly for fluid effect
  );
};

  return (
    <div className="size-assist-overlay" data-lenis-prevent ref={overlayRef}>
      <div className="size-assist_wrap" ref={wrapRef}>
        <div className="size-assist-guide">
          <div>
            <p>Measurements guide</p>
            <ol>
              <li>
                <span>Chest:</span> Measure around the fullest part of your
                chest, wrapping fully around the body.
              </li>
              <li>
                <span>Waist:</span> Measure around the smallest part of your
                waistline, wrapping fully around the body.
              </li>
              <li>
                <span>Hips:</span> Measure around the widest part of your hips
                or buttocks, wrapping fully around the body.
              </li>
              <li>
                <span>Torso length:</span> Measure from the dip between your
                collarbones down to your hip level.
              </li>
              <li>
                <span>Biceps:</span> Measure around your bicep at the fullest
                part of your upper arm.
              </li>
              <li>
                <span>Shoulder width:</span> Measure from the tip of one
                shoulder bone straight across to the other.
              </li>
              <li>
                <span>Arm length:</span> Measure from the shoulder bone down to
                the wrist where the thumb meets the wrist.
              </li>
              <li>
                <span>Inside Leg Length:</span> Measure from the top of your
                inner thigh down to your ankle.
              </li>
              <li>
                <span>Outside Leg Length:</span> Measure from your waist down to
                your ankle.
              </li>
            </ol>
          </div>
          <Image
            width={1000}
            height={1000}
            src="/size-chart.png"
            alt="measurement_guide"
          />
        </div>

        <div className="size-assist-popup">
          <div className="size-assist-header">
            <h2>Size Assistance</h2>
            <button className="size-assist-quizBtn" onClick={handleCloseClick}>
              Close
            </button>
          </div>

          <div className="size-assist-section">
            <p className="size-heading">Fit</p>
            <ul>
              <li>Relaxed suede coat with a loose fit.</li>
              <li>True to size. Recommended to take your normal size.</li>
            </ul>
          </div>

          <div className="size-assist-section">
            <p className="size-heading">Model Measurements</p>
            <ul>
              <li>Model is 5'11" and is wearing FR 36</li>
            </ul>
          </div>

          <div className="size-assist-section">
            <p className="size-heading">
              Standard Women's Size Chart (approx, India/US/UK)
            </p>
            <div className="size-assist-tableWrapper">
              <table>
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Bust(in)</th>
                    <th>Waist(in)</th>
                    <th>Hip(in)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>XS</td>
                    <td>32-33</td>
                    <td>24-25</td>
                    <td>34-35</td>
                  </tr>
                  <tr>
                    <td>S</td>
                    <td>34-35</td>
                    <td>26-27</td>
                    <td>36-37</td>
                  </tr>
                  <tr>
                    <td>M</td>
                    <td>36-37</td>
                    <td>28-29</td>
                    <td>38-39</td>
                  </tr>
                  <tr>
                    <td>L</td>
                    <td>38-40</td>
                    <td>30-32</td>
                    <td>40-42</td>
                  </tr>
                  <tr>
                    <td>XL</td>
                    <td>41-43</td>
                    <td>33-34</td>
                    <td>43-45</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="size-assist-section measure-table">
            <p className="size-heading">
              Standard Women's Size Chart (with Rise + Inseam added for context)
            </p>
            <p>
              <em>
                (Typical ready-to-wear ranges, India/US — may vary by brand)
              </em>
            </p>
            <div className="size-assist-tableWrapper">
              <table>
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Waist(in)</th>
                    <th>Hip(in)</th>
                    <th>Front rise(in)</th>
                    <th>Back rise(in)</th>
                    <th>Inseam(shorts)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>XS</td>
                    <td>24-25</td>
                    <td>34-35</td>
                    <td>10-11</td>
                    <td>13-14</td>
                    <td>2-3</td>
                  </tr>
                  <tr>
                    <td>S</td>
                    <td>26-27</td>
                    <td>36-37</td>
                    <td>11-12</td>
                    <td>14-15</td>
                    <td>3-5</td>
                  </tr>
                  <tr>
                    <td>M</td>
                    <td>28-29</td>
                    <td>38-39</td>
                    <td>11.5-12.5</td>
                    <td>14.5-15.5</td>
                    <td>4-6</td>
                  </tr>
                  <tr>
                    <td>L</td>
                    <td>30-32</td>
                    <td>40-42</td>
                    <td>12-13</td>
                    <td>15-16</td>
                    <td>5-7</td>
                  </tr>
                  <tr>
                    <td>XL</td>
                    <td>33-34</td>
                    <td>43-45</td>
                    <td>12.5-13.5</td>
                    <td>15.5-16.5</td>
                    <td>6-8</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeAssistance;
