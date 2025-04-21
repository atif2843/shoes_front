import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AllProducts from "../components/Allproduct";

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <AllProducts />
      <Footer />
    </div>
  );
}
