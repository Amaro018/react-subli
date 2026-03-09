"use client"

import React from "react"
import { useQuery } from "@blitzjs/rpc"
import getCategories from "../../queries/getCategories"
import { categoryIconMap } from "../../utils/categoryIconMap"

const CategorySection: React.FC = () => {
  const [categories] = useQuery(getCategories, null)

  return (
    <section className="bg-gray-50 py-14">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-gray-800 md:text-3xl">Browse Rental Categories</h2>
          <p className="mt-2 text-gray-500">Rent anything you need � fast and easy</p>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {categories.map((category) => {
            const Icon = categoryIconMap[category.iconKey] ?? categoryIconMap.default

            return (
              <div
                key={category.id}
                className="group flex cursor-pointer flex-col items-center justify-center
                           rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 group-hover:bg-blue-100">
                  <Icon className="text-blue-600" sx={{ fontSize: 32 }} />
                </div>

                <p className="mt-4 text-center text-sm font-medium text-gray-700">
                  {category.name}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default CategorySection
