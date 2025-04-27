"use client";
import { useState, useEffect } from "react";
import { Search, ListFilter, ChevronDown, ChevronRight, X } from "lucide-react";
import supabase from "@/app/api/auth/supabaseClient";
import Card from "./Card";
import FilterSidebar from "./FilterSidebar";

export default function AllProducts({ onFilterChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("price-low");
  const [filters, setFilters] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState(25);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all products with their images
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select(`
            *,
            productImages (
              prod_images
            )
          `)
          .order("created_at", { ascending: false });

        if (productsError) throw productsError;

        const transformedProducts = productsData.map(product => ({
          id: product.id,
          name: product.name,
          brand: product.brand,
          sellPrice: product.sellPrice,
          slug: product.slug,
          color: product.color,
          size: product.size,
          gender: product.gender,
          productType: product.productType,
          images: product.productImages?.map(img => img.prod_images) || ['/images/placeholder.png'],
          categories: [product.productType, product.brand],
          price: `₹${product.sellPrice.toLocaleString()}`,
          colors: product.color || []
        }));

        setAllProducts(transformedProducts || []);
        setFilteredProducts(transformedProducts || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(error.message);
        setAllProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    if (!Array.isArray(allProducts)) return;

    let result = [...allProducts];

    // Apply search filter
    if (searchQuery) {
      
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
     
    }

    // Apply selected filters
    if (filters.length > 0) {
      // Group filters by type
      const groupedFilters = filters.reduce((acc, filter) => {
        if (!acc[filter.type]) {
          acc[filter.type] = [];
        }
        acc[filter.type].push(filter.value);
        return acc;
      }, {});

      console.log('Grouped filters:', groupedFilters);

      result = result.filter(product => {
        const matches = Object.entries(groupedFilters).every(([type, values]) => {
          if (!values || values.length === 0) return true;

          let match = false;
          switch (type) {
            case "size":
              match = values.some(selectedSize => {
                // Handle both array and string cases for product sizes
                const productSizes = Array.isArray(product.size) 
                  ? product.size 
                  : (product.size?.split(',') || []).map(s => s.trim());
                
                // Check if any of the product's sizes match the selected size
                const productMatch = productSizes.some(size => size === selectedSize);
                console.log(`Size check: [${productSizes.join(', ')}] includes ${selectedSize} = ${productMatch}`);
                return productMatch;
              });
              break;
            case "color":
              match = values.some(color => {
                const productMatch = product.color === color.toLowerCase();
                console.log(`Color check: ${product.color} === ${color} = ${productMatch}`);
                return productMatch;
              });
              break;
            case "brand":
              match = values.some(brand => {
                const productMatch = product.brand?.toLowerCase() === brand.toLowerCase();
                console.log(`Brand check: ${product.brand} === ${brand} = ${productMatch}`);
                return productMatch;
              });
              break;
            case "gender":
              match = values.some(gender => {
                const productMatch = product.gender?.toLowerCase() === gender.toLowerCase();
                console.log(`Gender check: ${product.gender} === ${gender} = ${productMatch}`);
                return productMatch;
              });
              break;
            case "productType":
              match = values.some(type => {
                const productMatch = product.productType?.toLowerCase() === type.toLowerCase();
                console.log(`ProductType check: ${product.productType} === ${type} = ${productMatch}`);
                return productMatch;
              });
              break;
            case "price":
              match = values.some(priceRange => {
                // Extract min and max values from the price range string
                const [minStr, maxStr] = priceRange.replace("₹", "").split(" - ");
                
                // Handle the "and above" case
                if (maxStr && maxStr.includes("and above")) {
                  const min = Number(minStr);
                  const productPrice = Number(product.sellPrice);
                  const priceMatch = productPrice >= min;
                  console.log(`Price check: ${productPrice} >= ${min} = ${priceMatch}`);
                  return priceMatch;
                }
                
                // Handle normal range case
                const min = Number(minStr);
                const max = Number(maxStr);
                const productPrice = Number(product.sellPrice);
                
                // Ensure we're comparing numbers, not strings
                const priceMatch = !isNaN(min) && !isNaN(max) && 
                  productPrice >= min && productPrice <= max;
                
                console.log(`Price check: ${productPrice} in range ${min}-${max} = ${priceMatch}`);
                return priceMatch;
              });
              break;
            default:
              return true;
          }
          console.log(`Product ${product.id} - ${type} match: ${match}`);
          return match;
        });

        console.log(`Product ${product.id} final match: ${matches}`);
        return matches;
      });

      console.log('Products after filtering:', result.length);
    }

    // Apply sorting
    console.log('Applying sort:', sortOption);
    result.sort((a, b) => {
      if (sortOption === "price-low") return a.sellPrice - b.sellPrice;
      if (sortOption === "price-high") return b.sellPrice - a.sellPrice;
      if (sortOption === "newest")
        return new Date(b.created_at) - new Date(a.created_at);
      return 0;
    });

    console.log('Final filtered products count:', result.length);
    setFilteredProducts(result);
  }, [allProducts, searchQuery, sortOption, filters]);

  const handleApplyFilters = (appliedFilters) => {
    console.log('Applying new filters:', appliedFilters);
    // Only update filters if they've actually changed
    if (JSON.stringify(filters) !== JSON.stringify(appliedFilters)) {
      setFilters(appliedFilters);
    }
  };

  const handleClearFilters = () => {
    console.log('Clearing all filters');
    setFilters([]);
    setSearchQuery("");
    setSortOption("price-low");
    setFilteredProducts(allProducts);
  };

  const handleRemoveFilter = (filterToRemove) => {
    console.log('Removing filter:', filterToRemove);
    // Remove the filter from the filters array
    const updatedFilters = filters.filter(filter => 
      !(filter.type === filterToRemove.type && filter.value === filterToRemove.value)
    );
    setFilters(updatedFilters);
    
    // Update the filter sidebar state
    if (typeof onFilterChange === 'function') {
      onFilterChange(updatedFilters);
    }
  };

  const handleLoadMore = () => setVisibleProducts((prev) => prev + 25);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 py-10 px-8 bg-white">
      

      {/* Search, Sort & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 w-full">
        <div className="relative w-full md:w-2/4">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="appearance-none bg-white border py-2 pl-3 pr-8 rounded-md text-sm border-gray-300"
            >
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-3 text-gray-400"
              size={18}
            />
          </div>

          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center space-x-1 text-sm px-3 py-2 rounded-md border border-gray-300"
          >
            <span className="mr-2">Filter</span>
            <ListFilter size={18} />
          </button>
        </div>
      </div>

      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        activeFilters={filters}
      />

      {/* Filters & Tags */}
      <div className="flex flex-wrap items-center justify-center space-x-2 text-sm">
        <span className="font-medium flex items-left block w-full">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'Result' : 'Results'} Showing
        </span>
        {filters.map((filter, index) => (
          <button onClick={() => handleRemoveFilter(filter)}
          className="cursor-pointer"
          >
          <span key={index} className="bg-gray-200 px-3 py-1 rounded-full relative">
            {filter.label}
            <X size={16}
            className="absolute -right-1 -top-1 text-gray-500 rounded-full bg-red-500 p-1 text-white"
            />
          </span>
          </button>
        ))}
        {filters.length > 0 && (
          <button
            onClick={handleClearFilters}
            className="border border-gray-300 rounded-full px-3 py-1 bg-red-500 text-white hover:bg-red-600"
          >
            Clear Filters ✖
          </button>
        )}
      </div>

      {/* Product Listing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {filteredProducts
          .slice(0, visibleProducts)
          .map((product) => (
            <Card key={product.id} product={product} />
          ))}
      </div>

      {/* Load More Button */}
      {visibleProducts < filteredProducts.length && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            className="bg-blue-600 text-white px-6 py-2 rounded-md text-lg hover:bg-blue-700"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
