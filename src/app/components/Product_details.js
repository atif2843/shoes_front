"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Heart,
  ShieldCheck,
  Truck,
  RefreshCw,
  ShoppingBag,
  Lock,
  ChevronDown,
  SearchCode,
} from "lucide-react";
import useCartStore from "@/store/useCartStore";
import useWishlistStore from "@/store/useWishlistStore";
import useAuthStore from "@/store/useAuthModal";
import { isInWishlist } from "@/app/api/supabaseQueries";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";

export default function ProductDetail({ product }) {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isInWishlistState, setIsInWishlistState] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const addItem = useCartStore(state => state.addItem);
  const { isLoggedIn, openLoginModal, userData } = useAuthStore();
  const { wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist, fetchWishlist } = useWishlistStore();

  // Check if product is in wishlist on component mount and when wishlistItems changes
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (isLoggedIn && userData) {
        try {
          const inWishlist = await isInWishlist(userData.id, product.id);
          setIsInWishlistState(inWishlist);
        } catch (error) {
          console.error("Error checking wishlist status:", error);
        }
      }
    };
    checkWishlistStatus();
  }, [isLoggedIn, userData, product.id, wishlistItems]);

  const increaseQuantity = () => {
    const maxStock = product.stock || 10; // Default to 10 if stock is not defined
    if (quantity < maxStock) {
      setQuantity(prevQuantity => prevQuantity + 1);
    } else {
      toast.info(`Only ${maxStock} items available in stock`);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };
  
  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select size");
      return;
    }
    
    addItem(product, selectedSize, quantity);
    toast.success(`${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart`);
  };

  const handleWishlistClick = async () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    try {
      if (!userData) {
        toast.error("User data not found. Please try logging in again.");
        return;
      }

      if (isInWishlistState) {
        await removeFromWishlist(userData.id, product.id);
        setIsInWishlistState(false);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(userData.id, product);
        setIsInWishlistState(true);
        toast.success("Added to wishlist");
      }

      // Refresh wishlist data
      await fetchWishlist(userData.id);
    } catch (error) {
      console.error("Wishlist operation failed:", error);
      toast.error("Failed to update wishlist. Please try again.");
    }
  };
  
  // Check if both size and color are selected
  const isAddToCartDisabled = !selectedSize;

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % product.images.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + product.images.length) % product.images.length);
  };
  
  return (
    <div className="container mx-auto py-4 px-8 ">
      
      {/* Image Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="relative w-full h-[400px]">
            <Image
              src={selectedImage}
              alt="Product Image"
              layout="fill"
              objectFit="contain"
              className="hover:scale-102 transition-transform"
            />
            <Dialog>
              <DialogTitle className="sr-only">{product.name}</DialogTitle>
              <DialogTrigger asChild>
                <button
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md"
                >
                  <SearchCode  size={24} />
                </button>
              </DialogTrigger>
              <DialogContent>
                <div className="relative w-full h-[400px]">
                  <Image
                    src={product.images[currentSlide]}
                    alt={`Slide ${currentSlide}`}
                    layout="fill"
                    objectFit="contain"
                  />
                  <button
                    className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md"
                    onClick={handlePrevSlide}
                  >
                    &lt;
                  </button>
                  <button
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md"
                    onClick={handleNextSlide}
                  >
                    &gt;
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex gap-2 mt-4 justify-center">
            {product.images.map((img, idx) => (
              <button key={idx} onClick={() => setSelectedImage(img)}>
                <Image
                  src={img}
                  alt={`Thumbnail ${idx}`}
                  width={60}
                  height={60}
                  className="border rounded-md"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <div className="flex gap-2 text-xs text-black-500 mt-3 mb-3 ">
            {[product.brand, product.gender].map((cat, index) => (
              <span
                key={index}
                className="bg-gray-50 px-2 py-1 rounded border-1 border-gray-200"
              >
                {cat}
              </span>
            ))}
          </div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-2xl font-semibold text-black flex items-center">
            {product.discount > 0 && (
              <span className="bg-red-500 rounded-full py-1 px-3 text-white text-xs mr-2 font-normal">
                {Math.round(product.discount)}% off
              </span>
            )}
            ₹ {product.sellPrice.toLocaleString()}{" "}
            {product.actualPrice && (
              <span className="line-through text-gray-500 font-normal text-lg ml-3">
                ₹ {product.actualPrice.toLocaleString()}
              </span>
            )}
          </p>

          {/* Size Selection */}
          <div className="mt-4">
            <h2 className="text-sm font-medium">Select Shoe Size</h2>
            <div className="flex gap-2 mt-2 flex-wrap">
              {product.size && product.size.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1 border rounded-md ${
                    selectedSize === size
                      ? "bg-cyan-600 text-white"
                      : "bg-white"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            
          </div>

    

          {/* Buttons */}
          <div className="mt-6 flex items-center gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-2 border rounded-md p-2">
              <button
                onClick={decreaseQuantity}
                className="px-3 py-1 border rounded-md"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="min-w-[20px] text-center">{quantity}</span>
              <button
                onClick={increaseQuantity}
                className="px-3 py-1 border rounded-md"
                disabled={quantity >= (product.stock || 10)}
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <Button 
              className={`flex items-center gap-2 px-6 py-2 rounded-md flex-2 ${
                isAddToCartDisabled ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white"
              }`}
              onClick={handleAddToCart}
              disabled={isAddToCartDisabled}
            >
              <ShoppingBag size={20} /> Add to Cart
            </Button>

            {/* Wishlist Button */}
            <button 
              onClick={handleWishlistClick}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Heart
                size={24}
                className={`${
                  isInWishlistState 
                    ? "text-red-500 fill-red-500" 
                    : "text-gray-500 hover:text-red-500 transition hover:fill-red-500"
                }`}
              />
            </button>
          </div>

          {/* Features 
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Lock size={20} /> Secure Payments
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Truck size={20} /> Free Delivery
            </div>
            <div className="flex items-center gap-2 text-sm">
              <RefreshCw size={20} /> Easy Returns
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck size={20} /> 100% Genuine
            </div>
          </div>*/}
          <div className="mt-6 border-t pt-4">
            <button
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="flex justify-between w-full text-left text-lg font-medium"
            >
              Product Details{" "}
              <ChevronDown
                className={`transition-transform ${
                  isDetailsOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isDetailsOpen && (
              <div className="mt-2 text-sm text-gray-700 bg-gray-200 p-4 rounded-md">
                <p className="my-3">
                  Brand: {product.brand}
                </p>
                <p className="my-3">
                  Gender: {product.gender}
                </p>
                <p className="my-3">Product Type: {product.productType}</p>
                <p className="my-3">Stock: {product.stock}</p>
                <div 
                  className="product-details-content"
                  dangerouslySetInnerHTML={{ 
                    __html: product.details || "This is a high-quality product designed for comfort and durability." 
                  }} 
                />
              </div>
            )}

            <button
              onClick={() => setIsAboutOpen(!isAboutOpen)}
              className="flex justify-between w-full text-left text-lg font-medium mt-4"
            >
              About Product{" "}
              <ChevronDown
                className={`transition-transform ${
                  isAboutOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isAboutOpen && (
              <div className="mt-2 text-sm text-gray-700">
                <div 
                  className="product-description-content"
                  dangerouslySetInnerHTML={{ 
                    __html: product.description || "This is a high-quality product designed for comfort and durability." 
                  }} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
