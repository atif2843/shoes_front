"use client";
import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Card from "./Card";
import { getTopBrands } from "../api/supabaseQueries";

export default function TopFavoriteBrands() {
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
  });
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopBrands = async () => {
      try {
        const data = await getTopBrands();
        setBrands(data);
        if (data.length > 0) {
          setSelectedBrand(data[0].id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopBrands();
  }, []);

  // Filter products by selected brand
  const filteredProducts =
    brands.find((brand) => brand.id === selectedBrand)?.products || [];

  if (loading) {
    return (
      <div className="w-full py-10 px-8">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-10 px-8">
        <div className="text-red-500 text-center">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full py-10 px-8">
      <div className="flex justify-between items-center mb-8 flex-wrap">
        <h2 className="text-2xl font-bold mb-4">Top Favorite Brands</h2>

        {/* Brand Filter Buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {brands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => setSelectedBrand(brand.id)}
              className={`px-3 py-2 rounded-lg transition border-1 border-gray-200 ${
                selectedBrand === brand.id
                  ? "bg-cyan-600 text-white"
                  : "bg-gray-50 hover:bg-gray-200"
              }`}
            >
              {brand.name}
            </button>
          ))}
        </div>
      </div>

      {/* Embla Carousel */}
      <div className="overflow-hidden py-4" ref={emblaRef}>
        <div className="flex gap-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="flex-none w-[300px]">
                <Card 
              key={product.id}
              product={{
                ...product,
                images: product.productImages?.map(img => img.prod_images) || ['/images/placeholder.png'],
                categories: [product.productType, product.brand],
                name: product.name,
                slug: product.slug,
                price: `₹${product.sellPrice.toLocaleString()}`,
                colors: product.color || []
              }}
            />
              </div>
            ))
          ) : (
            <p className="text-gray-500">
              No products available for{" "}
              {brands.find((b) => b.id === selectedBrand)?.name}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
