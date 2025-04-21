"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";
import supabase from "../api/auth/supabaseClient";
import { useRouter } from "next/navigation"; // Next.js 13+

const DynamicMap = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

export default function Contact() {
  const router = useRouter(); // Initialize router

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      setFormErrors("Please fill all required fields.");
      return;
    }

    // Insert new record if no existing email/phone
    const { data, error } = await supabase
      .from("enquiries")
      .insert([
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          message: formData.message.trim() || null,
        },
      ])
      .select();

    if (error) {
      setFormErrors(error.message);
      return;
    }

    if (data) {
      alert("Your message has been sent successfully!");
      router.push("/");
      setFormErrors(null);
    }
  };

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const customMarker = new L.Icon({
    iconUrl: markerIconPng,
    shadowUrl: markerShadowPng,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <div className="container mx-auto px-8 py-28 ">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 flex items-center space-x-2 mb-4">
        <span>Home</span> <span className="text-gray-400">/</span>
        <span className="text-black font-medium">Contact</span>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-6">Get in Touch</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {formErrors && <div className="mt-4 text-red-500">{formErrors}</div>}
        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="name" className="block font-medium text-black mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          <label htmlFor="email" className="block font-medium text-black mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          <label htmlFor="phone" className="block font-medium text-black mb-1">
            Phone number
          </label>
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          <label
            htmlFor="message"
            className="block font-medium text-black mb-1"
          >
            Message (Optional)
          </label>
          <textarea
            name="message"
            placeholder="Message (Optional)"
            value={formData.message}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          ></textarea>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </form>

        {/* Address */}
        <div className="space-y-4 flex md:flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold">Our Address</h3>
            <p>12th Road, Khar W, Near Madhu Park, Mumbai-400052</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Contact</h3>
            <p>+91 987-383-4473</p>
            <p>info@suprjump.com</p>
          </div>
        </div>
      </div>

      {/* Google Maps */}
      {isClient && (
        <div className="mt-8 h-96">
          <DynamicMap
            center={[19.120324086655422, 72.89253432774979]}
            zoom={12}
            className="h-full w-full"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker
              position={[19.120324086655422, 72.89253432774979]}
              icon={customMarker}
            >
              <Popup>Our Mumbai Office</Popup>
            </Marker>
          </DynamicMap>
        </div>
      )}
    </div>
  );
}
