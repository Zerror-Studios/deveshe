import React, { useState } from "react";
import { toast } from "react-toastify";
import { useMutation, useQuery } from "@apollo/client/react";
import { DELETE_ADDRESS, USER_ADDRESS_LIST } from "@/graphql";
import AddressHeader from "./AddressHeader";
import AddressContainer from "./AddressContainer";
import AddressPopup from "./AddressPopup";
import { getErrorMessage } from "@/utils/api-error.util";

const AddressBlocks = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editAddress, setEditAddress] = useState(null);

  const {
    data: addressResponse,
    loading,
    refetch,
  } = useQuery(USER_ADDRESS_LIST, {
    fetchPolicy: "network-only",
  });
  const [deleteAddress] = useMutation(DELETE_ADDRESS);
  const data = addressResponse?.getAddresses || [];

  const openPopup = (address = null) => {
    setEditAddress(address);
    setIsOpen(true);
  };

  const handleDelete = async (address) => {
    try {
      await deleteAddress({ variables: { addressId: address._id } });
      toast.success("Address removed");
      await refetch();
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to remove address"));
    }
  };

  return (
    <>
      <AddressHeader setIsOpen={() => openPopup(null)} />
      <AddressContainer
        data={data}
        totalCount={data.length}
        loading={loading}
        onEdit={openPopup}
        onDelete={handleDelete}
      />
      <AddressPopup
        isOpen={isOpen}
        address={editAddress}
        setOpen={setIsOpen}
        refetch={refetch}
      />
    </>
  );
};

export default AddressBlocks;
