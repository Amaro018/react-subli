import React from "react"
import { invoke } from "../blitz-server"
import getCurrentUser from "../users/queries/getCurrentUser"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import Link from "next/link"

import EmailIcon from "@mui/icons-material/Email"
import PhoneIcon from "@mui/icons-material/Phone"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import SendIcon from "@mui/icons-material/Send"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"

export default async function ContactPage() {
  const currentUser = await invoke(getCurrentUser, null)

  return (
    <div className="flex h-full flex-col overflow-y-auto scrollbar-seamless">
      <Navbar currentUser={currentUser} />

      <main className="flex-grow bg-gray-50">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#eef3ff] via-white to-[#e8f7ff]">
          <div className="mx-auto flex min-h-[360px] w-full max-w-[1400px] items-center px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="w-full text-center">
              <div className="mb-5 inline-flex items-center rounded-full bg-[#1b2a80]/10 px-4 py-2 text-sm font-semibold text-[#1b2a80]">
                Get in Touch
              </div>

              <h1 className="text-4xl font-bold leading-tight text-[#1b2a80] sm:text-5xl">
                We’re Here to Help
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
                Have a question about SUBLI, rental products, shops, or your account? Send us a
                message and our team will be happy to help.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            CONTACT INFORMATION + FORM
        ===================================================== */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-5">
              {/* =================================================
                  CONTACT INFORMATION
              ================================================= */}
              <div className="lg:col-span-2">
                <div className="h-full rounded-3xl bg-[#1b2a80] p-8 text-white shadow-xl sm:p-10">
                  <span className="text-sm font-bold uppercase tracking-wider text-blue-200">
                    Contact Information
                  </span>

                  <h2 className="mt-3 text-3xl font-bold">Let’s Talk</h2>

                  <p className="mt-4 leading-7 text-blue-100">
                    Whether you are a renter looking for assistance or a shop owner interested in
                    SUBLI, we are ready to assist you.
                  </p>

                  <div className="mt-10 space-y-7">
                    {/* Email */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                        <EmailIcon />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-blue-200">Email</p>

                        <p className="mt-1 text-sm sm:text-base">support@subli.com</p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                        <PhoneIcon />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-blue-200">Phone</p>

                        <p className="mt-1 text-sm sm:text-base">+63 900 000 0000</p>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                        <LocationOnIcon />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-blue-200">Address</p>

                        <p className="mt-1 text-sm leading-6 sm:text-base">
                          Legazpi City, Albay, Philippines
                        </p>
                      </div>
                    </div>

                    {/* Hours */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                        <AccessTimeIcon />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-blue-200">Support Hours</p>

                        <p className="mt-1 text-sm leading-6 sm:text-base">
                          Monday – Friday
                          <br />
                          8:00 AM – 5:00 PM
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================
                  CONTACT FORM
              ================================================= */}
              <div className="lg:col-span-3">
                <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm sm:p-10">
                  <div className="mb-8">
                    <span className="text-sm font-bold uppercase tracking-wider text-[#1b2a80]">
                      Send Us a Message
                    </span>

                    <h2 className="mt-2 text-3xl font-bold text-gray-900">How Can We Help?</h2>

                    <p className="mt-3 text-sm leading-6 text-gray-500">
                      Fill out the form below and provide as much information as possible so we can
                      assist you better.
                    </p>
                  </div>

                  <form className="space-y-5">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-semibold text-gray-700"
                      >
                        Full Name
                      </label>

                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-800 outline-none transition focus:border-[#1b2a80] focus:bg-white focus:ring-2 focus:ring-[#1b2a80]/10"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-semibold text-gray-700"
                      >
                        Email Address
                      </label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email address"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-800 outline-none transition focus:border-[#1b2a80] focus:bg-white focus:ring-2 focus:ring-[#1b2a80]/10"
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label
                        htmlFor="subject"
                        className="mb-2 block text-sm font-semibold text-gray-700"
                      >
                        Subject
                      </label>

                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        placeholder="What is your message about?"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-800 outline-none transition focus:border-[#1b2a80] focus:bg-white focus:ring-2 focus:ring-[#1b2a80]/10"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        htmlFor="message"
                        className="mb-2 block text-sm font-semibold text-gray-700"
                      >
                        Message
                      </label>

                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        placeholder="Write your message here..."
                        className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-800 outline-none transition focus:border-[#1b2a80] focus:bg-white focus:ring-2 focus:ring-[#1b2a80]/10"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b2a80] px-6 py-3.5 font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#142064] hover:shadow-lg"
                    >
                      Send Message
                      <SendIcon fontSize="small" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            QUICK HELP
        ===================================================== */}
        <section className="bg-gray-50 py-16 sm:py-20">
          <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1b2a80]/10">
                <HelpOutlineIcon className="text-[#1b2a80]" sx={{ fontSize: 30 }} />
              </div>

              <h2 className="mt-5 text-3xl font-bold text-gray-900">Looking for Quick Answers?</h2>

              <p className="mt-4 leading-7 text-gray-600">
                You may find the information you need in our help resources. If you still need
                assistance, feel free to contact us.
              </p>

              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/help"
                  className="inline-flex items-center justify-center rounded-xl bg-[#1b2a80] px-6 py-3 font-semibold text-white transition hover:bg-[#142064]"
                >
                  Visit Help Center
                </Link>

                <Link
                  href="/about"
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 font-semibold text-[#1b2a80] transition hover:bg-gray-100"
                >
                  Learn About SUBLI
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FINAL CTA
        ===================================================== */}
        <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1400px] overflow-hidden rounded-3xl bg-[#1b2a80] px-6 py-14 text-center shadow-xl sm:px-10">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to Start Renting?</h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-blue-100">
              Explore rental products and discover shops available through SUBLI.
            </p>

            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-bold text-[#1b2a80] shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Browse Products
              <SendIcon fontSize="small" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
