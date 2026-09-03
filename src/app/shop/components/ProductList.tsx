"use client"
import React, { useState, useEffect, useMemo } from "react"
import {
  Typography,
  CircularProgress,
  Alert,
  Modal,
  Box,
  TextField,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Chip,
  Button,
  MenuItem,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useQuery, useMutation } from "@blitzjs/rpc"
import getProductByShopId from "../../queries/getProductByShopId"
import EditProductForm from "./EditProductForm"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import Link from "next/link"
import updateProductStatus from "../../mutations/updateProductStatus"
import deleteProduct from "../../mutations/deleteProduct"
import duplicateProduct from "../../mutations/duplicateProduct"
import { toast } from "@/src/app/utils/toast"
import ImageIcon from "@mui/icons-material/Image"
import Image from "next/image"
import {
  EditOutlined,
  ArchiveOutlined,
  RestoreOutlined,
  ContentCopyOutlined,
  DeleteOutline,
} from "@mui/icons-material"

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "95%", md: "90%", lg: "1200px", xl: "1400px" },
  maxWidth: "95vw",
  bgcolor: "background.paper",
  border: "none",
  boxShadow: 24,
  p: { xs: 2, md: 4 },
  borderRadius: "12px",
  outline: "none",
}

import { User, Session, Token, PersonalInfo, Shop, CartItem } from "@prisma/client"

type ExtendedUser = User & {
  sessions: Session[]
  tokens: Token[]
  personalInfo: PersonalInfo | null
  shop: Shop | null
  cartItems: CartItem[]
}

type ProductListProps = {
  currentUser: ExtendedUser | null
}

type DamagePolicies = {
  id: number
  damageSeverity: string
  damageSeverityPercent: number
}

type Category = {
  id: number
  name: string
}

type Attribute = {
  id: number
  name: string
}

type AttributeValue = {
  id: number
  value: string
  hexCode: string | null
  attribute: Attribute
}

type ProductVariantAttribute = {
  attributeValue: AttributeValue
}

type RentItem = {
  status: string
  quantity: number
  returnedDamagedQty: number
  isRepaired: boolean | null
}

type Variant = {
  id: number | string
  price: number
  quantity: number
  condition?: string
  attributes: ProductVariantAttribute[]
  rentItems: RentItem[]
}

type ProductImage = {
  id: number
  url: string
  isThumbnail: boolean
  attributeValueId: number | null
}

type ProductFormData = {
  id: number
  name: string
  status: string
  description: string
  deliveryOption: string
  category: Category
  categoryid: number
  variants: Variant[]
  images: ProductImage[]
  updatedAt: string | Date
}

const emptyProduct: ProductFormData = {
  id: 0,
  name: "",
  status: "",
  description: "",
  deliveryOption: "",
  category: {
    id: 0,
    name: "",
  },
  categoryid: 0,
  variants: [],
  images: [],
  updatedAt: new Date(),
}

function Row({
  product,
  onEdit,
  onArchive,
  onRestore,
  onHardDelete,
  onDuplicate,
  isHighlighted,
}: {
  product: ProductFormData
  onEdit: (p: ProductFormData) => void
  onArchive: (id: number) => void
  onRestore: (id: number) => void
  onHardDelete: (id: number) => void
  onDuplicate: (id: number) => void
  isHighlighted?: boolean
}) {
  const [open, setOpen] = useState(false)

  const totalStock = product.variants.reduce((acc: number, v: Variant) => acc + v.quantity, 0)
  const variantCount = product.variants.length
  const hasRentalHistory = product.variants.some(
    (v: Variant) => v.rentItems && v.rentItems.length > 0
  )

  const thumbnail =
    product.images?.find((img: ProductImage) => img.isThumbnail) || product.images?.[0]

  return (
    <React.Fragment>
      <TableRow
        id={`product-row-${product.id}`}
        hover
        sx={{
          "& > *": { borderBottom: "unset" },
          bgcolor: isHighlighted ? "#eef2ff" : "inherit",
          transition: "background-color 0.5s ease",
        }}
      >
        <TableCell align="center" sx={{ width: 60, py: 2 }}>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row" sx={{ py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {thumbnail ? (
              <Image
                src={`/uploads/products/${thumbnail.url}`}
                alt={product.name}
                width={48}
                height={48}
                className="rounded-md object-cover border border-gray-200 shadow-sm"
                style={{ width: 48, height: 48, minWidth: 48 }}
              />
            ) : (
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  minWidth: 48,
                  bgcolor: "grey.50",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <ImageIcon sx={{ color: "grey.300" }} />
              </Box>
            )}
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="text.primary"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {product.name}
                </Typography>
                {product.status === "inactive" && (
                  <Chip
                    label="Draft"
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.65rem",
                      fontWeight: "bold",
                      bgcolor: "#fffbeb",
                      color: "#b45309",
                      border: "1px solid #fde68a",
                    }}
                  />
                )}
                {product.name?.match(/\(Copy(?: \d+)?\)$/) && (
                  <Chip
                    label="Copy"
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.65rem",
                      fontWeight: "bold",
                      bgcolor: "#f8fafc",
                      color: "#475569",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                )}
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  mt: 0.5,
                  maxWidth: 350,
                }}
              >
                {product.description || "No description provided."}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell sx={{ display: { xs: "none", md: "table-cell" }, py: 2 }}>
          <Typography variant="body2" color="text.secondary" fontWeight="medium">
            {product.category?.name}
          </Typography>
        </TableCell>
        <TableCell sx={{ display: { xs: "none", sm: "table-cell" }, py: 2 }}>
          <Typography variant="body2" color="text.secondary" fontWeight="medium">
            {product.deliveryOption === "BOTH"
              ? "Pick Up & Delivery"
              : product.deliveryOption === "PICKUP"
              ? "Pick Up"
              : "Delivery"}
          </Typography>
        </TableCell>
        <TableCell align="center" sx={{ py: 2 }}>
          <Typography variant="body2" fontWeight="medium">
            {totalStock}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            in {variantCount} variant{variantCount > 1 ? "s" : ""}
          </Typography>
        </TableCell>
        <TableCell align="center" sx={{ py: 2 }}>
          {product.status === "deleted" ? (
            <Chip
              label="Archived"
              size="small"
              sx={{ fontWeight: "bold", bgcolor: "#fee2e2", color: "#991b1b", border: "none" }}
            />
          ) : (
            <Chip
              label={product.status === "active" ? "Listed" : "Unlisted"}
              size="small"
              sx={{
                fontWeight: "bold",
                bgcolor: product.status === "active" ? "#dcfce7" : "#f1f5f9",
                color: product.status === "active" ? "#166534" : "#475569",
                border: "none",
              }}
            />
          )}
        </TableCell>
        <TableCell align="right" sx={{ py: 2 }}>
          {product.status === "deleted" ? (
            <Button
              size="small"
              variant="contained"
              disableElevation
              color="info"
              onClick={() => onRestore(product.id)}
              startIcon={<RestoreOutlined />}
              sx={{ textTransform: "none", fontWeight: "bold", borderRadius: 1 }}
            >
              Restore
            </Button>
          ) : (
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                size="small"
                variant="contained"
                disableElevation
                onClick={() => onDuplicate(product.id)}
                startIcon={<ContentCopyOutlined />}
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  borderRadius: 1,
                  bgcolor: "grey.200",
                  color: "grey.800",
                  "&:hover": { bgcolor: "grey.300" },
                }}
              >
                Copy
              </Button>
              <Button
                size="small"
                variant="contained"
                disableElevation
                color="primary"
                onClick={() => onEdit(product)}
                startIcon={<EditOutlined />}
                sx={{ textTransform: "none", fontWeight: "bold", borderRadius: 1 }}
              >
                Edit
              </Button>
              <Button
                size="small"
                variant="contained"
                disableElevation
                color="error"
                onClick={() =>
                  hasRentalHistory ? onArchive(product.id) : onHardDelete(product.id)
                }
                startIcon={hasRentalHistory ? <ArchiveOutlined /> : <DeleteOutline />}
                sx={{ textTransform: "none", fontWeight: "bold", borderRadius: 1 }}
              >
                {hasRentalHistory ? "Archive" : "Delete"}
              </Button>
            </Stack>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                my: 2,
                ml: { xs: 1, sm: 3, md: 9 },
                mr: { xs: 1, sm: 3, md: 3 },
                border: "1px solid #e2e8f0",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  bgcolor: "white",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                  Product Variants
                </Typography>
              </Box>
              <Table size="small" aria-label="variants">
                <TableHead sx={{ bgcolor: "#f8fafc" }}>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: "text.secondary",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        pl: 3,
                      }}
                    >
                      Variant Details
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: "text.secondary",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Condition
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: "bold",
                        color: "text.secondary",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Rent Price
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        color: "text.secondary",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Available
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        color: "text.secondary",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Total Qty
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {product.variants.map((variant: Variant, index: number) => {
                    const variantName =
                      variant.attributes?.length > 0
                        ? variant.attributes
                            .map((attr: ProductVariantAttribute) => attr.attributeValue.value)
                            .join(" / ")
                        : "Default Config"

                    const totalRented =
                      variant.rentItems?.reduce((sum: number, rent: RentItem) => {
                        if (rent.status === "rendering" || rent.status === "on_hand") {
                          return sum + rent.quantity
                        } else if (!rent.isRepaired && rent.returnedDamagedQty) {
                          return sum + rent.returnedDamagedQty
                        }
                        return sum
                      }, 0) || 0

                    const availableQuantity = variant.quantity - totalRented

                    const isOutOfStock = availableQuantity <= 0
                    const isLowStock = availableQuantity > 0 && availableQuantity <= 2

                    return (
                      <TableRow
                        key={variant.id || index}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          bgcolor: isOutOfStock ? "#fff1f2" : isLowStock ? "#fffbeb" : "inherit",
                          transition: "background-color 0.2s",
                          "&:hover": {
                            bgcolor: isOutOfStock
                              ? "#ffe4e6"
                              : isLowStock
                              ? "#fef3c7"
                              : "rgba(0, 0, 0, 0.02)",
                          },
                        }}
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{ fontWeight: "medium", py: 1.5, pl: 3 }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <span>{variantName}</span>
                            {isOutOfStock && (
                              <Chip
                                label="Out of Stock"
                                size="small"
                                color="error"
                                sx={{ height: 20, fontSize: "0.65rem", fontWeight: "bold" }}
                              />
                            )}
                            {isLowStock && (
                              <Chip
                                label="Low Stock"
                                size="small"
                                color="warning"
                                sx={{ height: 20, fontSize: "0.65rem", fontWeight: "bold" }}
                              />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>{variant.condition || "New"}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold", py: 1.5 }}>
                          ₱{variant.price.toFixed(2)}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <Typography
                            variant="body2"
                            color={availableQuantity > 0 ? "success.main" : "error.main"}
                            fontWeight="bold"
                          >
                            {availableQuantity}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {variant.quantity}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}

const ProductList = (props: ProductListProps) => {
  const currentUser = props.currentUser
  const shopId = currentUser?.shop?.id
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [products = [], { isLoading, isError, error, refetch }] = useQuery(
    getProductByShopId,
    shopId ? { shopId } : { shopId: 0 },
    { enabled: !!shopId }
  )

  const [openEdit, setOpenEdit] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductFormData>(emptyProduct)
  const [updateProductStatusMutation] = useMutation(updateProductStatus)
  const [deleteProductMutation] = useMutation(deleteProduct)
  const [duplicateProductMutation] = useMutation(duplicateProduct)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState("")
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null)
  const [confirmColor, setConfirmColor] = useState<"primary" | "error">("error")

  const handleConfirmClose = () => {
    setConfirmOpen(false)
  }

  const handleConfirmAccept = async () => {
    if (confirmAction) {
      await confirmAction()
    }
    setConfirmOpen(false)
  }

  const filteredProducts = useMemo(() => {
    const productList = products as unknown as ProductFormData[]
    return productList
      .filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
        if (statusFilter === "all") return product.status !== "deleted" && matchesSearch
        if (statusFilter === "archived") return product.status === "deleted" && matchesSearch
        return product.status === statusFilter && matchesSearch
      })
      .sort((a, b) => {
        if (sortOrder === "newest")
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        if (sortOrder === "oldest")
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        if (sortOrder === "name_asc") return a.name.localeCompare(b.name)
        if (sortOrder === "name_desc") return b.name.localeCompare(a.name)
        if (sortOrder === "stock_high") {
          return (
            (b.variants?.reduce((acc: number, v: Variant) => acc + v.quantity, 0) || 0) -
            (a.variants?.reduce((acc: number, v: Variant) => acc + v.quantity, 0) || 0)
          )
        }
        if (sortOrder === "stock_low") {
          return (
            (a.variants?.reduce((acc: number, v: Variant) => acc + v.quantity, 0) || 0) -
            (b.variants?.reduce((acc: number, v: Variant) => acc + v.quantity, 0) || 0)
          )
        }
        return 0
      })
  }, [products, searchTerm, statusFilter, sortOrder])

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const highlightId = searchParams?.get("highlight")

  const pageCount = useMemo(
    () => Math.ceil(filteredProducts.length / itemsPerPage),
    [filteredProducts.length, itemsPerPage]
  )

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  }, [filteredProducts, currentPage, itemsPerPage])

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout
    let clearUrlTimeout: NodeJS.Timeout

    if (highlightId && filteredProducts.length > 0) {
      const targetId = Number(highlightId)
      const index = filteredProducts.findIndex((p) => p.id === targetId)

      if (index !== -1) {
        // Pagination is 1-based in this component
        const targetPage = Math.floor(index / itemsPerPage) + 1

        if (currentPage !== targetPage) {
          setCurrentPage(targetPage)
        } else {
          // Use a timeout to ensure the DOM has updated before scrolling
          scrollTimeout = setTimeout(() => {
            const el = document.getElementById(`product-row-${targetId}`)
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" })

              // Clear the parameter from the URL after 2 seconds to fade out the highlight
              clearUrlTimeout = setTimeout(() => {
                const params = new URLSearchParams(searchParams.toString())
                if (params.has("highlight")) {
                  params.delete("highlight")
                  router.replace(
                    `${pathname || "/"}${params.toString() ? `?${params.toString()}` : ""}` as any,
                    { scroll: false }
                  )
                }
              }, 2000)
            }
          }, 100)
        }
      }
    }

    return () => {
      if (scrollTimeout) clearTimeout(scrollTimeout)
      if (clearUrlTimeout) clearTimeout(clearUrlTimeout)
    }
  }, [highlightId, filteredProducts, currentPage, itemsPerPage, pathname, router, searchParams])

  const handleArchiveProduct = async (id: number) => {
    setConfirmMessage(
      "Are you sure you want to archive this product? It will be hidden from your shop, but you can restore it later."
    )
    setConfirmColor("error")
    setConfirmAction(() => async () => {
      try {
        await updateProductStatusMutation({ id, status: "deleted" })
        toast.success("Product archived successfully!")
        refetch()
      } catch (error: any) {
        toast.error(error.message || "Failed to archive product")
      }
    })
    setConfirmOpen(true)
  }

  const handleRestoreProduct = async (id: number) => {
    setConfirmMessage(
      "Are you sure you want to restore this product? It will be restored as 'Unlisted' so you can review it before making it live."
    )
    setConfirmColor("primary")
    setConfirmAction(() => async () => {
      try {
        await updateProductStatusMutation({ id, status: "inactive" })
        toast.success("Product restored and is now Unlisted!")
        refetch()
      } catch (error: any) {
        toast.error(error.message || "Failed to restore product")
      }
    })
    setConfirmOpen(true)
  }

  const handleHardDeleteProduct = async (id: number) => {
    setConfirmMessage(
      "Are you sure you want to permanently delete this product? This action cannot be undone."
    )
    setConfirmColor("error")
    setConfirmAction(() => async () => {
      try {
        await deleteProductMutation({ id })
        toast.success("Product permanently deleted!")
        refetch()
      } catch (error: any) {
        toast.error(error.message || "Failed to delete product")
      }
    })
    setConfirmOpen(true)
  }

  const handleDuplicateProduct = async (id: number) => {
    setConfirmMessage(
      "Are you sure you want to duplicate this product? A copy will be created as an Unlisted product."
    )
    setConfirmColor("primary")
    setConfirmAction(() => async () => {
      try {
        await duplicateProductMutation({ id })
        toast.success("Product duplicated successfully! It is currently Unlisted.")
        refetch()
      } catch (error: any) {
        toast.error(error.message || "Failed to duplicate product")
      }
    })
    setConfirmOpen(true)
  }

  const handleOpenEdit = (product: ProductFormData) => {
    setSelectedProduct(product)
    setOpenEdit(true)
  }

  const handleCloseEdit = () => {
    setOpenEdit(false)
    setSelectedProduct(emptyProduct)
  }

  if (isLoading) return <CircularProgress />

  if (isError) {
    if (error instanceof Error) {
      return <Alert severity="error">{error.message}</Alert>
    }
    return <Alert severity="error">Something went wrong</Alert>
  }

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value)
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center w-full p-4 mb-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <div>
          <p className="text-2xl font-bold text-gray-800">List of Products</p>
        </div>
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <TextField
            select
            label="Status"
            variant="outlined"
            size="small"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            sx={{
              minWidth: 140,
              "& .MuiOutlinedInput-root": { borderRadius: "8px" },
            }}
          >
            <MenuItem value="all">All Products</MenuItem>
            <MenuItem value="active">Listed Only</MenuItem>
            <MenuItem value="inactive">Unlisted Only</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </TextField>
          <TextField
            select
            label="Sort By"
            variant="outlined"
            size="small"
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value)
              setCurrentPage(1)
            }}
            sx={{
              minWidth: 160,
              "& .MuiOutlinedInput-root": { borderRadius: "8px" },
            }}
          >
            <MenuItem value="newest">Recently Updated</MenuItem>
            <MenuItem value="oldest">Oldest Updated</MenuItem>
            <MenuItem value="name_asc">Name (A-Z)</MenuItem>
            <MenuItem value="name_desc">Name (Z-A)</MenuItem>
            <MenuItem value="stock_high">Highest Stock</MenuItem>
            <MenuItem value="stock_low">Lowest Stock</MenuItem>
          </TextField>
          <TextField
            label="Search by name"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          />
          <Link
            href="/shop/products/add"
            className="bg-[#1b2a80] text-white px-6 py-2 rounded-lg hover:bg-[#111b52] transition-colors font-medium shadow-sm"
          >
            Create Product
          </Link>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <>
          <TableContainer
            component={Paper}
            elevation={0}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            <Table aria-label="collapsible table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: "#f8fafc", width: 60 }} align="center" />
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: "text.secondary",
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                      letterSpacing: "0.05em",
                      bgcolor: "#f8fafc",
                    }}
                  >
                    Product
                  </TableCell>
                  <TableCell
                    sx={{
                      display: { xs: "none", md: "table-cell" },
                      fontWeight: "bold",
                      color: "text.secondary",
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                      letterSpacing: "0.05em",
                      bgcolor: "#f8fafc",
                    }}
                  >
                    Category
                  </TableCell>
                  <TableCell
                    sx={{
                      display: { xs: "none", sm: "table-cell" },
                      fontWeight: "bold",
                      color: "text.secondary",
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                      letterSpacing: "0.05em",
                      bgcolor: "#f8fafc",
                    }}
                  >
                    Delivery
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      color: "text.secondary",
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                      letterSpacing: "0.05em",
                      bgcolor: "#f8fafc",
                    }}
                  >
                    Inventory
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      color: "text.secondary",
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                      letterSpacing: "0.05em",
                      bgcolor: "#f8fafc",
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: "bold",
                      color: "text.secondary",
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                      letterSpacing: "0.05em",
                      bgcolor: "#f8fafc",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProducts.map((product) => (
                  <Row
                    key={product.id}
                    product={product}
                    onEdit={handleOpenEdit}
                    onArchive={handleArchiveProduct}
                    onHardDelete={handleHardDeleteProduct}
                    onRestore={handleRestoreProduct}
                    onDuplicate={handleDuplicateProduct}
                    isHighlighted={product.id === Number(highlightId)}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {pageCount > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                count={pageCount}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col justify-center items-center w-full py-12 bg-white rounded-lg border border-gray-200 border-dashed">
          <Typography variant="h6" color="text.secondary">
            {products.length === 0
              ? "No products available"
              : "No products found matching your search."}
          </Typography>
          {products.length === 0 && (
            <Link href="/shop/products/add" className="mt-4 text-blue-600 hover:underline">
              Create your first product
            </Link>
          )}
          {products.length > 0 && (searchTerm || statusFilter !== "all") && (
            <Button
              variant="contained"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setCurrentPage(1)
              }}
              sx={{ mt: 2 }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      <Modal open={openEdit} onClose={handleCloseEdit}>
        <Box
          sx={{
            ...style,
            overflow: "auto",
            maxHeight: "90vh",
          }}
          className="scrollbar-seamless"
        >
          <EditProductForm
            currentUser={
              selectedProduct as unknown as React.ComponentProps<
                typeof EditProductForm
              >["currentUser"]
            }
            handleCloseEdit={handleCloseEdit}
            refetchProducts={async () => {
              await refetch()
            }}
          />
        </Box>
      </Modal>

      <Dialog open={confirmOpen} onClose={handleConfirmClose}>
        <DialogTitle>Confirm</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAccept}
            color={confirmColor}
            variant="contained"
            disableElevation
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default ProductList
