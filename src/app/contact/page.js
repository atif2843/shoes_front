import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Contact from "../components/Contact";



export default function Home ()
{
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Contact
        title="Get in Touch"
        description="Please fill out the form below to get in touch with us."
      />
      <Footer />
    </div>
  );
}
