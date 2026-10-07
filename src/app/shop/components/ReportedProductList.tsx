"use client"
import React, { useState } from "react"
import { useMutation, useQuery } from "@blitzjs/rpc"
import getReportedProductsByShop from "../../queries/getReportedProductsByShop"
import submitProductReportResponse from "../../mutations/submitProductReportResponse"
import createProductAppeal from "../../mutations/createProductAppeal"
import { toast } from "@/src/app/utils/toast"
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
  TextField,
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

const ReportedProductList = () => {
  const [reportedProducts, { isLoading, isError, error, refetch }] = useQuery(
    getReportedProductsByShop,
    null,
    { suspense: false }
  )
  const [createAppealMutation, { isLoading: isSubmittingAppeal }] = useMutation(createProductAppeal)

  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [appealMessage, setAppealMessage] = useState("")
  const [open, setOpen] = useState(false)

  const handleOpen = (product: any) => {
    setSelectedProduct(product)
    setAppealMessage("")
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedProduct(null)
  }

  const handleSubmitAppeal = async () => {
    if (!selectedProduct || !appealMessage.trim()) return
    try {
      const appeal = await createAppealMutation({
        productId: selectedProduct.id,
        message: appealMessage,
      })
      setSelectedProduct((product: any) => ({
        ...product,
        appeals: [appeal, ...(product.appeals || [])],
      }))
      setAppealMessage("")
      toast.success("Your product appeal was submitted for review.")
      try {
        await refetch()
      } catch {
        toast.error("Your appeal was submitted, but the product list could not be refreshed.")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit product appeal.")
    }
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
          Review reports for your products and update the listing when action is needed.
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
                    <Chip
                      label={product._count.reports}
                      color={product._count.reports ? "error" : "default"}
                      size="small"
                    />
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
                      {product.status === "banned" ? "Review / appeal" : "View Reports"}
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
                Product moderation: &quot;{selectedProduct.name}&quot;
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Product ID: {selectedProduct.id}
              </Typography>
              {selectedProduct.status === "banned" && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <strong>Ban reason:</strong> {selectedProduct.banReason || "No reason recorded."}
                </Alert>
              )}
              <Box mt={2}>
                {selectedProduct.reports.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    There are no reports for this product.
                  </Typography>
                )}
                {selectedProduct.reports.map((report: any) => (
                  <Paper key={report.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="body1">
                      <strong>Reason:</strong> {report.reason}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Submitted: {new Date(report.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Status:</strong> {report.status}
                    </Typography>
                    {report.description && (
                      <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
                        {report.description}
                      </Typography>
                    )}
                    {report.note && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Admin note:</strong> {report.note}
                      </Typography>
                    )}
                    {report.shopResponse && (
                      <Typography
                        variant="body2"
                        sx={{ mt: 1, whiteSpace: "pre-wrap", bgcolor: "grey.50", p: 1 }}
                      >
                        <strong>Your response:</strong> {report.shopResponse.message}
                      </Typography>
                    )}
                    {report.status === "pending" && (
                      <ProductReportResponseForm
                        report={report}
                        onSaved={async (response) => {
                          setSelectedProduct((product: any) =>
                            product
                              ? {
                                  ...product,
                                  reports: product.reports.map((item: any) =>
                                    item.id === report.id
                                      ? { ...item, shopResponse: response }
                                      : item
                                  ),
                                }
                              : product
                          )
                          try {
                            await refetch()
                          } catch {
                            toast.error(
                              "Your response was saved, but the report list could not be refreshed."
                            )
                          }
                        }}
                      />
                    )}
                  </Paper>
                ))}
              </Box>
              {(selectedProduct.status === "banned" || selectedProduct.appeals?.length > 0) && (
                <Box mt={3}>
                  <Typography variant="h6" component="h3" fontWeight="bold">
                    Product appeal history
                  </Typography>
                  {selectedProduct.appeals?.map((appeal: any) => (
                    <Paper key={appeal.id} variant="outlined" sx={{ p: 2, mt: 1 }}>
                      <Typography variant="subtitle2">
                        Appeal {appeal.status} · {new Date(appeal.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1, whiteSpace: "pre-wrap" }}>
                        {appeal.message}
                      </Typography>
                      {appeal.adminNote && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Admin decision:</strong> {appeal.adminNote}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                  {selectedProduct.status === "banned" &&
                    !selectedProduct.appeals?.some(
                      (appeal: any) => appeal.status === "pending"
                    ) && (
                      <Box mt={2}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Explain why the ban should be reconsidered. An administrator will review
                          your appeal.
                        </Typography>
                        <TextField
                          value={appealMessage}
                          onChange={(event) => setAppealMessage(event.target.value)}
                          label="Appeal statement"
                          multiline
                          minRows={3}
                          fullWidth
                          inputProps={{ maxLength: 5000 }}
                          helperText={`${appealMessage.length}/5000`}
                        />
                        <Button
                          onClick={handleSubmitAppeal}
                          disabled={!appealMessage.trim() || isSubmittingAppeal}
                          variant="contained"
                          sx={{ mt: 1 }}
                        >
                          {isSubmittingAppeal ? "Submitting..." : "Submit appeal"}
                        </Button>
                      </Box>
                    )}
                </Box>
              )}
              <Box mt={3} display="flex" justifyContent="flex-end">
                <Button
                  href={`/shop/products?highlight=${selectedProduct.id}`}
                  variant="outlined"
                  sx={{ mr: 1 }}
                >
                  Open product management
                </Button>
                <Button onClick={handleClose}>Close</Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </div>
  )
}

function ProductReportResponseForm({
  report,
  onSaved,
}: {
  report: {
    id: number
    shopResponse: { message: string; createdAt: Date; updatedAt: Date } | null
  }
  onSaved: (response: { message: string; createdAt: Date; updatedAt: Date }) => Promise<void>
}) {
  const [message, setMessage] = useState(report.shopResponse?.message || "")
  const [submitResponse, { isLoading }] = useMutation(submitProductReportResponse)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!message.trim()) return

    try {
      const response = await submitResponse({ reportId: report.id, message })
      await onSaved(response)
      toast.success("Your report response was sent to the administrators.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit report response.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
      <TextField
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        label={report.shopResponse ? "Update your response" : "Respond to this report"}
        multiline
        minRows={2}
        fullWidth
        inputProps={{ maxLength: 5000 }}
      />
      <Button
        type="submit"
        variant="outlined"
        size="small"
        disabled={!message.trim() || isLoading}
        sx={{ alignSelf: "flex-start" }}
      >
        {isLoading ? "Sending..." : report.shopResponse ? "Update response" : "Send response"}
      </Button>
    </form>
  )
}

export default ReportedProductList
