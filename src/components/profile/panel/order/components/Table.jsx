import React from "react";
import Link from "next/link";
import { FaSort } from "react-icons/fa6";
import { formatDateTime, formatePrice, renderVariants } from "@/utils/Util";
import styles from "@/components/profile/panel/order/components/Table.module.css";

const Table = ({ data = [], columns = [], loading }) => {
  if (loading) return;
  return (
    <>
      <div
        className="order-div"
        style={{ marginInline: "-2vw", marginTop: "30px" }}
      >
        <div className="my-2 line-order"></div>
        {data && data.length > 0 ? (
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {columns?.map((item, index) => {
                    return (
                      <>
                        <th key={`order-column-${index}`}>
                          <span role="button">
                            {item} <FaSort className={styles.sortIcon} />
                          </span>
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
                      <td>
                        <div>
                          <p className="orderid1">{item.orderNo}</p>
                        </div>
                      </td>
                      <td>
                        {cart?.map((cartItem, cartIndex) => {
                          return (
                            <div
                              className={styles.featureBox}
                              key={`order-product-${cartIndex}`}
                            >
                              <div className={styles.tableImg}>
                                <img
                                  src={cartItem?.asset?.path || ""}
                                  fill
                                  alt={cartItem?.asset?.altText || ""}
                                />
                              </div>
                              <div className={styles.tableContent}>
                                <label className={styles.tableTitle}>
                                  {cartItem?.name || ""}
                                </label>
                                <span className={styles.tableCollections}>
                                  {`Qty :${cartItem?.qty || ""}`}
                                </span>
                                <span className={styles.tableCollections}>
                                  {`Sku :${cartItem?.variantDetail?.sku || ""}`}
                                </span>
                                <span className={styles.tableCollections}>
                                  {renderVariants(
                                    cartItem?.variantDetail?.selectedOptions ||
                                      []
                                  )}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </td>
                      <td>{formatDateTime(item?.createdAt || "")}</td>
                      <td>{formatePrice(item?.discountedPrice || 0)}</td>
                      <td>
                        <span
                          className={`${
                            item.paymentStatus == "PAID"
                              ? styles.activeStatus
                              : styles.inactiveStatus
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
                            style={{maxWidth: "unset", padding: "5px 12px", fontSize: "12px"}}
                          >
                            Track
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
          <div className="no-order-div">
            <div>
              <p className="no-order-p">There is no order history to show</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Table;
