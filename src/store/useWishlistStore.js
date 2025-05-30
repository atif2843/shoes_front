"use client";

import { create } from "zustand";
import { getUserWishlist, removeFromWishlist, addToWishlist } from "@/app/api/supabaseQueries";
import { toast } from "sonner";

const useWishlistStore = create((set, get) => ({
  isWishlistOpen: false,
  wishlistItems: [],
  isLoading: false,
  error: null,

  openWishlist: () => set({ isWishlistOpen: true }),
  closeWishlist: () => set({ isWishlistOpen: false }),
  
  fetchWishlist: async (userId) => {
    if (!userId) {
      //console.log("No user ID provided for fetching wishlist");
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      const items = await getUserWishlist(userId);
      //console.log("Fetched wishlist items:", items);
      set({ wishlistItems: items, isLoading: false });
    } catch (error) {
      //console.error("Error fetching wishlist:", error);
      set({ error: "Failed to load wishlist", isLoading: false });
    }
  },
  
  addItem: async (userId, product) => {
    if (!userId || !product) {
      //console.log("Missing userId or product for adding to wishlist");
      return;
    }
    
    try {
      await addToWishlist(userId, product.id);
      set((state) => ({
        wishlistItems: [...state.wishlistItems, product],
      }));
      toast.success("Added to wishlist");
    } catch (error) {
      //console.error("Error adding to wishlist:", error);
      toast.error("Failed to add to wishlist");
    }
  },
  
  removeItem: async (userId, productId) => {
    if (!userId || !productId) {
      //console.log("Missing userId or productId for removing from wishlist");
      return;
    }
    
    try {
      await removeFromWishlist(userId, productId);
      
      // Immediately update the local state to reflect the removal
      set((state) => ({
        wishlistItems: state.wishlistItems.filter((item) => item.product_id !== productId),
      }));
      
      toast.success("Removed from wishlist");
    } catch (error) {
      //console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
      throw error;
    }
  },
}));

export default useWishlistStore;
