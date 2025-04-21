"use client";
import { useRouter } from "next/navigation";
import brands from "../data/brands.json";

export default function BrandsPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-20 px-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 flex items-center space-x-2 mb-4">
        <span>Home</span> <span className="text-gray-400">/</span>
        <span className="text-black font-medium">Brands</span>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-center mb-6">Brands</h1>

      {/* Brands Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-md cursor-pointer transition-transform transform hover:scale-105 hover:shadow-lg"
            onClick={() => router.push(`/brands/${brand.slug}`)}
          >
            <img
              src={brand.image}
              alt={brand.name}
              className="w-24 h-24 object-contain mb-2"
            />
            <span className="text-sm font-medium">{brand.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
