import Image from "next/image";
import React from "react";

const PolaroidCard = ({image, content }) => {
  return (
    <div className="polaroid_card">
      <div className={`polaroid_img`}>
        <Image
          width={1938}
          height={2908}
          sizes="(max-width: 576px) 38vw, (max-width: 768px) 35vw, 20vw"
          src={image}
          alt="image"
        />
      </div>
      {content}
    </div>
  );
};

export default PolaroidCard;
