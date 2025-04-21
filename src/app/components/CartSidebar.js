import { useEffect } from "react";
import { X, Minus, Plus, Trash } from "lucide-react";
import useCartStore from "@/store/useCartStore";

export default function CartSidebar() {
  const {
    isCartOpen,
    cartItems,
    closeCart,
    increaseQty,
    decreaseQty,
    removeItem,
  } = useCartStore();

  return (
    <>
      {isCartOpen && (
        <div className="fixed inset-0 z-50" onClick={closeCart}></div>
      )}
      <div
        className={`fixed z-50 right-0 top-0 h-full w-80 bg-white shadow-lg p-4 transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-lg font-bold">Your Cart</h2>
          <button
            onClick={closeCart}
            className="text-gray-500 hover:text-black"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-4 border-b pb-2"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded"
                />
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-gray-500">${item.price.toLocaleString()}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <button
                      onClick={() => decreaseQty(item.id)}
                      className="p-1 bg-gray-200 rounded"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-2">{item.quantity}</span>
                    <button
                      onClick={() => increaseQty(item.id)}
                      className="p-1 bg-gray-200 rounded"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500"
                >
                  <Trash size={16} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">Your cart is empty</p>
          )}
        </div>
      </div>
    </>
  );
}
