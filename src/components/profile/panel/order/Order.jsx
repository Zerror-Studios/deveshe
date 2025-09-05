import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { useAuthStore } from "@/store/auth-store";
import { ORDER_LIST } from "@/graphql";
import Table from "@/components/profile/panel/order/components/Table";
import Heading from "@/components/profile/panel/order/components/Heading";

const columns = [
  "Order Id",
  "Product",
  "Order Date",
  "Price",
  "Status",
  "AWB Code",
  "Track",
];
const Order = () => {
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
      <Heading totalCount={totalCount} />
      <Table data={data} columns={columns} loading={loading} />
    </>
  );
};

export default Order;
