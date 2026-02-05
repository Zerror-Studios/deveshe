import React, { useState } from "react";
import Image from "next/image";
import { FiMinus, FiPlus } from "react-icons/fi";
import { formatePrice, renderVariants } from "@/utils/Util";

const CartProduct = ({
  item,
  handleAddItem,
  handleRemoveItem,
}) => {
  const [removing, setRemoving] = useState(false);
  const [adding, setAdding] = useState(false);

  const onRemove = async (isCompleteRemove = true) => {
    try {
      setRemoving(true);
      await handleRemoveItem(
        item?.productId || null,
        item?.variantDetail?.variantDetailId || null,
        isCompleteRemove
      );
    } finally {
      setRemoving(false);
    }
  };

  const onAdd = async () => {
    try {
      setAdding(true);
      await handleAddItem(item?.productId || null, item?.variantDetail || {}, item?.categoryId || null);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="cart_product">
      <div className="cart_image skeleton-loading">
        <Image
          width={1000}
          height={1000}
          src={item?.asset?.path || ""}
          alt={item?.asset?.altText || ""}
        />
      </div>
      <div className="cart_product_dets">
        <div className="product_dets">
          <div className="product_dets_top">
            <span>{item?.name || ""}</span>
            {renderVariants(item?.product?.productOptions || [], item?.variantDetail?.selectedOptions || [])}
            <div className="cart_qt">
              <span>Quantity</span>
              <button disabled={removing} onClick={() => onRemove(false)}>
                <FiMinus />
              </button>
              <span>{item.qty}</span>
              <button disabled={adding} onClick={onAdd}>
                <FiPlus />
              </button>
            </div>
          </div>
          <button
            className="remove_cart_btn"
            disabled={removing}
            onClick={() => onRemove(true)}
          >
            {removing ? "Removing..." : "Remove"}
          </button>
        </div>
        <div className="product_price">
          <span>
            {`${item.qty > 1 ? `${item?.qty} x` : ""} ${formatePrice(
              item?.variantDetail?.variantPrice || 0
            )}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartProduct;
