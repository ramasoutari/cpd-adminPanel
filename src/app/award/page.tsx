"use client";

import React from "react";
import { RatingCriteriaProvider } from "../../context/RatingCriteriaContext";
import AdminLayout from "../../sections/adminLayout";
import TemporaryComponent from "@/sections/create-new-award/temporary-component";

const AwardPage = () => {
  return (
    <AdminLayout>
      <RatingCriteriaProvider>
        <TemporaryComponent />
      </RatingCriteriaProvider>
    </AdminLayout>
  );
};

export default AwardPage;
