"use client";
import React from "react";
import Footer from "../components/Footer";
import UserProfile from "../components/UserProfile";

export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-100">
      <UserProfile />
      <Footer />
    </div>
  );
}
