"use client";

import React, { useEffect, useState } from "react";
import useWishlistStore from "@/store/useWishlistStore";
import { X, Trash, Loader } from "lucide-react";
import useAuthStore from "@/store/useAuthModal";
import { toast } from "sonner";
import Link from "next/link";

export default function WishlistSidebar() {
  const { isWishlistOpen, closeWishlist, wishlistItems, removeItem, fetchWishlist, isLoading, error } =
    useWishlistStore();
  const { user, isLoggedIn, userData } = useAuthStore();
  const [deletingItems, setDeletingItems] = useState({});
  const [localWishlistItems, setLocalWishlistItems] = useState([]);

  // Initialize local wishlist items when the component mounts or wishlistItems changes
  useEffect(() => {
    setLocalWishlistItems(wishlistItems);
  }, [wishlistItems]);

  // Fetch wishlist items when the sidebar is opened and user is logged in
  useEffect(() => {
    if (isWishlistOpen && isLoggedIn && userData) {
      fetchWishlist(userData.id);
    }
  }, [isWishlistOpen, isLoggedIn, userData, fetchWishlist]);

  const handleRemoveItem = async (productId) => {
    if (!isLoggedIn || !userData) {
      toast.error("You must be logged in to remove items from your wishlist");
      return;
    }

    // Set the deleting state for this specific item
    setDeletingItems(prev => ({ ...prev, [productId]: true }));
    
    try {
      // Optimistically update the UI by removing the item from local state
      setLocalWishlistItems(prevItems => 
        prevItems.filter(item => item.product_id !== productId)
      );
      
      // Then perform the actual deletion
      await removeItem(userData.id, productId);
    } catch (error) {
      console.error("Error removing item:", error);
      // If there's an error, revert the optimistic update
      setLocalWishlistItems(wishlistItems);
      toast.error("Failed to remove item from wishlist");
    } finally {
      // Clear the deleting state for this item
      setDeletingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <>
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50" onClick={closeWishlist}></div>
      )}
      <div
        className={`fixed top-0 right-0 w-80 h-full bg-white shadow-lg transform ${
          isWishlistOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-lg font-bold">My Wishlist</h2>
          <button onClick={closeWishlist}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-80px)]">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader className="w-6 h-6 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-500">Loading wishlist...</span>
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">
              {error}
            </div>
          ) : localWishlistItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
              {!isLoggedIn && (
                <p className="text-sm text-gray-400">
                  Please log in to add items to your wishlist.
                </p>
              )}
            </div>
          ) : (
            localWishlistItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border p-2 rounded-md"
              >
                <Link href={`/products/${item.products?.slug}`} className="flex items-center">
                  <img 
                    src={item.products?.image || "/images/placeholder.png"} 
                    alt={item.products?.name} 
                    className="w-14 h-14 object-cover rounded" 
                  />
                  <div className="flex-1 px-2">
                    <p className="font-medium line-clamp-1">{item.products?.name}</p>
                    <p className="text-sm text-gray-600">₹{item.products?.price?.toLocaleString()}</p>
                  </div>
                </Link>
                <button 
                  onClick={() => handleRemoveItem(item.product_id)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                  aria-label="Remove from wishlist"
                  disabled={deletingItems[item.product_id]}
                >
                  {deletingItems[item.product_id] ? (
                    <Loader className="w-4 h-4 animate-spin text-gray-500" />
                  ) : (
                    <Trash className="w-4 h-4 text-red-500" />
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
