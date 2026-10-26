"use client";
import { formatDateTime, formatePrice } from "@/utils/Util";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FiArrowRight } from "react-icons/fi";
import { getOrderStatusLabel } from "@/utils/order-detail.util";

const OrderTable = ({ data, columns, loading }) => {
  return (
    <>
      {loading ? (
        <div className="no-order-div flex-all">
          <div className="loader-btn" />
        </div>
      ) : data?.length > 0 ? (
        <div className="table-container">
          <table className="order-table">
            <thead>
              <tr>
                {columns?.map((item, index) => {
                  return (
                    <th key={`order-column-${index}`}>
                      {item}
                    </th>
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
                              <p>Sku : {cartItem?.sku || ""}</p>
                            </div>
                          </div>
                        );
                      })}
                    </td>
                    <td>{formatDateTime(item?.createdAt || "")}</td>
                    <td>{formatePrice(item?.orderPrice ?? item?.discountedPrice ?? 0)}</td>
                    <td>
                      {/* PRD-015 FR-18: the server's display status when
                          present, else today's Paid/Unpaid */}
                      <span
                        className={`status ${item.displayStatus
                          ? "order_status"
                          : item.paymentStatus === "PAID"
                            ? "paid"
                            : "unpaid"
                          }`}
                      >
                        {getOrderStatusLabel(
                          item?.displayStatus,
                          item?.paymentStatus === "PAID" ? "Paid" : "Unpaid",
                        )}
                      </span>
                    </td>
                    <td>
                      {/* PRD-015 FR-20: tracking, cancel and returns live on
                          the order page (no hard-coded tracking link) */}
                      <Link
                        id="common_black_btn"
                        href={`/profile/orders/${item?._id}`}
                        className="track-btn"
                        aria-label={`View order ${item?.orderNo || ""}`}
                      >
                        View
                        <FiArrowRight aria-hidden="true" />
                      </Link>
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
