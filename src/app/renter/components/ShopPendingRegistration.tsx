"use client"
import React from "react"
import { useQuery } from "@blitzjs/rpc"
import { Box, Button, Typography } from "@mui/material"

export const ShopPendingRegistration = (props: any) => {
  const currentUser = props.currentUser
  console.log("current user", currentUser)

  return (
    <div>
      shop here
      <p>Shop Name : {currentUser.shop.shopName}</p>
    </div>
  )
}
