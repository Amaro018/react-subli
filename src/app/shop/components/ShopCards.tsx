"use client"
import * as React from "react"
import { LineChart } from "@mui/x-charts/LineChart"
import getProducts from "../../queries/getProducts"
import { useQuery } from "@blitzjs/rpc"

export default function ShopCards() {
  const [products, { refetch }] = useQuery(getProducts, {})

  const productCount = products ? products.length : 0

  return (
    <>
      <div className="w-full flex flex-row text-white gap-2">
        <div className="bg-slate-600 p-4 flex flex-col justify-center items-center rounded-lg w-1/4 gap-4 shadow-lg shadow-slate-500">
          <p className="text-3xl">PRODUCTS</p>

          <p className="text-2xl">{productCount}</p>
        </div>

        <div className="bg-slate-600 p-4 flex flex-col justify-center items-center rounded-lg w-1/4 gap-4 shadow-lg shadow-slate-500">
          <p className="text-3xl">ORDERS</p>

          <p className="text-2xl">1</p>
        </div>

        <div className="bg-slate-600 p-4 flex flex-col justify-center items-center rounded-lg w-1/4 gap-4 shadow-lg shadow-slate-500">
          <p className="text-3xl">RENDERED</p>

          <p className="text-2xl">1</p>
        </div>

        <div className="bg-slate-600 p-4 flex flex-col justify-center items-center rounded-lg w-1/4 gap-4 shadow-lg shadow-slate-500">
          <p className="text-3xl">PENDING</p>

          <p className="text-2xl">1</p>
        </div>
      </div>

      <div className="w-full">
        <LineChart
          style={{ width: "100%", height: 700 }}
          xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
          series={[
            {
              data: [2, 5.5, 2, 8.5, 1.5, 5],
              area: true,
            },
          ]}
        />
      </div>
    </>
  )
}
