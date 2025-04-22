import React from "react";
import Footer from "../components/Footer";
import AllProducts from "../components/Allproduct";

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <AllProducts />
      <Footer />
    </div>
  );
}
