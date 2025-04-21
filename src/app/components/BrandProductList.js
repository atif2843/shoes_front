"use client";
import { useState, useEffect } from "react";
import Card from "./Card";

export default function BrandProductList({
  brandslug,
  filteredProducts,
  brandDetails,
}) {
  const [sortOption, setSortOption] = useState("featured");
  const [sortedProducts, setSortedProducts] = useState([]);

  useEffect(() => {
    if (!filteredProducts || !Array.isArray(filteredProducts)) {
      setSortedProducts([]);
      return;
    }

    let sortedArray = [...filteredProducts];

    if (sortOption === "price-low-high") {
      sortedArray.sort((a, b) => {
        const priceA = parseFloat(a.sellPrice || a.price || 0);
        const priceB = parseFloat(b.sellPrice || b.price || 0);
        return priceA - priceB;
      });
    } else if (sortOption === "price-high-low") {
      sortedArray.sort((a, b) => {
        const priceA = parseFloat(a.sellPrice || a.price || 0);
        const priceB = parseFloat(b.sellPrice || b.price || 0);
        return priceB - priceA;
      });
    } else if (sortOption === "new-arrivals") {
      sortedArray.sort((a, b) => {
        const dateA = new Date(a.releaseDate || a.created_at || 0);
        const dateB = new Date(b.releaseDate || b.created_at || 0);
        return dateB - dateA;
      });
    }

    setSortedProducts(sortedArray);
  }, [sortOption, filteredProducts]);

  return (
    <div className="container mx-auto py-25">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 flex items-center space-x-2 mb-4">
        <span>Home</span> <span className="text-gray-400">/</span>
        <span>Brands</span> <span className="text-gray-400">/</span>
        <span className="text-black font-medium capitalize">{brandslug}</span>
      </div>

      {/* Brand Image */}
      {brandDetails ? (
        <div className="relative">
          <div className="min-h-5 h-50 overflow-hidden flex items-center justify-center w-full">
            <img
              src={brandDetails.bg_image}
              alt={`${brandslug} background`}
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-15 left-10">
            <img
              src={brandDetails.images}
              alt={`${brandslug} logo`}
              className="h-32 w-32 rounded-full aspect-auto"
            />
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">Brand details not found.</p>
      )}

      <div className="mb-6 flex justify-end mt-12 px-8">
        {/* Title */}
        {/*<h1 className="text-3xl font-bold text-center mb-6 capitalize mt-18">
          {brandslug} Products
        </h1>*/}
        <select
          className="p-2 border rounded-md text-gray-700"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="featured">Featured</option>
          <option value="price-low-high">Price: Low to High</option>
          <option value="price-high-low">Price: High to Low</option>
          <option value="new-arrivals">New Arrivals</option>
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-8">
        {sortedProducts && sortedProducts.length > 0 ? (
          sortedProducts.map((product) => (
            <Card 
              key={product.id} 
              product={{
                ...product,
                image: product.productImages?.[0]?.prod_images || '/images/placeholder.png',
                categories: [brandDetails?.name],
                name: product.name,
                price: `₹${product.sellPrice || product.price}`,
                colors: product.color || []
              }} 
            />
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">No products found for {brandslug}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
