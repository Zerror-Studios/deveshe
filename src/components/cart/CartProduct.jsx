import React from "react";
import Image from "next/image";
import { FiMinus, FiPlus } from "react-icons/fi";
import { formatePrice } from "@/utils/Util";

const CartProduct = ({
  item,
  renderVariants,
  handleAddItem,
  handleRemoveItem,
  itemAddLoader,
  itemRemoveLoader,
}) => {
  return (
    <div className="cart_product">
      <div className="cart_image">
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
            <span>
              {renderVariants(item?.variantDetail?.selectedOptions || [])}
            </span>
            <div className="cart_qt">
              <span>Quantity</span>
              <button
                disabled={itemRemoveLoader}
                onClick={() =>
                  handleRemoveItem(
                    item?.productId || null,
                    item?.variantDetail?.variantDetailId || null,
                    false
                  )
                }
              >
                <FiMinus />
              </button>
              <span>{item.qty}</span>
              <button
                disabled={itemAddLoader}
                onClick={() =>
                  handleAddItem(
                    item?.productId || null,
                    item?.variantDetail || {}
                  )
                }
              >
                <FiPlus />
              </button>
            </div>
          </div>
          <button
          className="remove_cart_btn"
            disabled={itemRemoveLoader}
            onClick={() =>
              handleRemoveItem(
                item?.productId || null,
                item?.variantDetail?.variantDetailId || null
              )
            }
          >
            {itemRemoveLoader ? "Removing..." : "Remove"}
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
