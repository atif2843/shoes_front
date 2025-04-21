"use client";

import { CreditCard, Truck, ShieldCheck, X } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTwitter,
  faInstagram,
  faFacebook,
} from "@fortawesome/free-brands-svg-icons";
import { useState } from "react";
import supabase from "@/app/api/auth/supabaseClient";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError("");
      
      // Insert email into the newsletter table
      const { error } = await supabase
        .from("newsletter")
        .insert([{ email }]);
      
      if (error) throw error;
      
      // Show success popup
      setShowSuccessPopup(true);
      setEmail("");
      
      /* Hide popup after 3 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
      */

    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      setError("Failed to subscribe. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-cyan-600 text-white py-10 px-6 md:px-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:item-center">
        {/* Brand Info */}
        <div>
          <h2 className="text-lg font-bold">SUPER JUMP</h2>
          <p className="text-sm mt-2">
            Superjump offers this website, including all information, tools, and
            services available from this site to you, the user, policies, and
            notices stated here.
          </p>
        </div>

        {/* Info Links */}
        <div className="grid grid-cols-2 gap-4 mt-4 md:mt-0">
          <div>
            <h3 className="text-md font-semibold">INFO</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Contact Us</li>
              <li>Releases</li>
              <li>Brands</li>
            </ul>
          </div>
          <div>
            <h3 className="text-md font-semibold">POLICIES</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Help Center</li>
              <li>Privacy Policy</li>
              <li>Returns & Exchange</li>
              <li>Terms & Conditions</li>
              <li>Order & Shipping</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h3 className="text-md font-semibold">Sign Up to Our Newsletter</h3>
          <p className="text-sm mt-2">
            Get the latest beauty secrets and trends. Sign up for our newsletter
            and stay informed about all things beauty.
          </p>
          <form onSubmit={handleSubscribe} className="mt-3 flex sm:flex-row flex-col items-center flex-wrap">
            <div className="flex w-full sm:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email"
                className="p-2 flex-1 text-black rounded-md border border-white/20 outline-0"
                required
              />
              <button 
                type="submit" 
                className="bg-white text-black px-4 py-2 rounded-md ml-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Subscribing..." : "Submit"}
              </button>
            </div>
          </form>
          {error && <p className="text-red-300 text-sm mt-2">{error}</p>}
        </div>
      </div>

      {/* Social Media & Icons */}
      <div className="max-w-6xl mx-auto mt-8 flex flex-col md:flex-row justify-between items-center border-t border-white/20 pt-4">
        {/* Social Icons */}
        <div className="flex space-x-4">
          <FontAwesomeIcon
            icon={faTwitter}
            className="w-5 h-5 cursor-pointer hover:text-gray-300"
          />
          <FontAwesomeIcon
            icon={faInstagram}
            className="w-5 h-5 cursor-pointer hover:text-gray-300"
          />
          <FontAwesomeIcon
            icon={faFacebook}
            className="w-5 h-5 cursor-pointer hover:text-gray-300"
          />
        </div>

        {/* Security & Services Icons */}
        <div className="flex space-x-6 mt-4 md:mt-0 text-sm flex-wrap justify-center gap-4">
          <div className="flex items-center space-x-1">
            <CreditCard size={18} /> <span>Secure Payments</span>
          </div>
          <div className="flex items-center space-x-1">
            <Truck size={18} /> <span>Free Delivery</span>
          </div>
          <div className="flex items-center space-x-1 ">
            <ShieldCheck size={18} /> <span>100% Genuine</span>
          </div>
        </div>
      </div>

      {/* Footer Bottom Text */}
      <div className="max-w-6xl mx-auto mt-6 text-center text-sm">
        <span className="font-semibold">Superjump</span> created and maintained
        by <span className="font-semibold">Corpnix</span>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent backdrop-blur-sm animate-fadeIn">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 relative transform transition-all animate-scaleIn">
            <button 
              onClick={() => setShowSuccessPopup(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-800">Successfully Subscribed!</h3>
              <p className="text-gray-600">Thank you for subscribing to our newsletter. We'll keep you updated with the latest news and offers.</p>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
