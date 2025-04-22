"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import BrandProductList from "@/app/components/BrandProductList";
import Footer from "@/app/components/Footer";
import supabase from "@/app/api/auth/supabaseClient";

export default function BrandProductPage() {
  const params = useParams();
  const brandslug = params?.brandslug;
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [brandDetails, setBrandDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBrandProducts = async () => {
      try {
        // First, get the brand details
        const decodedBrandName = decodeURIComponent(brandslug);
        const { data: brandData, error: brandError } = await supabase
          .from('brands')
          .select('*')
          .eq('slug', decodedBrandName)
          .single();

        if (brandError) throw brandError;
        setBrandDetails(brandData);

        // Then, get all products for this brand
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            productImages (
              prod_images
            )
          `)
          .eq('brand', brandData.name);
           
        if (productsError) throw productsError;
        setFilteredProducts(productsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandProducts();
  }, [brandslug]);

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <BrandProductList
        brandslug={brandslug}
        filteredProducts={filteredProducts}
        brandDetails={brandDetails}
      />
      <Footer />
    </div>
  );
}
