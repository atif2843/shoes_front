"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import supabase from "../api/auth/supabaseClient";
import { useRouter } from "next/navigation"; // Next.js 13+

// Dynamically import all Leaflet components with SSR disabled
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
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
  const [isClient, setIsClient] = useState(false);
  const [customMarker, setCustomMarker] = useState(null);

  useEffect(() => {
    setIsClient(true);
    
    // Import Leaflet and set up marker icon only on the client side
    if (typeof window !== 'undefined') {
      import("leaflet/dist/leaflet.css");
      import("leaflet").then((L) => {
        const icon = new L.Icon({
          iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        setCustomMarker(icon);
      });
    }
  }, []);

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

  return (
    <section className="relative min-h-screen bg-white flex items-center justify-center ">

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-cyan-700 dark:text-cyan-300 mb-3">Get in Touch</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">We&apos;d love to hear from you!</p>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Fill out the form below or reach us directly at our office.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-7 bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-lg p-6 md:p-8 border border-cyan-100 dark:border-gray-800">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="font-semibold">Name</label>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border "
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-semibold">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border "
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="font-semibold">Phone number</label>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border "
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="font-semibold">Message (Optional)</label>
              <textarea
                name="message"
                placeholder="Message (Optional)"
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border "
              ></textarea>
            </div>
            {formErrors && <div className="text-red-500 text-sm font-medium">{formErrors}</div>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 rounded-lg shadow-xl transition-all text-lg tracking-wide uppercase"
            >
              Submit
            </button>
          </form>
          {/* Address & Map */}
          <div className="flex flex-col justify-between h-full rounded-2xl bg-white shadow-lg p-6 md:p-8 border">
            <div className="mb-8 space-y-7">
              <div className="flex items-center gap-3">
                <span className="inline-block bg-white p-2 rounded-full">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                </span>
                <div>
                  <h3 className="text-xl font-semibold">Our Address</h3>
                  <p className="text-gray-600 dark:text-gray-300">12th Road, Khar W, Near Madhu Park, Mumbai-400052</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-block bg-white p-2 rounded-full">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2.08a2 2 0 0 1 1.1-1.79l7-3.11a2 2 0 0 1 1.8 0l7 3.11a2 2 0 0 1 1.1 1.79z"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
                <div>
                  <h3 className="text-xl font-semibold">Contact</h3>
                  <p className="text-gray-600 dark:text-gray-300">+91 987-383-4473</p>
                  <p className="text-gray-600 dark:text-gray-300">info@suprjump.com</p>
                </div>
              </div>
            </div>
            {/* Google Maps */}
            {isClient && (
              <div className="rounded-xl overflow-hidden shadow-lg border border-cyan-100 dark:border-gray-800 h-64 md:h-72 w-full animate-fadeIn">
                <MapContainer
                  center={[19.120324086655422, 72.89253432774979]}
                  zoom={12}
                  className="h-full w-full z-0"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker
                    position={[19.120324086655422, 72.89253432774979]}
                    icon={customMarker}
                  >
                    <Popup>Our Mumbai Office</Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
