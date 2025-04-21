import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/app/context/CartContext";
import LoginModal from "./components/LoginModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Shoe Ecommerce",
  description: "Your one-stop shop for shoes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          {children}
          <LoginModal />
        </CartProvider>
      </body>
    </html>
  );
}
