"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import Card from "./Card";
import { supabase } from "@/lib/supabaseClient";

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("Searching for:", query);
        
        const { data, error } = await supabase
          .from("products")
          .select(`
            *,
            productImages (
              prod_images
            )
          `)
          .ilike("name", `%${query}%`)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Search results:", data);
        
        if (!data || data.length === 0) {
          console.log("No products found for query:", query);
        } else {
          console.log(`Found ${data.length} products for query:`, query);
        }

        setProducts(data || []);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError("Failed to load search results. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Search Results for &quot;{query}&quot;
        </h1>
        <p className="text-gray-600">
          {isLoading 
            ? "Loading results..." 
            : products.length > 0 
              ? `Found ${products.length} products matching your search` 
              : "No products found matching your search"}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card 
              key={product.id}
              product={{
                ...product,
                images: product.productImages?.map(img => img.prod_images) || ['/images/placeholder.png'],
                categories: [product.productType, product.brand],
                name: product.name,
                slug: product.slug,
                price: `₹${product.sellPrice?.toLocaleString() || '0'}`
              }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No results found</h2>
          <p className="text-gray-600">
            We couldn&apos;t find any products matching &quot;{query}&quot;. Try different keywords or browse our categories.
          </p>
        </div>
      )}
    </main>
  );
} 