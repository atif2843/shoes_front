"use client";
import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Card from "./Card";
import { getProductsBySports } from "../api/supabaseQueries";

export default function ShopBySport() {
  const [emblaRef, embla] = useEmblaCarousel({ loop: false });
  const [isPrevDisabled, setPrevDisabled] = useState(true);
  const [isNextDisabled, setNextDisabled] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSportsProducts = async () => {
      try {
        const data = await getProductsBySports();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSportsProducts();
  }, []);

  // Function to check if previous/next buttons should be disabled
  const updateButtons = useCallback(() => {
    if (!embla) return;
    setPrevDisabled(!embla.canScrollPrev());
    setNextDisabled(!embla.canScrollNext());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    updateButtons();
    embla.on("select", updateButtons);
    embla.on("reInit", updateButtons);
  }, [embla, updateButtons]);

  if (loading) {
    return (
      <div className="relative w-full pt-10 px-8">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full pt-10 px-8">
        <div className="text-red-500 text-center">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="relative w-full pt-10 px-8 bg-white py-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Sports Collection</h2>
        <div className="flex items-center gap-4">
          <a
            href="/sports"
            className="text-blue-600 hover:underline flex items-center"
          >
            Show More <ChevronRight size={20} className="ml-2" />
          </a>
          <button
            className={`p-2 rounded-md ${
              isPrevDisabled
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-cyan-600 hover:bg-cyan-800 text-white"
            }`}
            onClick={() => embla && embla.scrollPrev()}
            disabled={isPrevDisabled}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className={`p-2 rounded-md ${
              isNextDisabled
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-cyan-600 hover:bg-cyan-800 text-white"
            }`}
            onClick={() => embla && embla.scrollNext()}
            disabled={isNextDisabled}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden py-4" ref={emblaRef}>
        <div className="flex gap-4">
          {products.map((product) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}
