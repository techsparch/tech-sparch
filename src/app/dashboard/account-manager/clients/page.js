"use client";
import React from "react";
import ShowAllUser from "@/component/dashboard/system/Pagination";

const Systemuser = () => {
  return (
    <div>
      <ShowAllUser
        api={"/api/account-manager/getuser"}
        apirole={"account-manager"}
      ></ShowAllUser>
    </div>
  );
};

export default Systemuser;
