import React, { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { USER_ADDRESS_LIST } from "@/graphql";
import AddressHeader from "./AddressHeader";
import AddressContainer from "./AddressContainer";
import AddressPopup from "./AddressPopup";
import { useAuthStore } from "@/store/auth-store";
import { Sort } from "@/utils/Constant";

const AddressBlocks = () => {
  const LIMIT = 10;
  const [isOpen, setIsOpen] = useState(false);
  const [addressId, setAddressId] = useState(null);
  const [offset, setOffset] = useState(0);
  const { user } = useAuthStore();

  const payload = {
    filters: { userId: user?._id },
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
      <AddressHeader setIsOpen={setIsOpen} />
      <AddressContainer data={data} totalCount={totalCount} loading={loading} setAddressId={setAddressId} />
      <AddressPopup
        isOpen={isOpen}
        addressId={addressId}
        listPayload={payload}
        setOpen={setIsOpen}
        refetch={refetch}
      />
    </>
  );
};

export default AddressBlocks;
