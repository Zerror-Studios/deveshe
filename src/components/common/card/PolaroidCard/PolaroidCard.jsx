import Image from "next/image";
import React from "react";

const PolaroidCard = ({image, content }) => {
  return (
    <div className="polaroid_card">
      <div className={`polaroid_img`}>
        <Image width={1000} height={1000} src={image} alt="image"/>
      </div>
      {content}
    </div>
  );
};

export default PolaroidCard;
