import Navbar from "../../components/Navbar"
import { invoke } from "./../../blitz-server"
import getCurrentUser from "./../../users/queries/getCurrentUser"
import { Sidebar } from "./../components/sidebar"

import FormShopRegister from "./../components/FormShopRegister"
import { TextField } from "@mui/material"

import Box from "@mui/material/Box"
import Stepper from "@mui/material/Stepper"
import Step from "@mui/material/Step"
import StepLabel from "@mui/material/StepLabel"
import { set } from "zod"
import { useState } from "react"
import { Form } from "formik"
import RenterProfile from "../components/RenterProfile"
export default async function Page() {
  const currentUser = await invoke(getCurrentUser, null)

  return (
    <div>
      <div className="flex mb-4">
        <Navbar currentUser={currentUser} />
      </div>
      <main className="flex flex-row gap-2">
        <div className="w-64">
          <Sidebar currentUser={currentUser} />
        </div>
        <div className="w-full my-16 p-8">
          <RenterProfile currentUser={currentUser} />
        </div>
      </main>
    </div>
  )
}
