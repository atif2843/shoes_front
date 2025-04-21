"use client";
import { useState, useEffect } from "react";
import { getBrandsAll } from "@/app/api/supabaseQueries";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [lastBrandId, setLastBrandId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const loadBrands = async (loadMore = false) => {
    try {
      setLoading(true);
      const { brands: newBrands, lastBrandId: newLastId, hasMore: more } = 
        await getBrandsAll(loadMore ? lastBrandId : null);
      
      if (loadMore) {
        setBrands(prev => [...prev, ...newBrands]);
      } else {
        setBrands(newBrands);
      }
      
      setLastBrandId(newLastId);
      setHasMore(more);
    } catch (err) {
      console.error("Error loading brands:", err);
      setError("Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleLoadMore = async () => {
    if (lastBrandId) {
      await loadBrands(true);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Brands</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {brands.map((brand) => (
          <Link 
            key={brand.id} 
            href={`/brands/${brand.slug}`}
            className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
          >
            <Image
              src={brand.images || '/images/placeholder.png'}
              alt={brand.name}
              width={120}
              height={120}
              className="object-contain mb-2"
            />
            <span className="text-sm font-medium text-gray-700">{brand.name}</span>
          </Link>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center my-8">
          <Loader className="w-8 h-8 animate-spin" />
        </div>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center my-8">
          <Button 
            onClick={handleLoadMore}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            Load More
          </Button>
        </div>
      )}

      {!hasMore && brands.length > 0 && (
        <div className="text-center text-gray-500 my-8">
          No more brands to load
        </div>
      )}

      {!loading && brands.length === 0 && (
        <div className="text-center text-gray-500 my-8">
          No brands found
        </div>
      )}
    </div>
  );
}
