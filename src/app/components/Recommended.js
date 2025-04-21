"use client";
import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Card from "./Card";
import Link from "next/link";
import Loader from "@/app/components/Loader";

export default function Recommended({ products = [], currentProductId }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (emblaApi) {
      onSelect();
      emblaApi.on("select", onSelect);
      return () => emblaApi.off("select", onSelect);
    }
  }, [emblaApi, onSelect]);

  // Filter out the current product from recommendations and ensure products have required properties
  const filteredProducts = products
    .filter(product => product && product.id && product.id !== currentProductId)
    .map(product => ({
      id: product.id,
      name: product.name || '',
      slug: product.slug || '',
      price: `₹${product.sellPrice.toLocaleString() || 0}`,
      brand: product.brand || '',
      brandSlug: product.brand?.toLowerCase().replace(/\s+/g, '-') || '',
      categories: [product.brand || ''],
      images: product.productImages?.map(img => img.prod_images) || ['/images/placeholder.png'],
      colors: product.color || [],
      image: product.productImages?.[0]?.prod_images || '/images/placeholder.png',
      sellPrice: product.sellPrice.toLocaleString() || 0,
      originalPrice: product.originalPrice || null,
      description: product.description || '',
      stock: product.stock || 0
    }));

  if (!filteredProducts.length) return null;
  console.log(filteredProducts);
  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recommended</h2>
          </div>
          {filteredProducts[0]?.brandSlug && (
            <Link 
              href={`/brands/${filteredProducts[0].brandSlug}`}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all
            </Link>
          )}
        </div>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">

              {filteredProducts.map((product) => (
            <Link 
            href={`/products/${product.slug}`}
            className="text-sm font-medium "
          >
              <div 
                  key={product.id} 
                  className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4"
                >
                  <Card product={product} />
                </div>
                </Link>
              ))}
           
            </div>
          </div>

          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={scrollPrev}
            disabled={!prevBtnEnabled}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={scrollNext}
            disabled={!nextBtnEnabled}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
