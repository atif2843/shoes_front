import { useState, useEffect } from "react";
import { X } from "lucide-react";
import supabase from "@/app/api/auth/supabaseClient";

export default function FilterSidebar({ isOpen, onClose, onApply, onClear, activeFilters = [] }) {
  const [filters, setFilters] = useState({
    size: [],
    brand: [],
    gender: [],
    productType: [],
    price: [],
  });

  const [filterOptions, setFilterOptions] = useState({
    size: [],
    brand: [],
    gender: [],
    productType: [],
    price: [],
  });


  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const { data: products, error, status, statusText } = await supabase
          .from("products")
          .select("size, brand, gender, productType, sellPrice");

        if (error) {
          console.error("Supabase error fetching filter options:", {
            error,
            status,
            statusText,
          });
          return;
        }

        if (!products || products.length === 0) {
          console.warn("No products found in the database.");
          return;
        }

        // Extract unique values for each filter category
        const uniqueSizes = [...new Set(products.flatMap(p => p.size))].sort();
        const uniqueBrands = [...new Set(products.map(p => p.brand))].sort();
        const uniqueGenders = [...new Set(products.map(p => p.gender))].sort();
        const uniqueProductTypes = [...new Set(products.map(p => p.productType))].sort();

        // Create price ranges
        const maxPrice = Math.max(...products.map(p => p.sellPrice));
        const priceRanges = [];
        for (let i = 3000; i <= maxPrice; i += 3000) {
          priceRanges.push(`₹${i} - ₹${i + 2999}`);
        }
        if (maxPrice > priceRanges[priceRanges.length - 1]?.split(" - ")[1]?.replace("₹", "")) {
          priceRanges.push(`₹${Math.ceil(maxPrice / 3000) * 3000} and above`);
        }

        setFilterOptions({
          size: uniqueSizes,
          brand: uniqueBrands,
          gender: uniqueGenders,
          productType: uniqueProductTypes,
          price: priceRanges,
        });
      } catch (error) {
        console.error("Unexpected error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Only update filters when activeFilters changes and is not empty
  useEffect(() => {
    // Skip if activeFilters is empty to prevent unnecessary updates
    if (activeFilters.length === 0) return;
    
    const newFilters = {
      size: [],
      brand: [],
      gender: [],
      productType: [],
      price: [],
    };
    
    activeFilters.forEach(filter => {
      if (newFilters[filter.type]) {
        newFilters[filter.type].push(filter.value);
      }
    });
    
    setFilters(newFilters);
  }, [activeFilters]);

  const handleCheckboxChange = (category, value) => {
    setFilters((prev) => {
      const updated = prev[category]?.includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...(prev[category] || []), value];
      return { ...prev, [category]: updated };
    });
  };

  const handleApply = () => {
    const appliedFilters = Object.entries(filters).flatMap(([key, values]) =>
      values.map((value) => ({ type: key, value, label: value }))
    );
    onApply(appliedFilters);
    onClose();
  };

  const handleClear = () => {
    setFilters({
      size: [],
      brand: [],
      gender: [],
      productType: [],
      price: [],
    });
    onClear();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0  flex justify-end z-50"
      onClick={onClose}
    >
      <div
        className="w-80 bg-white h-screen shadow-lg p-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4  top-0">
          <h2 className="text-lg font-medium">Filters</h2>
          <button onClick={onClose}>
            <X className="h-6 w-6 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        <div className="flex justify-between mb-4  top-12">
          <button onClick={handleClear} className="text-red-500">
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Apply Filters
          </button>
        </div>

        <div className="space-y-6">
          {/* Size Filter */}
          <div>
            <h3 className="font-medium mb-2">Size ({filters.size?.length || 0})</h3>
            <div className="grid grid-cols-2 gap-2">
              {filterOptions.size.map((size) => (
                <div key={size} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`size-${size}`}
                    checked={filters.size?.includes(size)}
                    onChange={() => handleCheckboxChange("size", size)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={`size-${size}`}>{size}</label>
                </div>
              ))}
            </div>
          </div>


          {/* Brand Filter */}
          <div>
            <h3 className="font-medium mb-2">Brand ({filters.brand?.length || 0})</h3>
            <div className="space-y-2">
              {filterOptions.brand.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`brand-${brand}`}
                    checked={filters.brand?.includes(brand)}
                    onChange={() => handleCheckboxChange("brand", brand)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={`brand-${brand}`}>{brand}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Gender Filter */}
          <div>
            <h3 className="font-medium mb-2">Gender ({filters.gender?.length || 0})</h3>
            <div className="space-y-2">
              {filterOptions.gender.map((gender) => (
                <div key={gender} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`gender-${gender}`}
                    checked={filters.gender?.includes(gender)}
                    onChange={() => handleCheckboxChange("gender", gender)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={`gender-${gender}`}>{gender}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Product Type Filter */}
          <div>
            <h3 className="font-medium mb-2">Product Type ({filters.productType?.length || 0})</h3>
            <div className="space-y-2">
              {filterOptions.productType.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`type-${type}`}
                    checked={filters.productType?.includes(type)}
                    onChange={() => handleCheckboxChange("productType", type)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={`type-${type}`}>{type}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <h3 className="font-medium mb-2">Price Range ({filters.price?.length || 0})</h3>
            <div className="space-y-2">
              {filterOptions.price.map((range) => (
                <div key={range} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`price-${range}`}
                    checked={filters.price?.includes(range)}
                    onChange={() => handleCheckboxChange("price", range)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={`price-${range}`}>{range}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
