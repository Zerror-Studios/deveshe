import React from "react";
import Image from "next/image";
import { RxCross2 } from "react-icons/rx";

const ProductModalPreview = ({
  isOpen = false,
  data = {},
  setOpen,
  setSelectedAsset,
}) => {
  const handleReset = () => {
    setOpen(false);
    setSelectedAsset({});
  };
  if (!isOpen && Object.keys(data).length === 0) return;
  return (
    <div className="ReactModalPortal_img_cntr" data-lenis-prevent onClick={handleReset}>
      <div className="ReactModalPortal_img_cntr_overlay">
        <div className="ReactModalPortal_img_cntr_cursor">
          <div className="ReactModalPortal_img_cross">
            <RxCross2 />
          </div>
          <div className="ReactModalPortal_img_cntr_grid">
            <div className="ReactModalPortal_img_cntr_grid_cover">
              <div className="ReactModalPortal_img_loader"></div>
              <Image src={data?.path || ""} alt={data?.altText || ""} fill objectFit="contain"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModalPreview;
