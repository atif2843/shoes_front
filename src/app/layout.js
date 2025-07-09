import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/app/context/CartContext";
import LoginModal from "./components/LoginModal";
import Navbar from "./components/Navbar";
import Breadcrumb from "./components/Breadcrumb";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kicksneak | Trendy Sneakers & Footwear for Men & Women",
  description: "Shop the latest sneakers, running shoes, and casual footwear at Kicksneak. Discover top brands, exclusive drops, and unbeatable deals for men and women. Fast shipping and easy returns.",
  keywords: "sneakers, shoes online, men's sneakers, women's sneakers, casual shoes, running shoes, buy shoes online, Kicksneak, sneaker store, athletic shoes, trendy footwear, shoe sale"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">  
      <body className={`${inter.className} overflow-x-hidden`}>
        <CartProvider>
          <Navbar />
          <main>
            <Breadcrumb />
            {children}
          </main>
          <LoginModal />
        </CartProvider>
      </body>
    </html>
  );
}
