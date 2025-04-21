"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "./carousel.css"; // Custom styles for pagination

export default function Carousel({ images }) {
  return (
    <div className="relative w-full mx-auto px-4 sm:px-6 md:px-8 pt-8 sm:pt-12">
      <div className="max-w-7xl mx-auto">
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          loop={true}
          pagination={{
            el: ".custom-pagination",
            clickable: true,
            bulletClass: "swiper-pagination-bullet",
            bulletActiveClass: "swiper-pagination-bullet-active",
          }}
          className="w-full rounded-lg overflow-hidden shadow-lg"
        >
          {images.map((src, index) => (
            <SwiperSlide key={index}>
              {/* Mobile View - Square Aspect Ratio */}
              <div className="block md:hidden">
                <div
                  className="relative w-full"
                  style={{ paddingBottom: "100%" }}
                >
                  <img
                    src={src}
                    alt={`Slide ${index}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Desktop View - Landscape Aspect Ratio */}
              <div className="hidden md:block">
                <div
                  className="relative w-full"
                  style={{ paddingBottom: "40%" }}
                >
                  <img
                    src={src}
                    alt={`Slide ${index}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Pagination */}
        <div className="w-auto bg-red-500 relative">
        <div className="absolute bottom-0 left-0 flex justify-end md:justify-end pb-2 z-50 w-full md:w-1/4">
          <div className="custom-pagination"></div>
        </div>
        </div>
      </div>
    </div>
  );
}
