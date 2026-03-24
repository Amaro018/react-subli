import React from "react"
import Link from "next/link"

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white pt-24 pb-12 md:pt-36 md:pb-16 w-full relative">
      {/* Optional subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
        <div className="absolute top-[10%] left-[-5%] w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
      </div>

      <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1b2a80] tracking-tight mb-6 max-w-4xl leading-tight">
          Rent anything you need, from people in your community.
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-2xl leading-relaxed">
          Save money by renting instead of buying. Have equipment gathering dust? List it today and
          start earning extra cash securely.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/products"
            className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-[#1b2a80] hover:bg-blue-800 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
          >
            Start Renting
          </Link>
          <Link
            href="/signup"
            className="inline-flex justify-center items-center px-8 py-4 border-2 border-[#1b2a80] text-lg font-bold rounded-xl text-[#1b2a80] bg-white hover:bg-blue-50 transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
          >
            List an Item
          </Link>
        </div>
      </div>
    </section>
  )
}
