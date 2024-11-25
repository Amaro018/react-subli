"use client"
import Navbar from "./../../components/Navbar"
import { invoke } from "./../../blitz-server"
import getCurrentUser from "./../../users/queries/getCurrentUser"
import { Sidebar } from "./../components/sidebar"
import { TextField } from "@mui/material"

import Box from "@mui/material/Box"
import Stepper from "@mui/material/Stepper"
import Step from "@mui/material/Step"
import StepLabel from "@mui/material/StepLabel"
import React, { useEffect, useState } from "react"
export default async function Page() {
  const currentUser = await invoke(getCurrentUser, null)
  const [activeStep, setActiveStep] = useState(0)

  const steps = ["SHOP DETAILS", "SHOP DOCUMENTS", "SHOP PROFILE"]

  return (
    <div>
      <Navbar currentUser={currentUser} />
      <main className="flex flex-row gap-2">
        <div className="w-64 ">
          <Sidebar />
        </div>
        <div className="p-16 w-full">
          <h1 className="text-2xl text-center mb-6">SHOP REGISTRATION</h1>
          <div className="flex flex-col gap-2">
            <Box sx={{ width: "100%" }}>
              <Stepper activeStep={0} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            <div className=" w-full">
              <form className="flex flex-col gap-4">
                <div className="flex flex-row gap-2">
                  <TextField required id="outlined-required" label="Shop Name" name="shopName" />
                  <TextField required id="outlined-required" label="Shop Email" name="email" />
                </div>
                <p>Address</p>
                <div className="flex flex-row gap-2">
                  <TextField required id="outlined-required" label="Street" name="street" />
                  <TextField required id="outlined-required" label="City" name="city" />
                  <TextField required id="outlined-required" label="State" name="state" />
                  <TextField required id="outlined-required" label="Region" name="region" />
                  <TextField required id="outlined-required" label="Zip" name="zip" />
                </div>
                <button type="submit">Submit</button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
