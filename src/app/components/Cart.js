"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Plus, Minus, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import useCartStore from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import useAuthStore from "@/store/useAuthModal";
import { getUserOrders, getUserWishlist, getUserProfile } from "@/app/api/supabaseQueries";

export default function Cart() {
  const { items, count, removeItem, updateQuantity, getTotal, clearCart, isOpen, setIsOpen } = useCartStore();
  const { user, user_id } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [userOrders, setUserOrders] = useState([]);
  const [userWishlist, setUserWishlist] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (user_id) {
        setIsLoading(true);
        try {
          const [orders, wishlist, profile] = await Promise.all([
            getUserOrders(user_id),
            getUserWishlist(user_id),
            getUserProfile(user_id)
          ]);
          
          setUserOrders(orders);
          setUserWishlist(wishlist);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast.error('Failed to load user data');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user_id]);
  
  // Ensure isLoading is set to false when the cart is opened
  useEffect(() => {
    if (isOpen) {
      setIsLoading(false);
    }
  }, [isOpen]);
  
  const handleClose = () => {
    setIsOpen(false);
  };
  
  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity > 0) {
      updateQuantity(item.id, item.selectedSize, newQuantity);
    }
  };
  
  const handleRemoveItem = (item) => {
    removeItem(item.id, item.selectedSize);
  };
  
  const generateOrderId = () => {
    // Generate a random order ID with timestamp
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
  };
  
  const getDateAfter7Days = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  const sendWhatsAppMessage = async (orderId, deliveryDate) => {
    try {
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          deliveryDate
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('WhatsApp API error:', data);
        throw new Error(data.error || 'Failed to send WhatsApp message');
      }
      
      return data;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  };
  
  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const newOrderId = generateOrderId();
      setOrderId(newOrderId);
      
      const deliveryDate = getDateAfter7Days();
      
      const orderItems = items.map(item => ({
        name: item.name,
        size: item.selectedSize,
        price: item.price.toLocaleString(),
        qty: item.quantity,
        order_id: newOrderId,
        status: 'pending',
        user_id: user_id || null
      }));
      
      const { error } = await supabase
        .from('Order_details')
        .insert(orderItems);
      
      if (error) {
        console.error("Database error:", error);
        throw new Error(error.message || "Failed to insert order details");
      }
      
      // Refresh orders after placing new order
      if (user_id) {
        const updatedOrders = await getUserOrders(user_id);
        setUserOrders(updatedOrders);
      }
      
      clearCart();
      setIsOpen(false);
      setShowSuccessPopup(true);
      
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(`Failed to place order: ${error.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleWhatsAppShare = () => {
    const message = `Order Summary (Order ID: ${orderId})`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/919820313746?text=${encodedMessage}`, '_blank');
  };
  
  // Ensure isLoading is set to false after cart operations
  const handleAddToCart = (item) => {
    setIsLoading(true);
    try {
      updateQuantity(item.id, item.selectedSize, item.quantity + 1);
      toast.success("Product added to cart");
    } catch (error) {
      console.error("Error adding product to cart:", error);
      toast.error("Failed to add product to cart");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <div className={`fixed inset-0 z-50 ${isOpen ? "block" : "hidden"}`}>
        <div className="absolute inset-0 bg-black/50" onClick={handleClose}></div>
        <div className="absolute right-0 top-0 h-full w-[80%] sm:w-[400px] md:w-[450px] lg:w-[500px] bg-white shadow-lg flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Shopping Cart ({count} items)</h2>
            <button onClick={handleClose} className="p-1">
              <X size={24} />
            </button>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <p>Loading...</p>
            </div>
          ) : (
            <>
              {items.length === 0 ? (
                <div className="p-8 text-center flex-1 flex flex-col justify-center">
                  <p className="text-gray-500 mb-4">Your cart is empty</p>
                  <Link href="/products" onClick={handleClose}>
                    <Button className="bg-blue-500 text-white">Continue Shopping</Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="p-4 overflow-y-auto flex-1">
                    {items.map((item, index) => (
                      <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 mb-4 pb-4 border-b">
                        <div className="relative w-20 h-20">
                          <Image
                            src={item.image}
                            alt={item.name}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-md"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-500">
                            Size: {item.selectedSize}
                          </p>
                          <p className="font-semibold mt-1">₹{item.price.toLocaleString()}</p>
                          <div className="flex items-center mt-2">
                            <button 
                              onClick={() => handleQuantityChange(item, item.quantity - 1)}
                              className="p-1 border rounded-md"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="mx-2 w-6 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => handleQuantityChange(item, item.quantity + 1)}
                              className="p-1 border rounded-md"
                            >
                              <Plus size={16} />
                            </button>
                            <button 
                              onClick={() => handleRemoveItem(item)}
                              className="ml-auto text-red-500"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 border-t mt-auto sticky bottom-0 bg-white">
                    <div className="flex justify-between mb-4">
                      <span className="font-semibold">Total:</span>
                      <span className="font-semibold">₹{getTotal()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-gray-200 text-black hover:text-white"
                        onClick={clearCart}
                      >
                        Clear Cart
                      </Button>
                      <Button 
                        className="flex-1 bg-blue-500 text-white"
                        onClick={handlePlaceOrder}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Placing Order..." : "Place Order"}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSuccessPopup(false)}></div>
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-[80%] sm:w-[400px] md:w-[450px] lg:w-[500px]">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">Order Placed Successfully!</h3>
            <p className="text-gray-600 text-center mb-4">
              Your order has been placed. Order ID: {orderId}
            </p>
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-gray-200 text-black"
                onClick={() => setShowSuccessPopup(false)}
              >
                Close
              </Button>
              <Button 
                className="flex-1 bg-green-500 text-white"
                onClick={handleWhatsAppShare}
              >
                Share on WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Popup */}
      {showErrorPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowErrorPopup(false)}></div>
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-[80%] sm:w-[400px] md:w-[450px] lg:w-[500px]">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">Error</h3>
            <p className="text-gray-600 text-center mb-4">
              {errorMessage || "An error occurred while processing your order."}
            </p>
            <Button 
              className="w-full bg-red-500 text-white"
              onClick={() => setShowErrorPopup(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
