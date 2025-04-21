"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import supabase from "../api/auth/supabaseClient";

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .order('name');

        if (error) throw error;
        setBrands(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  if (loading) {
    return (
      <div className="py-12 px-8 bg-white">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 px-8 bg-white">
        <div className="text-red-500 text-center">Error: {error}</div>
      </div>
    );
  }

  return (
    <section className="py-12 px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Our Brands</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {brands.map((brand) => (
            <Link 
              key={brand.id} 
              href={`/brands/${brand.slug}`}
              className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
            >
              <img
                src={brand.images}
                alt={brand.name}
                className="h-16 w-auto object-contain mb-2"
              />
              <span className="text-sm font-medium text-gray-700">{brand.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
