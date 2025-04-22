"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getProductDetails, getRecommendedProducts } from "@/app/api/supabaseQueries"
import Recommended from "@/app/components/Recommended";
import Loader from "@/app/components/Loader";
import Footer from "@/app/components/Footer";
import ProductDetail from "@/app/components/Product_details";

export default function ProductDetails() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const productData = await getProductDetails(params.Product_details);
        setProduct(productData);

        // Fetch recommended products from the same brand
        const recommendedData = await getRecommendedProducts(productData.brand);
        setRecommendedProducts(recommendedData);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (params.Product_details) {
      fetchProductDetails();
    }
  }, [params.Product_details]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="text-center text-red-600 p-4">{error}</div>;
  }

  if (!product) {
    return <div className="text-center p-4">Product not found</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <ProductDetail product={product} />
      <Recommended products={recommendedProducts} currentProductId={product.id} />
      <Footer />
    </div>
  );
}
