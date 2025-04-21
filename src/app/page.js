import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Brands from "./components/Brands";
import Trending from "./components/Trending";
import ShopBySport from "./components/ShopBySport";
import Newarrival from "./components/Newarrival";
import Ads from "./components/Ads";
import TopBrands from "./components/TopBrands";
import Footer from "./components/Footer";
import React from "react";
const HeroImages = [
  "/images/adidas1.png",
  "/images/nike.png",
  "/images/adidas.jpg",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Hero images={HeroImages} />
      <Brands />
      <Trending />
      <ShopBySport />
      <Newarrival />
      <Ads />
      <TopBrands />
      <Footer />
    </div>
  );
}
