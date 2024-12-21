"use client"
import React from "react"
import { useQuery } from "@blitzjs/rpc"
import { Box, Button, Typography } from "@mui/material"
import Image from "next/image"
export const ShopPendingRegistration = (props: any) => {
    const currentUser = props.currentUser
    console.log("current user", currentUser)

    return (
        <div className="flex flex-col gap-4">
        <div className="flex justify-between border-b border-slate-500 py-2">
             <div className="flex flex-row gap-2">
                 <Image src={`/uploads/shop-profile/${currentUser.shop.imageProfile}`} alt="Shop Image" width={100} height={100} />
                     <div className="flex flex-col capitalize justify-between">
                         <p className="font-bold text-2xl">{currentUser.shop.shopName}</p>
                         <p>{currentUser.shop.contact}</p>
                         <p>{currentUser.shop.street}, {currentUser.shop.city}, {currentUser.shop.region}, {currentUser.shop.country}, {currentUser.shop.zipCode}</p>
                         <p>{currentUser.shop.description}</p>   
                    </div>
                 </div>
             <div>
                 <p className="p-2 text-white bg-red-500 rounded-lg">{currentUser.shop.status}</p>
             </div>
        </div>

            <div>
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                Product
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Category
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Price
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Action
                            </th>
                        </tr>
                    </thead>
                </table>
            </div>
            


        </div>
    )
}
