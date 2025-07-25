"use client";
import Image from "next/image";
import Link from "next/link";

const promotions = [
  {
    id: 1,
    image: "/images/ads/ads.jpeg", // Adjusted path
    title: "SNEAKERS",
    subtitle: "Limited Edition Shoes",
    buttonText: "Explore Now",
    link: "/products",
    large: true,
  },
  {
    id: 2,
    image: "/images/ads/ads2.jpg",
    title: "SAMBA OG",
    buttonText: "Explore Now",
    link: "/products",
    large: false,
  },
  {
    id: 3,
    image: "/images/ads/ads3.jpg",
    title: "NIKE",
    buttonText: "Explore Now",
    link: "/products",
    large: false,
  },
];

export default function Ads() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-8 py-10">
      {/* Large Banner */}
      <div className="relative col-span-1 md:col-span-2 h-[420px] ">
        <Image
          src={promotions[0].image}
          alt={promotions[0].title}
          fill
          className="rounded-2xl object-cover z-0"
        />
        <div className="absolute inset-0 rounded-2xl z-10 bg-gradient-to-t from-black to-transparent opacity-70">
          {/* Overlay */}
        </div>
        <div className="absolute inset-0  rounded-2xl flex flex-col justify-end p-6 text-white z-10">
          <p className="text-sm">{promotions[0].subtitle}</p>
          <h2 className="text-2xl font-bold">{promotions[0].title}</h2>
          <Link href={promotions[0].link} className="mt-2 text-blue-400 hover:underline">
          <button className="mt-3 px-4 py-2 bg-white text-black rounded-md w-max">
            {promotions[0].buttonText}
          </button>
          </Link>
        </div>
      </div>

      {/* Right stacked banners */}
      <div className="flex flex-col gap-4">
        {promotions.slice(1).map((promo) => (
          <div key={promo.id} className="relative h-[200px]">
            <Image
              src={promo.image}
              alt={promo.title}
              fill
              className="rounded-2xl object-cover"
            />
            <div className="absolute inset-0 rounded-2xl z-10 bg-gradient-to-t from-black to-transparent opacity-70">
              {/* Overlay */}
            </div>
            <div className="absolute inset-0 rounded-2xl flex flex-col justify-end p-4 text-white z-10">
              <h3 className="text-lg font-bold">{promo.title}</h3>
               <Link href={promo.link} className="mt-2 text-blue-400 hover:underline">
              <button className="mt-2 px-3 py-1 bg-white text-black rounded-md w-max">
                {promo.buttonText}
              </button>
            </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
