import React, { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { ORDER_LIST } from "@/graphql";
import OrderHeader from './OrderHeader'
import OrderTable from './OrderTable'

const columns = [
  "Order Id",
  "Product",
  "Order Date",
  "Price",
  "Status",
  "AWB Code",
  "Track",
];

const OrderBlock = () => {
  const LIMIT = 100;
  const [offset, setOffset] = useState(0);

  // Customer-scoped: the server reads the customer from the token.
  const payload = {
    limit: LIMIT,
    offset,
  };
  const { data: response, loading } = useQuery(ORDER_LIST, {
    variables: payload,
    fetchPolicy: "network-only",
  });
  const { orders: data = [], totalCount = 0 } = response?.myOrders || {};
  return (
    <>
      <OrderHeader totalCount={totalCount} />
      <OrderTable data={data} columns={columns} loading={loading} />
    </>
  )
}

export default OrderBlock