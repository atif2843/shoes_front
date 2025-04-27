"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft, Search, Footprints } from "lucide-react";
import Image from "next/image";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-gray-50 to-cyan-50">
      <div className="text-center max-w-2xl">
        <div className="relative mb-8">
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
            <div className="relative w-40 h-40">
                   
            </div>
          </div>
          <h1 className="text-9xl font-bold text-cyan-600 mb-4">404</h1>
        </div>
        
        <div className="w-24 h-1 bg-cyan-600 mx-auto mb-6"></div>
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">Oops! These shoes don&apos;t fit</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for seems to have walked away. Don&apos;t worry, we have plenty of other styles for you to explore.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            <Home size={18} />
            Home Page
          </Link>
        </div>
        
        <div className="mt-12">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Looking for specific shoes?</h3>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Search size={18} />
            Search Products
          </Link>
        </div>
        
        <div className="mt-16 flex justify-center">
          <div className="relative w-64 h-16">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex space-x-2">
                <Footprints className="w-8 h-8 text-cyan-600 transform rotate-45" />
                <Footprints className="w-8 h-8 text-cyan-500 transform -rotate-45" />
                <Footprints className="w-8 h-8 text-cyan-400 transform rotate-45" />
                <Footprints className="w-8 h-8 text-cyan-300 transform -rotate-45" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 