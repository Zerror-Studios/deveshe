import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { useAuthStore } from "@/store/auth-store";
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
  const {
    user: { _id },
  } = useAuthStore((state) => state);

  const payload = {
    filter: { userId: _id },
    limit: LIMIT,
    offset,
  };
  const { data: response, loading } = useQuery(ORDER_LIST, {
    variables: payload,
  });
  const { data = [], totalCount = 0 } = response?.getOrdersByFilters || {};
  return (
    <>
      <OrderHeader totalCount={totalCount} />
      <OrderTable data={data} columns={columns} loading={loading} />
    </>
  )
}

export default OrderBlock