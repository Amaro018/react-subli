import React, { useState } from "react"

interface DamagePolicy {
  id: number
  title: string
  description: string
  price: number
}

interface ProductDamagePoliciesProps {
  policies: DamagePolicy[] | undefined
}

export default function ProductDamagePolicies({ policies }: ProductDamagePoliciesProps) {
  const [isOpen, setIsOpen] = useState(true)

  if (!policies || policies.length === 0) {
    return null
  }

  return (
    <div
      id="damage-policies-section"
      className="mt-8 pt-8 border-t border-gray-200 w-full scroll-mt-24"
    >
      <div className="bg-white rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors focus:outline-none"
          aria-expanded={isOpen}
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Damage Policies</h2>
            <p className="text-gray-500 mt-1 text-sm font-normal">
              Understand the fees for any potential damages during your rental.
            </p>
          </div>
          <svg
            className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div
          className={`transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-6 pt-0 w-full">
            <div className="flex flex-col divide-y divide-gray-100">
              {policies.map((policy) => (
                <div
                  key={policy.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2"
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{policy.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
                  </div>
                  <div className="font-bold text-lg text-red-600 whitespace-nowrap pt-1">
                    ₱{policy.price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
