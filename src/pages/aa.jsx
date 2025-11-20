import React from "react";
import { Link, NavLink } from "react-router-dom";

export default function Aa() {
  return (
    <div className="font-sans bg-sky-100 min-h-screen">
      {/* ===== Top Bar ===== */}
      <div className="w-full bg-black text-white flex justify-between items-center px-4 py-1 text-sm">
        <span className="ml-2"></span>
        <span className="mr-2">Tue 19 Aug 15:50</span>
      </div>

      {/* ===== Navbar ===== */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-[#8D1D2E]">
            Aura<span className="text-[#6A0DAD]">Match</span>
          </Link>

          {/* Menu */}
          <nav className="hidden md:flex gap-6 font-medium">
            <NavLink to="/" className="hover:text-pink-500 transition">
              Home
            </NavLink>
            <NavLink to="/analysis" className="hover:text-pink-500 transition">
              Analysis
            </NavLink>
            <NavLink to="/advisor" className="hover:text-pink-500 transition">
              Advisor
            </NavLink>
            <NavLink to="/cosmetics" className="hover:text-pink-500 transition">
              Cosmetics
            </NavLink>
            <NavLink to="/looks" className="hover:text-pink-500 transition">
              Looks
            </NavLink>
            <NavLink to="/about" className="hover:text-pink-500 transition">
              About Us
            </NavLink>
          </nav>

          {/* Burger menu (mobile) */}
          <button className="md:hidden p-2 rounded-lg border border-[#E6DCEB]">
            ☰
          </button>
        </div>
      </header>

      {/* ===== Hero Section ===== */}
      <section
        className="relative"
        style={{
          backgroundImage: "url('/assets/home.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 to-pink-200/60" />
        <div className="relative max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center px-6 py-20">
          {/* Text */}
          <div className="text-center md:text-left">
            <span className="inline-block bg-white/90 border rounded-full px-4 py-1 mb-4 text-[#4C0B0B] text-sm font-medium shadow">
              AI Beauty Advisor
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#4C0B0B] leading-tight drop-shadow">
              Facial structure <br /> &amp; color tone
            </h2>
            <p className="mt-2 text-[#4C0B0B] font-semibold">analysis for you</p>
            <button className="mt-6 bg-[#4C0B0B] text-white px-6 py-3 rounded-lg shadow-lg hover:bg-[#6A0DAD] transition transform hover:scale-105">
              Upload photo
            </button>
            <p className="mt-6 text-sm text-gray-800 max-w-md mx-auto md:mx-0">
              Upload your face photo and let AI analyze your facial structure
              and personal color, then receive makeup recommendations and
              products in shades that match your skin tone.
            </p>
          </div>

          {/* Image */}
          <div className="flex justify-center mt-8 md:mt-0">
            <img
              src="/assets/home.webp"
              alt="model"
              className="rounded-2xl shadow-2xl w-72 md:w-[28rem] hover:scale-105 transition-transform"
            />
          </div>
        </div>

        {/* scallop divider */}
        <div className="w-full bg-[#4C0B0B] h-10 flex">
          <div className="w-full bg-[#4C0B0B] [clip-path:polygon(0%_100%,50%_0%,100%_100%)]"></div>
        </div>
      </section>

      {/* ===== What is Personal color ===== */}
      <section className="max-w-4xl mx-auto text-center py-16 px-6">
        <h2 className="text-3xl font-bold text-[#4C0B0B] mb-6">
          What is Personal color ?
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          It is a colorology theory that finds the best colors for a person’s
          skin tone. Theory is based on harmony of colors, divided into four
          season types.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Personal color highlights your strengths, covers weaknesses, and
          creates a confident image. It also affects psychological conditions
          and lifestyle, enabling a richer, more stable life.
        </p>
        <div className="mt-10">
          <span className="inline-block bg-pink-200 px-8 py-4 rounded-lg text-[#4C0B0B] font-semibold shadow">
            Personal Color categorizes the four seasons
          </span>
        </div>
      </section>

      {/* ===== Warm tone Autumn ===== */}
      <section className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl px-6 md:px-12 py-12 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* รูป Autumn Girl */}
          <div className="flex justify-center">
            <img
              src="/autumn/autumngirl.jpg"
              alt="Autumn girl"
              className="w-96 md:w-[32rem] rounded-full shadow-2xl border-4 border-white hover:scale-105 transition-transform"
            />
          </div>

          {/* ข้อความอธิบาย */}
          <div>
            <h3 className="text-3xl font-bold text-[#4C0B0B] mb-4">
              <span className="text-orange-700">Warm tone</span> Autumn
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Autumn types often have darker, warmer eyes like olive green,
              hazel, amber, or golden brown. Their skin tones are warm, so gold
              jewelry pops, but silver may wash them out.
            </p>
            <p className="mt-4 text-gray-700 leading-relaxed">
              Hair often has golden, reddish, or brown hues — from golden blonde
              to auburn or dark golden brown.
            </p>
          </div>
        </div>

        {/* Skin + Eyes + Hair */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Skin */}
          <div className="rounded-2xl p-6 shadow hover:shadow-md transition bg-white">
            <p className="font-semibold text-center mb-4 text-[#4C0B0B]">Skin</p>
            <div className="flex justify-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#E7C29D] shadow" />
              <div className="w-14 h-14 rounded-full bg-[#D6A77A] shadow" />
              <div className="w-14 h-14 rounded-full bg-[#C18B60] shadow" />
            </div>
          </div>

          {/* Eyes */}
          <div className="rounded-2xl p-6 shadow hover:shadow-md transition bg-white">
            <p className="font-semibold text-center mb-4 text-[#4C0B0B]">Eyes</p>
            <div className="flex justify-center gap-3 flex-wrap">
              <img src="/eye/eye1.jpg" alt="dark hazel" className="w-14 h-14 object-cover rounded-full shadow hover:scale-110 transition" />
              <img src="/eye/eye2.jpg" alt="olive green" className="w-14 h-14 object-cover rounded-full shadow hover:scale-110 transition" />
              <img src="/eye/eye3.jpg" alt="amber" className="w-14 h-14 object-cover rounded-full shadow hover:scale-110 transition" />
              <img src="/eye/eye4.jpg" alt="golden brown" className="w-14 h-14 object-cover rounded-full shadow hover:scale-110 transition" />
            </div>
          </div>

          {/* Hair */}
          <div className="rounded-2xl p-6 shadow hover:shadow-md transition bg-white">
            <p className="font-semibold text-center mb-4 text-[#4C0B0B]">Hair</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#DDB67D] w-16 h-16 rounded-xl shadow" />
              <div className="bg-[#A3522E] w-16 h-16 rounded-xl shadow" />
              <div className="bg-[#8C4E2C] w-16 h-16 rounded-xl shadow" />
              <div className="bg-[#C08457] w-16 h-16 rounded-xl shadow" />
              <div className="bg-[#A36840] w-16 h-16 rounded-xl shadow" />
              <div className="bg-[#6B3A20] w-16 h-16 rounded-xl shadow" />
            </div>
          </div>
        </div>

        {/* Palettes */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="rounded-2xl p-6 text-center shadow hover:shadow-md transition bg-white">
            <img
              src="/palettes/dark-autumn.jpg"
              alt="dark autumn"
              className="mx-auto w-40 h-40 object-contain shadow-md rounded-xl hover:scale-105 transition"
            />
            <p className="mt-4 font-medium text-[#4C0B0B]">Dark Autumn</p>
          </div>
          <div className="rounded-2xl p-6 text-center shadow hover:shadow-md transition bg-white">
            <img
              src="/palettes/warm-autumn.jpg"
              alt="warm autumn"
              className="mx-auto w-40 h-40 object-contain shadow-md rounded-xl hover:scale-105 transition"
            />
            <p className="mt-4 font-medium text-[#4C0B0B]">Warm Autumn</p>
          </div>
          <div className="rounded-2xl p-6 text-center shadow hover:shadow-md transition bg-white">
            <img
              src="/palettes/soft-autumn.jpg"
              alt="soft autumn"
              className="mx-auto w-40 h-40 object-contain shadow-md rounded-xl hover:scale-105 transition"
            />
            <p className="mt-4 font-medium text-[#4C0B0B]">Soft Autumn</p>
          </div>
        </div>
      </section>
    </div>
  );
}
