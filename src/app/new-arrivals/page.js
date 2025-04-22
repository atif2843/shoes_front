"use client";
import { useState, useEffect } from "react";
import { getNewArrivalsAll } from "@/app/api/supabaseQueries";
import { Button } from "@/components/ui/button";
import Card from "@/app/components/Card";
import { Loader } from "lucide-react";
import Footer from "@/app/components/Footer";

export default function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [lastProductId, setLastProductId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = async (loadMore = false) => {
    try {
      setLoading(true);
      const { products: newProducts, lastProductId: newLastId, hasMore: more } = 
        await getNewArrivalsAll(loadMore ? lastProductId : null);
      
      if (loadMore) {
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
      }
      
      setLastProductId(newLastId);
      setHasMore(more);
    } catch (err) {
      console.error("Error loading trending products:", err);
      setError("Failed to load trending products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleLoadMore = async () => {
    await loadProducts(true);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-8 pt-12">
        <h1 className="text-3xl font-bold mb-8 text-center">New Arrivals</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
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
              className="bg-cyan-600 text-white hover:bg-cyan-500"
            >
              Load More
            </Button>
          </div>
        )}

        {!hasMore && products.length > 0 && (
          <div className="text-center text-gray-500 my-8">
            No more products to load
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center text-gray-500 my-8">
            No trending products found
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
} 