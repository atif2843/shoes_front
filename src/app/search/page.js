"use client";
import { Suspense } from "react";
import Footer from "../components/Footer";
import SearchResults from "../components/SearchResults";

export default function SearchPage() {
  return (
    <div className="search-page">
      <Suspense fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
          </div>
        </div>
      }>
        <SearchResults />
      </Suspense>
      <Footer />
    </div>
  );
} 