import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/app/context/CartContext";
import LoginModal from "./components/LoginModal";
import Navbar from "./components/Navbar";
import Breadcrumb from "./components/Breadcrumb";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Shoe Ecommerce",
  description: "Your one-stop shop for shoes",
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
