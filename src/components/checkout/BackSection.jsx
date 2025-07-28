import { useRouter } from "next/router";
import React from "react";
import { IoIosArrowRoundBack } from "react-icons/io";

const BackSection = () => {
  const router = useRouter();
  return (
    <div
      className="_btn_wrapper _btn_height _w-full back bg-white"
      onClick={() => {
        router.back();
      }}
    >
      <IoIosArrowRoundBack style={{ fontSize: "2rem" }} />
      <p>Back</p>
    </div>
  );
};

export default BackSection;
