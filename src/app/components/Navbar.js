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
  const [isMarqueeVisible, setIsMarqueeVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
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

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Add a threshold to prevent rapid changes
      if (currentScrollY < 10) {
        setIsMarqueeVisible(true);
      } else if (currentScrollY < lastScrollY) {
        // Only show marquee if we've scrolled up significantly
        if (lastScrollY - currentScrollY > 50) {
          setIsMarqueeVisible(true);
        }
      } else if (currentScrollY > lastScrollY) {
        // Only hide marquee if we've scrolled down significantly
        if (currentScrollY - lastScrollY > 50) {
          setIsMarqueeVisible(false);
        }
      }
      
      setLastScrollY(currentScrollY);
    };

    // Add debounce to scroll event
    let timeoutId;
    const debouncedScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 10);
    };

    window.addEventListener('scroll', debouncedScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', debouncedScroll);
      clearTimeout(timeoutId);
    };
  }, [lastScrollY]);

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
      <header className="fixed top-0 left-0 right-0 z-40 bg-white">
        <nav className={`transform transition-transform duration-500 ease-out ${
          isMarqueeVisible ? 'translate-y-0' : '-translate-y-[48px]'
        }`}>
          <div className="w-full bg-white">
            <Marquee 
              className="bg-red-500 text-white shadow-md h-[48px]"
              speed={50} 
              gradient={false} 
              style={{ padding: "10px" }}
            >
              🏃‍♂️ This is a running marquee text! Add anything you like here. ✨
            </Marquee>
          </div>
          <div className="flex items-center space-x-4 justify-between shadow-md py-4 px-4 sm:px-10 bg-white">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="mobile-menu-900 p-2 rounded-md hover:bg-gray-100"
            >
              {menuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            <div className="text-2xl font-bold font-gantari">
              <Image
              src="/images/logo.png"
              alt="Logo"
              title="Logo"
              width="70"
              height="70"
              />
            </div>

            {/* Desktop Menu */}
            <div className="desktop-menu-900 space-x-6 font-geist">
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
                  className="absolute top-full left-0 right-0 bg-white shadow-lg w-full min-h-screen sm:min-h-0 z-50"
                >
                  <form onSubmit={handleSearch} className="max-w-md mx-auto px-4 sm:px-0 pb-4">
                    <div className="sticky top-0 pt-4 pb-3 bg-white z-10">
                      <div className="relative">
                        <Search
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search products..."
                          className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 text-base"
                          autoFocus
                        />
                        {searchQuery && (
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setSearchResults([]);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            Clear ×
                          </button>
                        )}
                      </div>
                    </div>

                    {searchQuery.length >= 2 && (
                      <div className="mt-2">
                        {searchQuery && <div className="text-sm text-gray-500 mb-3 px-1">Searching</div>}
                        
                        {isLoading ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-600 mx-auto"></div>
                          </div>
                        ) : searchResults.length > 0 ? (
                          <div className="flex flex-col h-full">
                            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)] sm:max-h-[320px]">
                              <div className="space-y-3 pb-3">
                                {searchResults.slice(0, 10).map((product) => (
                                  <Link
                                    key={product.id}
                                    href={`/products/${product.slug}`}
                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                    onClick={() => setSearchOpen(false)}
                                  >
                                    <div className="w-14 h-14 flex-shrink-0 bg-gray-50 rounded">
                                      {product.productImages && product.productImages.length > 0 ? (
                                        <Image
                                          src={product.productImages[0].prod_images}
                                          alt={product.name}
                                          width={56}
                                          height={56}
                                          className="w-full h-full object-contain p-1"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                                          <span className="text-gray-400 text-xs">No image</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                                      <p className="text-sm text-gray-900">₹ {product.sellPrice.toLocaleString()}</p>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </div>
                            <div className="mt-2 pt-3 border-t bg-white">
                              <button
                                onClick={() => {
                                  router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                                  setSearchOpen(false);
                                }}
                                className="w-full text-center py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors"
                              >
                                View All
                              </button>
                            </div>
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
                  <ShoppingBag size={18} />
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
        </nav>
      </header>
      {/* Spacer div with smoother transition */}
      <div 
        className="transition-[height] duration-500 ease-out" 
        style={{ height: isMarqueeVisible ? '120px' : '72px' }}
      />

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed left-0 top-0 h-full w-[280px] bg-white shadow-lg">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <span className="text-xl font-bold">Menu</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                  {Object.entries(NavItems).map(([key, value]) => (
                    <Link
                      key={key}
                      href={value}
                      className="block text-lg py-2 hover:text-blue-500"
                      onClick={() => setMenuOpen(false)}
                    >
                      {key.replace(/([A-Z])/g, " $1")}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <WishlistSidebar />
      <Cart />
    </>
  );
}
