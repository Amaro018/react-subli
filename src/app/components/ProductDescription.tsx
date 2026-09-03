import React, { useState } from "react"

export default function ProductDescription({ description }: { description: string }) {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true)

  return (
    <div className="mt-8 pt-8 border-t border-gray-200 w-full">
      <div className="bg-white rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setIsDescriptionOpen((prev) => !prev)}
          className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors focus:outline-none"
          aria-expanded={isDescriptionOpen}
        >
          <h2 className="text-2xl font-bold text-gray-900">Product Description</h2>
          <svg
            className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${
              isDescriptionOpen ? "rotate-180" : ""
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
            isDescriptionOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-6 pt-0 w-full">
            <p className="text-gray-600 leading-relaxed text-base whitespace-pre-line">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
