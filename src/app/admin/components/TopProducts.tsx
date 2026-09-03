"use client"
import React from "react"
import { useQuery } from "@blitzjs/rpc"
import getTopProducts from "src/app/queries/getTopProducts"
import Link from "next/link"
import Image from "next/image"
import { Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText } from "@mui/material"

const TopProductsSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center py-2">
        <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
        <div className="ml-4 flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
        </div>
        <div className="h-5 bg-gray-200 rounded w-10"></div>
      </div>
    ))}
  </div>
)

const TopProducts = () => {
  const [topProducts, { isLoading }] = useQuery(getTopProducts, null)

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-100 h-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Rented Products</h3>
      {isLoading ? (
        <TopProductsSkeleton />
      ) : !topProducts || topProducts.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          No product rental data available.
        </div>
      ) : (
        <List disablePadding>
          {topProducts.map((product) => (
            <ListItem
              key={product.id}
              disableGutters
              className="hover:bg-gray-50 rounded-md transition-colors"
              component={Link}
              href={`/products/${product.id}`}
            >
              <ListItemAvatar>
                <Avatar variant="rounded" sx={{ width: 40, height: 40, bgcolor: "grey.200" }}>
                  <Image
                    src={`/uploads/products/${product.images[0]?.url || "default.png"}`}
                    alt={product.name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body2" className="font-medium text-gray-800 truncate">
                    {product.name}
                  </Typography>
                }
                secondary={`from ${product.shop?.shopName || "N/A"}`}
              />
              <Typography variant="body1" className="font-bold text-gray-900">
                {product.totalRentals}
              </Typography>
            </ListItem>
          ))}
        </List>
      )}
    </div>
  )
}

export default TopProducts
