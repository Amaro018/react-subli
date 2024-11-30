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
  if (isLoading) return <CircularProgress />
  if (isError) return <Alert severity="error">{error?.message}</Alert>

  const handleOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <div className="flex flex-row justify-between w-full  p-4">
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
      <Grid container spacing={3}>
        {products.length > 0 ? (
          products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.description}
                  </Typography>
                  <Typography variant="h6" component="div">
                    ${product.price}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <div className="flex flex-col justify-center items-center w-full">
            <Typography variant="h6" color="text.secondary">
              No products available
            </Typography>
          </div>
        )}
      </Grid>

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
