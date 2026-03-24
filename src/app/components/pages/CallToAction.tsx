import React from "react"
import Link from "next/link"

export default function CallToAction() {
  return (
    <section className="bg-white py-12 md:py-16 w-full">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-[#1b2a80] sm:text-4xl">
            Ready to start renting?
          </h2>
          <p className="mt-4 text-lg text-gray-600 mb-8">
            Join our community today. Find the equipment you need or start earning money by listing
            your own items.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#1b2a80] hover:bg-blue-800 transition-colors shadow-sm"
            >
              Sign Up Now
            </Link>
            <Link
              href="/products"
              className="inline-flex justify-center items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-[#1b2a80] bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              Browse All Items
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
