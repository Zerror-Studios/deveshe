import React, { useState } from "react";
import Image from "next/image";
import { FiMinus, FiPlus } from "react-icons/fi";
import { formatePrice } from "@/utils/Util";
import { SOLD_OUT_LABEL, getCartLineStock } from "@/utils/stock-signal.util";

const CartProduct = ({
  item,
  handleAddItem,
  handleRemoveItem,
  freshStock,
}) => {
  // PRD-020 FR-13: "Sold out" (with Remove) or "Only N left" (opt-in count).
  const { soldOut, onlyLeft } = getCartLineStock(item, freshStock);
  const [removing, setRemoving] = useState(false);
  const [adding, setAdding] = useState(false);

  const onRemove = async (isCompleteRemove = true) => {
    try {
      setRemoving(true);
      await handleRemoveItem(
        item?.productId || null,
        item?.variantId || null,
        isCompleteRemove
      );
    } finally {
      setRemoving(false);
    }
  };

  const onAdd = async () => {
    try {
      setAdding(true);
      await handleAddItem(item?.productId || null, item?.variantId || null);
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
            {soldOut && <span className="cart_stock_note">{SOLD_OUT_LABEL}</span>}
            {!soldOut && onlyLeft && (
              <span className="cart_stock_note">{`Only ${onlyLeft} left`}</span>
            )}
            <div className="cart_qt">
              <span>Quantity</span>
              <button disabled={removing} onClick={() => onRemove(false)}>
                <FiMinus />
              </button>
              <span>{item.qty}</span>
              <button disabled={adding || soldOut} onClick={onAdd}>
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
              item?.price || 0
            )}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartProduct;
