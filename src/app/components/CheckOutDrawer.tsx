"use client"
import * as React from "react"
import Box from "@mui/material/Box"
import { useQuery } from "@blitzjs/rpc"
import getAllCartItem from "../queries/getAllCartItem"
import Image from "next/image"

export default function CheckOutDrawer() {
  const [cartItems] = useQuery(getAllCartItem, null)
  return (
    <Box
      sx={{
        width: 400,
        height: "100vh",
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 250,
          boxSizing: "border-box",
        },
      }}
      role="presentation"
      className="bg-slate-600 overflow-y-auto scrollbar-seamless"
    >
      <div className="p-12 text-white">
        {cartItems && cartItems.length > 0 ? (
          cartItems.map((item) => {
            const variantDisplay = item.variant.attributes
              .map((attr: any) => attr.attributeValue.value)
              .join(" / ")
            return (
              <div className="flex flex-col justify-stretch" key={item.id}>
                <div>
                  <div className="flex items-center space-x-4">
                    <Image
                      src={
                        item.product.images[0]
                          ? `/uploads/products/${item.product.images[0].url}`
                          : "/placeholder.png"
                      }
                      alt={item.product.name}
                      width={50}
                      height={50}
                      className="w-24 h-24 object-cover"
                    />
                    <div className="text-sm truncate">
                      <p className="text-white">{item.product.name}</p>
                      <p className="text-gray-400">Variant: {variantDisplay || "Default"}</p>
                    </div>
                  </div>
                  <p>{item.quantity}</p>
                  <p>
                    {item.startDate &&
                      new Intl.DateTimeFormat("en-US", {
                        month: "long",
                        day: "2-digit",
                        year: "numeric",
                      }).format(new Date(item.startDate))}
                  </p>
                  <p>
                    {item.endDate &&
                      new Intl.DateTimeFormat("en-US", {
                        month: "long",
                        day: "2-digit",
                        year: "numeric",
                      }).format(new Date(item.endDate))}
                  </p>
                  <p>{item.variant.price}</p>
                </div>
                <div>
                  <button>checkout</button>
                </div>
              </div>
            )
          })
        ) : (
          <p className="text-center">No items in cart</p>
        )}
      </div>
    </Box>
  )
}
