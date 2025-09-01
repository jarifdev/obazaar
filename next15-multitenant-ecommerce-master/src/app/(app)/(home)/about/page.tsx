import React from "react";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";

const poppins = Poppins({ subsets: ["latin"], weight: ["700"] });

const Page = () => {
  return (
    // Note: place the provided background image at `public/about-bg.png`
    <main
      className="relative min-h-[60vh] flex items-center justify-center bg-cover bg-center py-24"
      style={{ backgroundImage: `url('/about-bg.png')` }}
    >
      {/* subtle dark overlay to keep text readable */}
      <div className="absolute inset-0 bg-black/30" aria-hidden />
      <div className="relative max-w-4xl text-center px-6">
        <h1 className="text-6xl font-extrabold tracking-tight mb-6">ABOUT US</h1>
  <p className="text-lg text-black leading-relaxed">
         Welcome to Obazaar, your go-to online marketplace for small and home-based businesses. We believe in empowering entrepreneurs by providing them with a seamless platform to showcase their products, connect with customers, and grow their brands.

At Obazaar, we make online shopping easy and secure. Whether you're a seller looking to expand your reach or a buyer searching for unique, high-quality products, we bring the marketplace to your fingertips. With integrated payments and reliable delivery services, we ensure a hassle-free experience for everyone.


Join us in supporting small businesses and discovering amazing products—all in one place!
        </p>
      </div>

  {/* logo removed per request */}
    </main>
  );
};

export default Page;
