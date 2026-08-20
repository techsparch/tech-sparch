"use client";
import React from "react";
import ShowAllUser from "@/component/dashboard/system/Pagination";

const Systemuser = () => {
  return (
    <div>
      <ShowAllUser
        api={"/api/system/getalluser"}
        apirole={"system"}
        showCodeApi={"/api/system/request-access-code"}
        exportApi={"/api/system/export/"}
        DeActivationApi={"/api/system/deactivate"}
      ></ShowAllUser>
    </div>
  );
};

export default Systemuser;
