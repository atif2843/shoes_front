"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import Image from 'next/image';
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./carousel.css";

export default function Carousel({ images }) {
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if device is mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <div className="relative w-full mx-auto">
      <div className="max-w-7xl mx-auto flex justify-center bg-black">
       <img src="/images/banner.png" width={100} height={100} className="w-auto h-auto lg:h-90" alt="asdlkj" />
      </div>
    </div>
  );
}
