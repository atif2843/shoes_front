"use client";
import { useState, useCallback, useEffect } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import useEmblaCarousel from "embla-carousel-react";
import useAuthStore from "@/store/useAuthModal";
import useWishlistStore from "@/store/useWishlistStore";
import { addToWishlist, removeFromWishlist, isInWishlist } from "@/app/api/supabaseQueries";
import { toast } from "sonner";
import Link from "next/link";

export default function Card({ product }) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const { isLoggedIn, openLoginModal, user, userData } = useAuthStore();
  const [isInWishlistState, setIsInWishlistState] = useState(false);
  const { wishlistItems, addItem, removeItem, fetchWishlist } = useWishlistStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    dragFree: false,
    skipSnaps: false,
  });
  const [imageError, setImageError] = useState({});
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  // Update selected index when carousel moves
  const onSelect = useCallback(() => {
    if (emblaApi) {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    }
  }, [emblaApi]);

  useEffect(() => {
    if (emblaApi) {
      onSelect();
      emblaApi.on("select", onSelect);
      emblaApi.on("reInit", onSelect);
    }
    return () => {
      if (emblaApi) {
        emblaApi.off("select", onSelect);
        emblaApi.off("reInit", onSelect);
      }
    };
  }, [emblaApi, onSelect]);

  // Check if product is in wishlist on component mount and when wishlistItems changes
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (isLoggedIn && userData) {
        try {
          const inWishlist = await isInWishlist(userData.id, product.id);
          // Only update state if it's different from current state
          if (inWishlist !== isInWishlistState) {
            setIsInWishlistState(inWishlist);
          }
        } catch (error) {
          console.error("Error checking wishlist status:", error);
        }
      }
    };
    checkWishlistStatus();
  }, [isLoggedIn, userData, product.id, wishlistItems, isInWishlistState]);

  // Ensure only the first image is displayed
  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? [product.images[0]] // Only take the first image
      : [product.image || "/images/placeholder.png"];

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product);
    setTimeout(() => setIsAdding(false), 1000);
  };

  // Handle image loading errors
  const handleImageError = (index) => {
    setImageError(prev => ({
      ...prev,
      [index]: true
    }));
  };

  // Improved wishlist handling
  const handleWishlistClick = async () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    try {
      setIsWishlistLoading(true);
      if (!userData) {
        toast.error("User data not found. Please try logging in again.");
        return;
      }

      if (isInWishlistState) {
        await removeItem(userData.id, product.id);
        setIsInWishlistState(false);
        toast.success("Removed from wishlist");
      } else {
        await addItem(userData.id, product);
        setIsInWishlistState(true);
        toast.success("Added to wishlist");
      }

      await fetchWishlist(userData.id);
    } catch (error) {
      console.error("Wishlist operation failed:", error);
      toast.error("Failed to update wishlist. Please try again.");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition w-full max-w-xs h-[500px] flex flex-col">
      {/* Product Image with Wishlist Icon */}
      <Link href={`/products/${product.slug}`}>
      <div className="relative border-1 border-gray-200 rounded-lg flex justify-center h-[300px]">
        <div className="overflow-hidden w-full h-full" ref={emblaRef}>
           
          <div className="flex h-full">
            {images.map((image, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 h-full">
                <div className="h-full flex items-center justify-center">
                  {imageError[index] ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-400">Image not available</span>
                    </div>
                  ) : (
                    <img
                      src={image}
                      alt={`${product.name} - Image ${index + 1}`}
                      className="max-w-full max-h-full w-auto h-auto object-contain hover:scale-105 transition duration-300"
                      loading="lazy"
                      onError={() => handleImageError(index)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col flex-wrap">
        <div className="relative flex-1">
          {/* Categories */}
          <div className="flex gap-2 text-xs text-black-500 mt-3 flex-wrap justify-between">
            <div className="flex gap-2">
            {product.categories.map((cat, index) => (
              <span
                key={index}
                className="bg-gray-50 px-2 py-1 rounded border-1 border-gray-200"
              >
                {cat}
              </span>
            ))}
          </div>
          <div>
           {/* Wishlist Button */}
           <button 
            className="p-1 bg-white rounded-full shadow hover:bg-gray-50 transition-colors disabled:opacity-50" 
            name="wishlist"
            onClick={handleWishlistClick}
            disabled={isWishlistLoading}
            aria-label={isInWishlistState ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={18}
              className={`${
                isInWishlistState 
                  ? "text-red-500 fill-red-500" 
                  : "text-gray-500 hover:text-red-500 transition hover:fill-red-500"
              } ${isWishlistLoading ? "animate-pulse" : ""}`}
            />
          </button>
          </div>
          </div>

          {/* Product Details */}
          <div className="">
            <div className="flex flex-col justify-between">
             
                <h3 className="text-sm font-semibold mt-2 overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">
                  {product.name}
                </h3>
              
              <p className="text-lg font-bold text-gray-800 mt-1">
                {product.price.toLocaleString()}
              </p>
            </div>
          </div>
             
        </div>
      </div>
       </Link>
    </div>

  );
}
