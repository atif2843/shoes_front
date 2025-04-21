"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  Search,
  User,
  Heart,
  ChevronDown,
  ShoppingBag,
  LogOut,
  Settings,
  X,
} from "lucide-react";
import { auth, signInWithGoogle, logOut } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import useAuthStore from "@/store/useAuthModal";
import useCartStore from "@/store/useCartStore";
import WishlistSidebar from "./WishlistSidebar";
import useWishlistStore from "@/store/useWishlistStore";
import { redirect, useRouter } from "next/navigation";
import supabase from "@/app/api/auth/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import Marquee from "react-fast-marquee";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Cart from "./Cart";

export default function Navbar() {
  const { openWishlist, wishlistItems, fetchWishlist } = useWishlistStore();
  const { openLoginModal, isLoggedIn, user: authUser, userData } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const [user, setUser] = useState(null);
  const { openCart, cartItems } = useCartStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const cartCount = useCartStore(state => state.count);
  const setIsCartOpen = useCartStore(state => state.setIsOpen);
  const router = useRouter();
  const [localWishlistCount, setLocalWishlistCount] = useState(0);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        useAuthStore.getState().closeLoginModal();
      }
    });
  }, []);

  // Fetch wishlist count when user is logged in
  useEffect(() => {
    if (isLoggedIn && userData) {
      fetchWishlist(userData.id);
    }
  }, [isLoggedIn, userData, fetchWishlist]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search products as user types
  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            id,
            name,
            slug,
            sellPrice,
            productImages (
              prod_images
            )
          `)
          .ilike("name", `%${searchQuery}%`)
          .limit(5);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error("Error searching products:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Update local wishlist count when wishlistItems changes
  useEffect(() => {
    setLocalWishlistCount(wishlistItems.length);
  }, [wishlistItems]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      // Navigate to the first result or implement your search results page
      console.log("Searching for:", searchQuery);
    }
    setSearchOpen(false);
  };

  const NavItems = {
    NewArrivals: "/new-arrivals",
    Trending: "/trending",
    Brands: "/brands",
    About: "/about",
    Contact: "/contact",
  };

  // Update the wishlist button click handler
  const handleWishlistClick = () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    openWishlist();
  };

  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      <nav className="fixed w-full bg-white z-50">
        <div className="w-full z-50 bg-white">
          <Marquee speed={50} gradient={false} style={{ padding: "10px" }}>
            🏃‍♂️ This is a running marquee text! Add anything you like here. ✨
          </Marquee>
        </div>
        <div className="flex items-center space-x-4 justify-between shadow-md py-4 px-4 sm:px-10 z-50">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
          >
            {menuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          <div className="text-2xl font-bold font-gantari">SUPER JUMP</div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 font-geist">
            {Object.entries(NavItems).map(([key, value]) => (
              <Link key={key} href={value} className="hover:text-blue-500">
                {key.replace(/([A-Z])/g, " $1")}
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="hover:bg-cyan-600 p-2 rounded-md hover:text-white"
            >
              <Search className="w-4 h-4" />
            </button>
            {/* Search Overlay */}
            {searchOpen && (
              <div
                ref={searchRef}
                className="absolute top-full left-0 right-0 bg-white shadow-lg p-4 w-full"
              >
                <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-3 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-600"
                      autoFocus
                    />
                  </div>
                  {/* Search Results */}
                  {searchQuery.length >= 2 && (
                    <div className="mt-4 max-h-96 overflow-y-auto">
                      {isLoading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-600 mx-auto"></div>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="flex flex-col space-y-2">
                          {searchResults.map((product, index) => (
                            <Link
                              key={index}
                              href={`/products/${product.slug}`}
                              className="cursor-pointer hover:bg-gray-50 transition-all duration-200"
                            >
                              <Card>
                                <CardContent className="px-4 py-3">
                                  <div className="flex items-center space-x-4">
                                    {product.productImages && product.productImages.length > 0 ? (
                                      <Image
                                        src={product.productImages[0].prod_images}
                                        alt={product.name}
                                        width={50}
                                        height={50}
                                        className="w-12 h-12 object-cover rounded"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                        <span className="text-gray-400 text-xs">No image</span>
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <CardTitle className="text-sm font-medium text-gray-900">
                                        {product.name}
                                      </CardTitle>
                                      <CardDescription className="text-sm text-gray-600">
                                        ₹{product.sellPrice.toLocaleString()}
                                      </CardDescription>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          No products found
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </div>
            )}
            <div
              className="relative bg-gray-100 hover:bg-gray-200 p-2 rounded-md cursor-pointer"
              onClick={handleWishlistClick}
            >
              <Heart className="w-4 h-4" />
              {localWishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {localWishlistCount}
                </span>
              )}
            </div>
            <div className="relative">
              <button onClick={() => setIsCartOpen(true)} className="flex items-center">
                <ShoppingBag size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
            {/* Google Authentication */}
            {user ? (
              <div className="relative group">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt="User"
                    width={40}
                    height={10}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                <div className="absolute hidden group-hover:block bg-white shadow-md p-2 rounded-md right-0 min-w-[200px]">
                  <p className="px-4 py-2 border-b border-gray-100 uppercase text-sm">
                    {user.displayName || "User"}
                  </p>
                  <button
                    onClick={() => {
                      redirect("/profile");
                    }}
                    className="flex items-center w-full px-4 py-2.5 text-left hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2.5 text-left hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={openLoginModal}
                className="hover:bg-gray-200 p-2 rounded-md"
              >
                <User className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`fixed top-0 left-0 w-full h-full bg-white transform transition-transform duration-300 ease-in-out z-50 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-8">
              <div className="text-2xl font-bold font-gantari">SUPER JUMP</div>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col space-y-4">
              {Object.entries(NavItems).map(([key, value]) => (
                <Link
                  key={key}
                  href={value}
                  className="text-lg hover:text-blue-500 py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  {key.replace(/([A-Z])/g, " $1")}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
      
      <WishlistSidebar />
      <Cart />
    </>
  );
}
