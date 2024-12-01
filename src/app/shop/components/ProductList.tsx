"use client"
import React from "react"
import {
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Modal,
  Box,
} from "@mui/material"
import { useQuery } from "@blitzjs/rpc"
import getProducts from "../../queries/getProducts"
import { Create } from "@mui/icons-material"
import CreateProductForm from "./CreateProductForm"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1000,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: "10px",
}
const ProductList = (props) => {
  const currentUser = props.currentUser
  const [products, { isLoading, isError, error }] = useQuery(getProducts, null)
  const [open, setOpen] = React.useState(false)

  const [rowToggle, setRowToggle] = React.useState({}) // Store toggle state for each row

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const toggleRow = (id) => {
    setRowToggle((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle the current row's state
    }))
  }

  if (isLoading) return <CircularProgress />
  if (isError) return <Alert severity="error">{error?.message}</Alert>

  return (
    <>
      <div className="flex flex-row justify-between w-full p-4">
        <div>
          <p className="text-2xl font-bold">List of Products</p>
        </div>
        <div>
          <button
            className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800"
            onClick={handleOpen}
          >
            Create
          </button>
        </div>
      </div>

      {products.length > 0 ? (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2"></th>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Status</th>
              <th className="border border-gray-300 px-4 py-2">Delivery</th>
              <th className="border border-gray-300 px-4 py-2">Category</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <React.Fragment key={product.id}>
                {/* Main Row */}
                <tr className="text-center">
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      className="hover:text-blue-500"
                      onClick={() => toggleRow(product.id)} // Pass product ID
                    >
                      {rowToggle[product.id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </button>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{product.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{product.status}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {product.deliveryOption === "BOTH"
                      ? "Pick up or Delivery"
                      : product.deliveryOption}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{product.category.name}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button>Edit</button>
                  </td>
                </tr>

                {/* Extra Data Row (Toggle Visibility) */}
                {rowToggle[product.id] && (
                  <tr>
                    <td colSpan={6} className="p-4">
                      <table className="table-auto w-full border-collapse border border-gray-300 bg-gray-50">
                        <thead>
                          <tr>
                            <th className="border border-gray-300 px-4 py-2">Variant ID</th>
                            <th className="border border-gray-300 px-4 py-2">Color</th>
                            <th className="border border-gray-300 px-4 py-2">Price</th>
                            <th className="border border-gray-300 px-4 py-2">Stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.variants.map((variant, index) => (
                            <tr key={index} className="text-center">
                              <td className="border border-gray-300 px-4 py-2">{variant.id}</td>
                              <td className="border border-gray-300 px-4 py-2">
                                <div className="flex items-center justify-center gap-4">
                                  <div
                                    style={{ backgroundColor: variant.color.hexCode }}
                                    className="w-8 h-8 rounded-full"
                                  ></div>
                                  <div className="text-sm">{variant.color.name}</div>
                                </div>
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                ₱{variant.price.toFixed(2)}
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {variant.quantity}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex flex-col justify-center items-center w-full">
          <Typography variant="h6" color="text.secondary">
            No products available
          </Typography>
        </div>
      )}

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            ...style,
            overflow: "auto",
            maxHeight: "calc(100vh - 200px)",
          }}
        >
          <CreateProductForm currentUser={currentUser} />
        </Box>
      </Modal>
    </>
  )
}

export default ProductList
