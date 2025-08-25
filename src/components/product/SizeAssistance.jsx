import Image from "next/image";
import React, { useEffect, useRef } from "react";

const SizeAssistance = ({ onClose}) => {

  return (
    <div
      className="size-assist-overlay"
      data-lenis-prevent
    >
      <div className="size-assist-guide">
        <div>
          <p>Measurements guide</p>
          <ol>
            <li>
              <span>Chest:</span> Measure around the fullest part of your chest,
              wrapping fully around the body.
            </li>
            <li>
              <span>Waist:</span> Measure around the smallest part of your
              waistline, wrapping fully around the body.
            </li>
            <li>
              <span>Hips:</span> Measure around the widest part of your hips or
              buttocks, wrapping fully around the body.
            </li>
            <li>
              <span>Torso length:</span> Measure from the dip between your
              collarbones down to your hip level.
            </li>
            <li>
              <span>Biceps:</span> Measure around your bicep at the fullest part
              of your upper arm.
            </li>
            <li>
              <span>Shoulder width:</span> Measure from the tip of one shoulder
              bone straight across to the other.
            </li>
            <li>
              <span>Arm length:</span> Measure from the shoulder bone down to
              the wrist where the thumb meets the wrist.
            </li>
            <li>
              <span>Inside Leg Length:</span> Measure from the top of your inner
              thigh down to your ankle.
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
          src="/guide.avif"
          alt="measurement_guide"
        />
      </div>
      <div className="size-assist-popup">
        <div className="size-assist-header">
          <h2>Size Assistance</h2>
          <button className="size-assist-quizBtn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="size-assist-section">
          <h3>Fit</h3>
          <ul>
            <li>Relaxed suede coat with a loose fit.</li>
            <li>True to size. Recommended to take your normal size.</li>
          </ul>
        </div>

        <div className="size-assist-section">
          <h3>Model Measurements</h3>
          <ul>
            <li>Model is 5'11" and is wearing FR 36</li>
          </ul>
        </div>

        <div className="size-assist-section">
          <h3>Size Conversion</h3>
          <div className="size-assist-tableWrapper">
            <table>
              <thead>
                <tr>
                  <th>France</th>
                  <th>34</th>
                  <th>36</th>
                  <th>38</th>
                  <th>40</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>USA</td>
                  <td>0</td>
                  <td>2-4</td>
                  <td>4-6</td>
                  <td>8</td>
                </tr>
                <tr>
                  <td>UK</td>
                  <td>6</td>
                  <td>8</td>
                  <td>10</td>
                  <td>12</td>
                </tr>
                <tr>
                  <td>Italy</td>
                  <td>38</td>
                  <td>40</td>
                  <td>42</td>
                  <td>44</td>
                </tr>
                <tr>
                  <td>Germany</td>
                  <td>32</td>
                  <td>34</td>
                  <td>36</td>
                  <td>38</td>
                </tr>
                <tr>
                  <td>Australia</td>
                  <td>6</td>
                  <td>8</td>
                  <td>10</td>
                  <td>12</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="size-assist-section measure-table">
          <h3>Standard Body Measurements</h3>
          <div className="size-assist-tableWrapper">
            <table>
              <thead>
                <tr>
                  <th>France</th>
                  <th>34</th>
                  <th>36</th>
                  <th>38</th>
                  <th>40</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>USA</td>
                  <td>0</td>
                  <td>2-4</td>
                  <td>4-6</td>
                  <td>8</td>
                </tr>
                <tr>
                  <td>UK</td>
                  <td>6</td>
                  <td>8</td>
                  <td>10</td>
                  <td>12</td>
                </tr>
                <tr>
                  <td>Italy</td>
                  <td>38</td>
                  <td>40</td>
                  <td>42</td>
                  <td>44</td>
                </tr>
                <tr>
                  <td>Germany</td>
                  <td>32</td>
                  <td>34</td>
                  <td>36</td>
                  <td>38</td>
                </tr>
                <tr>
                  <td>Australia</td>
                  <td>6</td>
                  <td>8</td>
                  <td>10</td>
                  <td>12</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeAssistance;
