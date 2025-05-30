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
    <div className="pt-12 sm:pt-16 md:pt-14 lg:pt-8 relative w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={0}
          slidesPerView={1}
          loop={true}
          autoplay={false}
          pagination={{
            el: ".custom-pagination",
            clickable: true,
            bulletClass: "swiper-pagination-bullet",
            bulletActiveClass: "swiper-pagination-bullet-active",
          }}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          className="w-full rounded-lg overflow-hidden shadow-lg relative"
        >
          {images.map((src, index) => (
            <SwiperSlide key={index}>
              {/* Mobile View - Square Aspect Ratio */}
              <div className="block md:hidden">
                <div
                  className="relative w-full"
                  style={{ paddingBottom: "100%" }}
                >
                  <Image
                    src={src}
                    height="100"
                    width="100"
                    alt={`Slide ${index}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </div>
              </div>

              {/* Tablet View - Slightly taller aspect ratio */}
              <div className="hidden md:block lg:hidden">
                <div
                  className="relative w-full"
                  style={{ paddingBottom: "50%" }}
                >
                  <Image
                    height="100"
                    width="100"
                    src={src}
                    alt={`Slide ${index}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </div>
              </div>

              {/* Desktop View - Landscape Aspect Ratio */}
              <div className="hidden lg:block">
                <div
                  className="relative w-full"
                  style={{ paddingBottom: "40%" }}
                >
                  <img
                    src={src}
                    alt={`Slide ${index}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </div>
              </div>
              
              {/* Overlay text - responsive based on screen size */}
              <div className="absolute height-fit left-0 top-100 inset-0 flex flex-col justify-end items-center text-white p-4 sm:p-6 md:p-8 z-10 translate-x-0 translate-y-1 bg-black/50">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-2 sm:mb-4">
                  Featured Collection
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-center mb-4 sm:mb-6 max-w-md">
                  Discover our latest arrivals and trending styles
                </p>
                <button className="bg-white text-black px-4 py-2 rounded-md text-sm sm:text-base font-medium hover:bg-gray-100 transition-colors">
                  Shop Now
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Pagination - Visible on all devices but styled differently */}
        <div className="w-auto relative hidden md:block">
          <div className={`absolute bottom-4 sm:bottom-6 left-0 flex ${isMobile ? 'justify-center' : 'justify-end'} z-30 w-full ${isMobile ? '' : 'md:w-1/4'}`}>
            <div className="custom-pagination"></div>
          </div>
        </div>
              
      </div>
    </div>
  );
}
