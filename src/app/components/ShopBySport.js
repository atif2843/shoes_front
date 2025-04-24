"use client";
import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Card from "./Card";
import { getProductsBySports } from "../api/supabaseQueries";
import Link from "next/link";

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-xl font-bold">Sports Collection</h2>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
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
          <Link
            href="/sports"
            className="group flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-800 text-white rounded-md transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <span className="font-medium">View All</span>
            <ArrowRight 
              size={20} 
              className="transform group-hover:translate-x-1 transition-transform duration-300" 
            />
          </Link>
        </div>
      </div>

      {/* Embla Carousel */}
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
