"use client";
import { formatDateTime, formatePrice, renderVariants } from "@/utils/Util";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FiArrowRight } from "react-icons/fi";

const orders = [
  {
    id: "000052",
    product: {
      name: "The Boardroom Babe",
      qty: 1,
      sku: "Bl04XS",
      color: "XS",
      image: "/assets/images/about/img1.webp",
    },
    date: "Friday, 05 September, 25",
    price: "₹4,000",
    status: "Unpaid",
    awb: "NA",
    track: "NA",
  },
  {
    id: "000053",
    product: {
      name: "The Boardroom Babe",
      qty: 1,
      sku: "Bl04XS",
      color: "XS",
      image: "/assets/images/about/img1.webp",
    },
    date: "Friday, 05 September, 25",
    price: "₹4,000",
    status: "Paid",
    awb: "NA",
    track: "NA",
  },
];

const OrderTable = ({ data, columns, loading }) => {
  return (
    <>
      {orders.length > 0 ? (
        <div className="table-container">
          <table className="order-table">
            <thead>
              <tr>
                {columns?.map((item, index) => {
                  return (
                    <>
                      <th key={`order-column-${index}`}>
                        {item}
                      </th>
                    </>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                const cart =
                  item?.cart && item?.cart?.length > 0 ? item?.cart : [];
                return (
                  <tr key={`order-row-${index}`}>
                    <td>{item.orderNo}</td>
                    <td>
                      {cart?.map((cartItem, cartIndex) => {
                        return (
                          <div className="product-cell" key={`order-product-${cartIndex}`}>
                            <Image
                              className="skeleton-loading"
                              width={1000}
                              height={1000}
                              src={cartItem?.asset?.path || ""}
                              alt={cartItem?.asset?.altText || ""}
                            />
                            <div>
                              <p className="product-name">{cartItem?.name || ""}</p>
                              <p>Qty : {cartItem?.qty || ""}</p>
                              <p>Sku : {cartItem?.variantDetail?.sku || ""}</p>
                              <p>
                                {renderVariants(cartItem?.product?.productOptions || [], cartItem?.variantDetail?.selectedOptions || [])}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </td>
                    <td>{formatDateTime(item?.createdAt || "")}</td>
                    <td>{formatePrice(item?.discountedPrice || 0)}</td>
                    <td>
                      <span
                        className={`status ${item.paymentStatus === "PAID"
                          ? "paid"
                          : "unpaid"
                          }`}
                      >
                        {item && item.paymentStatus === "PAID"
                          ? "Paid"
                          : "Unpaid"}
                      </span>
                    </td>
                    <td>{item?.awb_code || "NA"}</td>
                    <td>
                      {item?.awb_code ? (
                        <Link
                          id="common_black_btn"
                          href={`https://shiprocket.co/tracking/${item?.awb_code}`}
                          target="_blank"
                          className="track-btn"
                        >
                          Track
                          <FiArrowRight />
                        </Link>
                      ) : (
                        "NA"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-data">There is no order history to show</p>
      )}
    </>
  );
};

export default OrderTable;
