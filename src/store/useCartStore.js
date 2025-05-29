"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ShoppingBag, X, Minus, Plus, Trash } from "lucide-react";
import { useEffect } from "react";

// Zustand Store for Cart State Management
const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      count: 0,
      isOpen: false,
      
      setIsOpen: (isOpen) => set({ isOpen }),
      
      // Add item to cart
      addItem: (product, selectedSize, quantity) => {
        const { items } = get();
        
        // Check if the item with the same size and color already exists
        const existingItemIndex = items.findIndex(
          item => 
            item.id === product.id && 
            item.selectedSize === selectedSize 
        );
        
        if (existingItemIndex >= 0) {
          // Update quantity if item exists
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += quantity;
          
          set({
            items: updatedItems,
            count: get().count + quantity
          });
        } else {
          // Add new item
          const newItem = {
            id: product.id,
            name: product.name,
            price: product.sellPrice,
            image: product.images[0],
            selectedSize,
            quantity,
            slug: product.slug
          };
          
          set({
            items: [...items, newItem],
            count: get().count + quantity
          });
        }
      },
      
      // Remove item from cart
      removeItem: (itemId, selectedSize) => {
        const { items } = get();
        const itemIndex = items.findIndex(
          item => 
            item.id === itemId && 
            item.selectedSize === selectedSize
        );
        
        if (itemIndex >= 0) {
          const updatedItems = [...items];
          const removedQuantity = updatedItems[itemIndex].quantity;
          updatedItems.splice(itemIndex, 1);
          
          set({
            items: updatedItems,
            count: get().count - removedQuantity
          });
        }
      },
      
      // Update item quantity
      updateQuantity: (itemId, selectedSize, newQuantity) => {
        const { items } = get();
        const itemIndex = items.findIndex(
          item => 
            item.id === itemId && 
            item.selectedSize === selectedSize
        );
        
        if (itemIndex >= 0) {
          const updatedItems = [...items];
          const oldQuantity = updatedItems[itemIndex].quantity;
          updatedItems[itemIndex].quantity = newQuantity;
          
          set({
            items: updatedItems,
            count: get().count - oldQuantity + newQuantity
          });
        }
      },
      
      // Clear cart
      clearCart: () => {
        set({ items: [], count: 0 });
      },
      
      // Get cart total
      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'cart-storage', // name of the item in localStorage
    }
  )
);

export default useCartStore;
