"use client"
import Image from "next/image"
import React, { useState } from "react"
import { Box, Drawer } from "@mui/material"
import getAllCartItem from "../queries/getAllCartItem"
import { useQuery } from "@blitzjs/rpc"

export default function DrawerCart() {
  const [cartItems] = useQuery(getAllCartItem, {})

  return (
    <>
      <Box
        sx={{
          width: 400,
          height: "100vh",
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 250,
          },
        }}
        role="presentation"
        className="bg-slate-600"
      >
        <div className="p-12 text-white flex flex-col gap-2">
          {cartItems && cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div className="flex flex-col justify-stretch" key={item.id}>
                <div>
                  <div className="flex items-center space-x-4">
                    <Image
                      src={`/uploads/products/${item.product.images[0]?.url}`}
                      alt={item.product.name}
                      width={50}
                      height={50}
                      className="w-24 h-24 object-cover"
                    />
                    <div className="text-sm truncate">
                      <p className="text-white">{item.product.name}</p>
                      <p className="text-gray-400">
                        {item.variant.size} - {item.variant.color.name}
                      </p>
                    </div>
                  </div>
                  <p>{item.product.name}</p>
                  <p>{item.quantity}</p>
                  <p>
                    {new Intl.DateTimeFormat("en-US", {
                      month: "long",
                      day: "2-digit",
                      year: "numeric",
                    }).format(new Date(item.startDate))}
                  </p>
                  <p>
                    {new Intl.DateTimeFormat("en-US", {
                      month: "long",
                      day: "2-digit",
                      year: "numeric",
                    }).format(new Date(item.endDate))}
                  </p>
                  <p>{item.variant.size}</p>
                  <p>{item.variant.color.name}</p>
                  <p>{item.variant.price}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center">No items in cart</p>
          )}
        </div>
        <div className="p-4 flex justify-center w-full">
          <button className="bg-white hover:bg-gray-300 font-bold py-2 px-4 rounded w-full text-slate-600">
            checkout
          </button>
        </div>
      </Box>
    </>
  )
}

// <div className="p-12 text-white">
// {cartItems && cartItems.length > 0 ? (
//   cartItems.map((item) => (
//     <div className="flex flex-col justify-stretch" key={item.id}>
//       <div>
//         <div className="flex items-center space-x-4">
//           <Image
//             src={`/uploads/products/${item.product.images[0]?.url}`}
//             alt={item.product.name}
//             width={50}
//             height={50}
//             className="w-24 h-24 object-cover"
//             />
//           <div className="text-sm truncate">
//             <p className="text-white">{item.product.name}</p>
//             <p className="text-gray-400">
//               {item.variant.size} - {item.variant.color.name}
//             </p>
//           </div>
//         </div>
//         <p>{item.product.name}</p>
//         <p>{item.quantity}</p>
//         <p>
//           {new Intl.DateTimeFormat("en-US", {
//               month: "long",
//               day: "2-digit",
//               year: "numeric",
//           }).format(new Date(item.startDate))}
//         </p>
//         <p>
//           {new Intl.DateTimeFormat("en-US", {
//               month: "long",
//             day: "2-digit",
//             year: "numeric",
//           }).format(new Date(item.endDate))}
//         </p>
//         <p>{item.variant.size}</p>
//         <p>{item.variant.color.name}</p>
//         <p>{item.variant.price}</p>
//       </div>
//       <div>
//         <button>checkout</button>
//       </div>
//     </div>
//   ))
// ) : (
//     <p className="text-center">No items in cart</p>
// )}
// </div>
