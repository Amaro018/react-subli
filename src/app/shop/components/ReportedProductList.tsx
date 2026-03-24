"use client"
import React, { useState } from "react"
import { useQuery } from "@blitzjs/rpc"
import getReportedProductsByShop from "../../queries/getReportedProductsByShop"
import {
  Typography,
  CircularProgress,
  Alert,
  Box,
  Modal,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material"

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "95%", md: "70%" },
  maxWidth: 800,
  bgcolor: "background.paper",
  border: "none",
  boxShadow: 24,
  p: { xs: 2, md: 4 },
  borderRadius: "12px",
  outline: "none",
  maxHeight: "90vh",
  overflowY: "auto",
}

const ReportedProductList = ({ currentUser }: { currentUser: any }) => {
  const shopId = currentUser?.shop?.id
  const [reportedProducts, { isLoading, isError, error }] = useQuery(
    getReportedProductsByShop,
    { shopId: shopId! },
    { enabled: !!shopId }
  )

  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [open, setOpen] = useState(false)

  const handleOpen = (product: any) => {
    setSelectedProduct(product)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedProduct(null)
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError) {
    return (
      <Alert severity="error">
        {(error as Error).message || "Failed to load reported products."}
      </Alert>
    )
  }

  return (
    <div className="w-full">
      <div className="p-4 mb-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <Typography variant="h5" component="h1" fontWeight="bold" color="text.primary">
          Reported Products
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review products that have been reported by users.
        </Typography>
      </div>

      {reportedProducts && reportedProducts.length > 0 ? (
        <TableContainer component={Paper} className="rounded-xl border border-gray-200 shadow-sm">
          <Table sx={{ minWidth: 650 }} aria-label="reported products table">
            <TableHead className="bg-gray-50">
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Product Name</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Total Reports
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Status
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportedProducts.map((product) => (
                <TableRow
                  key={product.id}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    "&:hover": { backgroundColor: "#f9fafb" },
                  }}
                >
                  <TableCell component="th" scope="row">
                    {product.name}
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={product._count.reports} color="error" size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={product.status}
                      color={product.status === "active" ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button variant="outlined" size="small" onClick={() => handleOpen(product)}>
                      View Reports
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <div className="flex flex-col justify-center items-center w-full py-12 bg-white rounded-lg border border-gray-200 border-dashed">
          <Typography variant="h6" color="text.secondary">
            No reported products.
          </Typography>
        </div>
      )}

      <Modal open={open} onClose={handleClose}>
        <Box sx={style} className="scrollbar-seamless">
          {selectedProduct && (
            <>
              <Typography variant="h6" component="h2" fontWeight="bold">
                Reports for &quot;{selectedProduct.name}&quot;
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Product ID: {selectedProduct.id}
              </Typography>
              <Box mt={2}>
                {selectedProduct.reports.map((report: any) => (
                  <Paper key={report.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="body1">
                      <strong>Reason:</strong> {report.reason}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Reported by:</strong>{" "}
                      {report.user.personalInfo?.firstName || "Anonymous"} on{" "}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </Typography>
                    {report.comment && (
                      <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
                        &quot;{report.comment}&quot;
                      </Typography>
                    )}
                  </Paper>
                ))}
              </Box>
              <Box mt={3} display="flex" justifyContent="flex-end">
                <Button onClick={handleClose}>Close</Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </div>
  )
}

export default ReportedProductList
