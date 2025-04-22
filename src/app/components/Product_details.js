"use client";
import { useState } from "react";
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
} from "lucide-react";
import useCartStore from "@/store/useCartStore";
import { toast } from "sonner";

export default function ProductDetail({ product }) {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [wishlist, setWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  
  const addItem = useCartStore(state => state.addItem);
  
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
    if (!selectedSize || !selectedColor) {
      toast.error("Please select both size and color");
      return;
    }
    
    addItem(product, selectedSize, selectedColor, quantity);
    toast.success(`${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart`);
  };
  
  // Calculate discount percentage if originalPrice exists
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.sellPrice) / product.originalPrice) * 100) 
    : 0;
  
  // Check if both size and color are selected
  const isAddToCartDisabled = !selectedSize || !selectedColor;
  
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
              className="hover:scale-110 transition-transform"
            />
          </div>
          <div className="flex gap-2 mt-4">
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
            {discount > 0 && (
              <span className="bg-red-500 rounded-full py-1 px-3 text-white text-xs mr-2 font-normal">
                {discount}% off
              </span>
            )}
            ₹ {product.sellPrice}{" "}
            {product.originalPrice && (
              <span className="line-through text-gray-500 font-normal text-lg ml-3">
                ₹ {product.originalPrice}
              </span>
            )}
          </p>

          {/* Colors */}
          <div className="mt-6">
            <h2 className="text-sm font-medium">Available Colors</h2>
            <div className="flex gap-2 mt-2">
              {product.color && product.color.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? "outline outline-2 outline-blue-500" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          
          </div>

          {/* Size Selection */}
          <div className="mt-4">
            <h2 className="text-sm font-medium">Select Shoe Size</h2>
            <div className="flex gap-2 mt-2">
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

          {/* Selection Summary */}
          {isAddToCartDisabled && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700">
                Please select both a color and size to add this item to your cart
              </p>
            </div>
          )}

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
            <button onClick={() => setWishlist(!wishlist)}>
              <Heart
                className={wishlist ? "text-red-500" : "text-gray-500"}
                size={24}
              />
            </button>
          </div>

          {/* Features */}
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
          </div>
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
              <p className="mt-2 text-sm text-gray-700">
                {product.description || "This is a high-quality product designed for comfort and durability."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
