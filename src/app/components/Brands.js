"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import supabase from "../api/auth/supabaseClient";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .order('name');

        if (error) throw error;
        setBrands(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  if (loading) {
    return (
      <div className="py-12 px-8 bg-white">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 px-8 bg-white">
        <div className="text-red-500 text-center">Error: {error}</div>
      </div>
    );
  }

  return (
    <section className="py-12 px-4 sm:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Our Brands</h2>
        <div className="relative">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={2}
            navigation
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              // Mobile
              320: {
                slidesPerView: 2,
                spaceBetween: 10,
              },
              // Tablet
              640: {
                slidesPerView: 3,
                spaceBetween: 15,
              },
              // Desktop
              1024: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
              // Large Desktop
              1280: {
                slidesPerView: 6,
                spaceBetween: 20,
              },
            }}
            className="brands-slider"
          >
            {brands.map((brand) => (
              <SwiperSlide key={brand.id}>
                <Link 
                  href={`/brands/${brand.slug}`}
                  className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100 h-full"
                >
                  <img
                    src={brand.images}
                    alt={brand.name}
                    className="h-16 w-auto object-contain mb-2"
                  />
                  <span className="text-sm font-medium text-gray-700">{brand.name}</span>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <style jsx global>{`
        .brands-slider {
          padding: 10px 0;
        }
        .brands-slider .swiper-button-next,
        .brands-slider .swiper-button-prev {
          color: #0891b2;
          background: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .brands-slider .swiper-button-next:after,
        .brands-slider .swiper-button-prev:after {
          font-size: 18px;
        }
        .brands-slider .swiper-button-disabled {
          opacity: 0.5;
        }
        @media (max-width: 640px) {
          .brands-slider .swiper-button-next,
          .brands-slider .swiper-button-prev {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
