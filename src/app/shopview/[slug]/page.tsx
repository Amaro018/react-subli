"use client"
import { useEffect, useState } from "react"
import React from "react"
import { useQuery } from "@blitzjs/rpc"
import Navbar from "../../components/Navbar"
import getUser from "../../utils/getUser"
import getShopById from "../../queries/getShopById"
import Image from "next/image"

export default function Page({ params }: any) {
  const { slug } = params
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser()
      setCurrentUser(user)
    }
    fetchUser()
  }, [])

  // Fetch shop details using the slug (assuming it's the shop ID)
  const [shop] = useQuery(getShopById, { id: slug })

  return (
    <>
      <Navbar currentUser={currentUser} />
      <div className="flex flex-col gap-2 p-16 mt-20">
        {shop ? (
          <div className="flex flex-row items-center gap-4">
            {shop.imageProfile && (
              <Image
                src={`/uploads/shop-profile/${shop.imageProfile}`}
                alt="Shop Profile"
                width={500}
                height={500}
                className="rounded-full w-32 h-32 object-cover"
              />
            )}
            <div className="text-left">
              <h1 className="text-2xl font-bold">{shop.shopName}</h1>
              <p className="text-gray-600">
                {shop.street}, {shop.city}, {shop.region}, {shop.country}, {shop.zipCode}
              </p>
              <p className="text-gray-600">{shop.linkFacebook}</p>
            </div>
          </div>
        ) : (
          <p>Loading shop details...</p>
        )}
      </div>
    </>
  )
}
