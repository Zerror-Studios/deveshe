"use client";
import Image from "next/image";
import React from "react";

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

const OrderTable = () => {
  return (
    <>
      {orders.length > 0 ? (
        <div className="table-container">
          <table className="order-table">
            <thead>
              <tr>
                <th>Order Id</th>
                <th>Product</th>
                <th>Order Date</th>
                <th>Price</th>
                <th>Status</th>
                <th>AWB Code</th>
                <th>Track</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index}>
                  <td>{order.id}</td>
                  <td>
                    <div className="product-cell">
                      <Image
                        className="skeleton-loading"
                        width={1000}
                        height={1000}
                        src={order.product.image}
                        alt={order.product.name}
                      />
                      <div>
                        <p className="product-name">{order.product.name}</p>
                        <p>Qty : {order.product.qty}</p>
                        <p>Sku : {order.product.sku}</p>
                        <p>Color: {order.product.color}</p>
                      </div>
                    </div>
                  </td>
                  <td>{order.date}</td>
                  <td>{order.price}</td>
                  <td>
                    <span
                      className={`status ${
                        order.status.toLowerCase() === "paid"
                          ? "paid"
                          : "unpaid"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>{order.awb}</td>
                  <td>{order.track}</td>
                </tr>
              ))}
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
