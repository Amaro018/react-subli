import React from "react"
import SearchIcon from "@mui/icons-material/Search"
import LocalShippingIcon from "@mui/icons-material/LocalShipping"
import AutorenewIcon from "@mui/icons-material/Autorenew"

const steps = [
  {
    id: 1,
    title: "Find & Book",
    description:
      "Browse our categories, find the equipment you need, and select your rental dates.",
    icon: SearchIcon,
  },
  {
    id: 2,
    title: "Receive It",
    description:
      "Pick up your items directly from the shop or have them safely delivered to your event.",
    icon: LocalShippingIcon,
  },
  {
    id: 3,
    title: "Return",
    description:
      "Enjoy your rental! When you're done, simply pack it up and return it to the shop.",
    icon: AutorenewIcon,
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-gray-50 py-12 md:py-16 w-full">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1b2a80] sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-lg text-gray-600">
            Renting top-quality equipment is as easy as 1-2-3.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-8">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.id}
                className="relative flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
              >
                <div className="absolute -top-5 bg-[#1b2a80] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md border-4 border-gray-50">
                  {step.id}
                </div>
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-5 mt-2">
                  <Icon fontSize="large" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
