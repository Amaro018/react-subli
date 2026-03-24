import { invoke } from "./blitz-server"

import getCurrentUser from "./users/queries/getCurrentUser"
import Navbar from "./components/Navbar"
import { redirect } from "next/navigation"
import CategorySection from "./components/pages/CategorySection"

import HeroSection from "./components/pages/HeroSection"
import Footer from "./components/Footer"
import TrendingRentals from "./components/pages/TrendingRentals"
import NewArrivals from "./components/pages/NewArrivals"
import TopShops from "./components/pages/TopShops"
import HowItWorks from "./components/pages/HowItWorks"
import TestimonialSection from "./components/pages/TestimonialSection"
import FAQSection from "./components/pages/FAQSection"
import CallToAction from "./components/pages/CallToAction"

export default async function Home() {
  const currentUser = await invoke(getCurrentUser, null)

  if (currentUser && currentUser.role === "ADMIN") {
    redirect("/admin")
  }

  return (
    <>
      <div className="flex h-full flex-col overflow-y-auto scrollbar-seamless">
        <Navbar currentUser={currentUser} />
        <HeroSection />
        <CategorySection />
        <TrendingRentals />
        <NewArrivals />
        <TopShops />
        <HowItWorks />
        <TestimonialSection />
        <FAQSection />
        <CallToAction />
        <Footer />
      </div>
    </>
  )
}
