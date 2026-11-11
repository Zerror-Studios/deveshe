"use client";

/**
 * /material-index: the fabrics the brand works with (live site design,
 * main 2026-05). The list is static content (`data/materials.js`).
 */

import React from "react";
import MaterialListing from "@/components/material-index/MaterialListing";

const MaterialIndexView = ({ materials = [] }) => (
  <MaterialListing materials={materials} />
);

export default MaterialIndexView;
