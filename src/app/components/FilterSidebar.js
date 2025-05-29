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

  // Function to get a contrasting text color based on background color
  const getContrastColor = (hexColor) => {
    // Remove the # if present
    const color = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black or white based on luminance
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  // Function to format color for display
  const formatColor = (color) => {
    // Handle hex colors
    if (color.startsWith('#')) {
      return color;
    }
    
    // Handle named colors
    const colorMap = {
      'red': '#FF0000',
      'blue': '#0000FF',
      'green': '#008000',
      'yellow': '#FFFF00',
      'black': '#000000',
      'white': '#FFFFFF',
      'purple': '#800080',
      'orange': '#FFA500',
      'pink': '#FFC0CB',
      'brown': '#A52A2A',
      'gray': '#808080',
      'grey': '#808080',
      'navy': '#000080',
      'beige': '#F5F5DC',
      'tan': '#D2B48C',
      'khaki': '#F0E68C',
      'maroon': '#800000',
      'olive': '#808000',
      'teal': '#008080',
      'turquoise': '#40E0D0',
      'gold': '#FFD700',
      'silver': '#C0C0C0',
      'bronze': '#CD7F32',
      'copper': '#B87333',
      'rose': '#FF007F',
      'lime': '#00FF00',
      'aqua': '#00FFFF',
      'fuchsia': '#FF00FF',
      'indigo': '#4B0082',
      'violet': '#8F00FF',
      'coral': '#FF7F50',
      'crimson': '#DC143C',
      'lavender': '#E6E6FA',
      'mint': '#98FF98',
      'peach': '#FFDAB9',
      'plum': '#DDA0DD',
      'salmon': '#FA8072',
      'seafoam': '#98FF98',
      'slate': '#708090',
      'steel': '#4682B4',
      'wine': '#722F37',
    };
    
    // Check if it's a named color
    const lowerColor = color.toLowerCase();
    if (colorMap[lowerColor]) {
      return colorMap[lowerColor];
    }
    
    // If it's already a hex color without the #, add it
    if (/^[0-9A-Fa-f]{6}$/.test(color)) {
      return `#${color}`;
    }
    
    // Return the original color if we can't format it
    return color;
  };

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
        const uniqueColors = [...new Set(products.flatMap(p => p.color))].sort();
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
          color: uniqueColors,
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
      color: [],
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
      color: [],
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

          {/* Color Filter */}
          <div>
            <h3 className="font-medium mb-2">Color ({filters.color?.length || 0})</h3>
            <div className="grid grid-cols-2 gap-2">
              {filterOptions.color.map((color) => {
                const formattedColor = formatColor(color);
                const textColor = getContrastColor(formattedColor);
                
                return (
                  <div key={color} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`color-${color}`}
                      checked={filters.color?.includes(color)}
                      onChange={() => handleCheckboxChange("color", color)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={`color-${color}`} className="flex items-center">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center" 
                        style={{ 
                          backgroundColor: formattedColor, 
                          border: '1px solid #ddd',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          position: 'relative'
                        }}
                      >
                        {/* Add a small inner circle for better visibility of light colors */}
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ 
                            backgroundColor: formattedColor,
                            border: '1px solid rgba(0,0,0,0.1)'
                          }}
                        ></div>
                      </div>
                      
                    </label>
                  </div>
                );
              })}
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
