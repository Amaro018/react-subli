import React from "react"
import { invoke } from "../blitz-server"
import getCurrentUser from "../users/queries/getCurrentUser"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import Link from "next/link"

import SearchIcon from "@mui/icons-material/Search"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import StorefrontIcon from "@mui/icons-material/Storefront"
import Inventory2Icon from "@mui/icons-material/Inventory2"
import HandshakeIcon from "@mui/icons-material/Handshake"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"

export default async function AboutPage() {
  const currentUser = await invoke(getCurrentUser, null)

  return (
    <div className="flex h-full flex-col overflow-y-auto scrollbar-seamless">
      <Navbar currentUser={currentUser} />

      <main className="flex-grow bg-gray-50">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#eef3ff] via-white to-[#e8f7ff]">
          <div className="mx-auto grid min-h-[430px] w-full max-w-[1400px] items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:px-8 lg:py-20">
            {/* Left Content */}
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center rounded-full bg-[#1b2a80]/10 px-4 py-2 text-sm font-semibold text-[#1b2a80]">
                About SUBLI
              </div>

              <h1 className="text-4xl font-bold leading-tight text-[#1b2a80] sm:text-5xl lg:text-6xl">
                Making Rentals
                <span className="block text-gray-800">Easier for Everyone.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
                SUBLI is an online rental shops portal designed to connect renters with local rental
                shops in one convenient platform. Browse products, compare rental options, check
                availability, and reserve what you need with ease.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1b2a80] px-6 py-3.5 font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#142064] hover:shadow-lg"
                >
                  Browse Rentals
                  <ArrowForwardIcon fontSize="small" />
                </Link>

                <Link
                  href="/shops"
                  className="inline-flex items-center justify-center rounded-xl border border-[#1b2a80]/20 bg-white px-6 py-3.5 font-semibold text-[#1b2a80] transition-all hover:bg-[#1b2a80]/5"
                >
                  Explore Shops
                </Link>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative hidden md:block">
              <div className="relative mx-auto max-w-lg">
                {/* Main card */}
                <div className="overflow-hidden rounded-3xl bg-[#1b2a80] p-8 shadow-2xl">
                  <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                    <StorefrontIcon sx={{ fontSize: 70 }} className="text-white" />

                    <h2 className="mt-5 text-3xl font-bold text-white">SUBLI</h2>

                    <p className="mt-2 leading-6 text-blue-100">
                      Your online destination for convenient rental experiences.
                    </p>
                  </div>

                  {/* Floating mini cards */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white p-4">
                      <SearchIcon className="text-[#1b2a80]" />
                      <p className="mt-2 text-sm font-semibold text-gray-800">Find Rentals</p>
                    </div>

                    <div className="rounded-xl bg-white p-4">
                      <CalendarMonthIcon className="text-[#1b2a80]" />
                      <p className="mt-2 text-sm font-semibold text-gray-800">Check Availability</p>
                    </div>
                  </div>
                </div>

                {/* Decorative circles */}
                <div className="absolute -right-5 -top-5 -z-0 h-20 w-20 rounded-full bg-blue-200/60" />
                <div className="absolute -bottom-5 -left-5 -z-0 h-24 w-24 rounded-full bg-[#1b2a80]/10" />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            ABOUT SUBLI
        ===================================================== */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-sm font-bold uppercase tracking-wider text-[#1b2a80]">
                What is SUBLI?
              </span>

              <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
                One Platform. Multiple Rental Shops.
              </h2>

              <p className="mt-5 leading-7 text-gray-600">
                SUBLI was developed as an online rental shops portal that brings different rental
                businesses together in one platform. It helps renters find products they need
                without having to search through multiple rental shops individually.
              </p>

              <p className="mt-4 leading-7 text-gray-600">
                At the same time, SUBLI provides rental shop owners with tools for managing their
                shops, products, inventory, rental orders, and customer interactions more
                efficiently.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            WHY SUBLI
        ===================================================== */}
        <section className="bg-gray-50 py-16 sm:py-20">
          <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <span className="text-sm font-bold uppercase tracking-wider text-[#1b2a80]">
                Why SUBLI?
              </span>

              <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
                Designed to Make Renting Simpler
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-gray-600">
                SUBLI brings useful rental features together in a simple and convenient online
                experience.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1 */}
              <div className="group rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1b2a80]/10 transition-colors group-hover:bg-[#1b2a80]">
                  <SearchIcon
                    className="text-[#1b2a80] group-hover:text-white"
                    sx={{ fontSize: 28 }}
                  />
                </div>

                <h3 className="mt-5 text-lg font-bold text-gray-900">Easy to Find</h3>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Browse and search rental products from different shops in one convenient platform.
                </p>
              </div>

              {/* Card 2 */}
              <div className="group rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1b2a80]/10 transition-colors group-hover:bg-[#1b2a80]">
                  <CalendarMonthIcon
                    className="text-[#1b2a80] group-hover:text-white"
                    sx={{ fontSize: 28 }}
                  />
                </div>

                <h3 className="mt-5 text-lg font-bold text-gray-900">Easy to Reserve</h3>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Check product availability and reserve rental items based on your preferred
                  schedule.
                </p>
              </div>

              {/* Card 3 */}
              <div className="group rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1b2a80]/10 transition-colors group-hover:bg-[#1b2a80]">
                  <StorefrontIcon
                    className="text-[#1b2a80] group-hover:text-white"
                    sx={{ fontSize: 28 }}
                  />
                </div>

                <h3 className="mt-5 text-lg font-bold text-gray-900">Multiple Shops</h3>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Discover products and services from multiple participating rental shops through
                  one portal.
                </p>
              </div>

              {/* Card 4 */}
              <div className="group rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1b2a80]/10 transition-colors group-hover:bg-[#1b2a80]">
                  <HandshakeIcon
                    className="text-[#1b2a80] group-hover:text-white"
                    sx={{ fontSize: 28 }}
                  />
                </div>

                <h3 className="mt-5 text-lg font-bold text-gray-900">Better Experience</h3>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Reviews, ratings, messaging, and rental information help create a more convenient
                  rental experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <span className="text-sm font-bold uppercase tracking-wider text-[#1b2a80]">
                How It Works
              </span>

              <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
                Rent in Three Simple Steps
              </h2>
            </div>

            <div className="relative grid gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1b2a80] text-xl font-bold text-white shadow-lg">
                  1
                </div>

                <h3 className="mt-5 text-xl font-bold text-gray-900">Browse</h3>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-600">
                  Search through available rental products and explore different shops.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1b2a80] text-xl font-bold text-white shadow-lg">
                  2
                </div>

                <h3 className="mt-5 text-xl font-bold text-gray-900">Reserve</h3>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-600">
                  Choose your rental dates, quantity, and delivery method, then place your
                  reservation.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1b2a80] text-xl font-bold text-white shadow-lg">
                  3
                </div>

                <h3 className="mt-5 text-xl font-bold text-gray-900">Rent</h3>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-600">
                  Coordinate with the rental shop and enjoy your selected rental item.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FOR RENTAL SHOPS
        ===================================================== */}
        <section className="bg-[#f5f7ff] py-16 sm:py-20">
          <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              {/* Visual */}
              <div className="order-2 lg:order-1">
                <div className="rounded-3xl bg-[#1b2a80] p-8 shadow-xl">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white p-6">
                      <StorefrontIcon sx={{ fontSize: 40 }} className="text-[#1b2a80]" />

                      <h3 className="mt-4 font-bold text-gray-900">Manage Your Shop</h3>

                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        Keep your shop and rental listings organized.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-6">
                      <Inventory2Icon sx={{ fontSize: 40 }} className="text-[#1b2a80]" />

                      <h3 className="mt-4 font-bold text-gray-900">Manage Inventory</h3>

                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        Monitor available, rented, and damaged items.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="order-1 lg:order-2">
                <span className="text-sm font-bold uppercase tracking-wider text-[#1b2a80]">
                  For Rental Shops
                </span>

                <h2 className="mt-3 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
                  Grow Your Rental Business with SUBLI
                </h2>

                <p className="mt-5 leading-7 text-gray-600">
                  SUBLI gives rental shop owners an online space where they can showcase their
                  products and manage important rental activities.
                </p>

                <ul className="mt-6 space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1b2a80]/10 text-[#1b2a80]">
                      ✓
                    </span>

                    <span className="text-gray-700">Manage shop and product information</span>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1b2a80]/10 text-[#1b2a80]">
                      ✓
                    </span>

                    <span className="text-gray-700">Monitor rental inventory and availability</span>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1b2a80]/10 text-[#1b2a80]">
                      ✓
                    </span>

                    <span className="text-gray-700">
                      Manage rental orders and customer interactions
                    </span>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1b2a80]/10 text-[#1b2a80]">
                      ✓
                    </span>

                    <span className="text-gray-700">
                      Receive visibility through an online rental platform
                    </span>
                  </li>
                </ul>

                <Link
                  href="/renter/my-shop"
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#1b2a80] px-6 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-[#142064] hover:shadow-lg"
                >
                  Become a Rental Partner
                  <ArrowForwardIcon fontSize="small" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            MISSION & VISION
        ===================================================== */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Mission */}
              <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm sm:p-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1b2a80] text-white">
                  <HandshakeIcon sx={{ fontSize: 30 }} />
                </div>

                <h2 className="mt-6 text-2xl font-bold text-gray-900">Our Mission</h2>

                <p className="mt-4 leading-7 text-gray-600">
                  To provide a convenient online platform that makes rental products easier to
                  discover, compare, and reserve while helping rental shops manage their businesses
                  more efficiently.
                </p>
              </div>

              {/* Vision */}
              <div className="rounded-3xl border border-gray-100 bg-[#f5f7ff] p-8 shadow-sm sm:p-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1b2a80] text-white">
                  <StorefrontIcon sx={{ fontSize: 30 }} />
                </div>

                <h2 className="mt-6 text-2xl font-bold text-gray-900">Our Vision</h2>

                <p className="mt-4 leading-7 text-gray-600">
                  To create a centralized rental platform where renters and local rental businesses
                  can connect through a simple, accessible, and organized digital experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            CTA
        ===================================================== */}
        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1400px] overflow-hidden rounded-3xl bg-[#1b2a80] px-6 py-14 text-center shadow-xl sm:px-10">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ready to Find What You Need?
              </h2>

              <p className="mt-4 leading-7 text-blue-100">
                Explore rental products from participating shops and find the right item for your
                next event, activity, or occasion.
              </p>

              <Link
                href="/products"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-bold text-[#1b2a80] shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                Browse Products
                <ArrowForwardIcon fontSize="small" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
