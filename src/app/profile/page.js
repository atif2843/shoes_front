"use client";
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import UserProfile from "../components/UserProfile";

export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <UserProfile />
      <Footer />
    </div>
  );
}
