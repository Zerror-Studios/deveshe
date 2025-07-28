import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { USER_ADDRESS_LIST } from "@/graphql";
import AddressList from "@/components/profile/panel/address/components/AddressList";
import AddressModal from "@/components/profile/panel/address/components/AddressModal";
import { useAuthStore } from "@/store/AuthStore";
import { Sort } from "@/utils/Constant";

const Address = () => {
  const LIMIT = 10;
  const [open, setOpen] = useState(false);
  const [addressId, setAddressId] = useState(null);
  const [offset, setOffset] = useState(0);
  const {
    user: { _id },
  } = useAuthStore();

  const payload = {
    filter: { userId: _id },
    limit: LIMIT,
    offset,
    sort: { createdAt: Sort.DESC, primary: Sort.ASC },
  };
  const {
    data: addressResponse,
    loading,
    refetch,
  } = useQuery(USER_ADDRESS_LIST, {
    variables: payload,
  });
  const { data, totalCount } = addressResponse?.getAddressByFilters || {};
  return (
    <>
      <AddressList
        data={data}
        totalCount={totalCount}
        loading={loading}
        setOpen={setOpen}
        setAddressId={setAddressId}
      />
      {open && (
        <AddressModal
          open={open}
          addressId={addressId}
          listPayload={payload}
          setOpen={setOpen}
          refetch={refetch}
        />
      )}
    </>
  );
};

export default Address;
