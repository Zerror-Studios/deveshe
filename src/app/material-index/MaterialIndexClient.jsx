import MaterialListing from "@/components/material-index/MaterialListing";

export default function MaterialIndexClient({ materials }) {
  return (
    <>
      <MaterialListing materials={materials} />
    </>
  );
}
