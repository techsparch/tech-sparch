"use client"
import React from "react";
import ShowAllUser from "@/component/dashboard/system/Pagination";

const Systemuser = () => {
  return (
    <div>
      <ShowAllUser api={"/api/system/getalluser"}></ShowAllUser>
    </div>
  );
};

export default Systemuser;
