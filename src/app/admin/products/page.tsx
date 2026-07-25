"use client"
import React, { useState, useEffect, useMemo } from "react"
import { useQuery } from "@blitzjs/rpc"
import getAllProducts from "../../queries/getAllProducts"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Typography,
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
} from "@mui/material"
import VisibilityIcon from "@mui/icons-material/Visibility"
import DeleteIcon from "@mui/icons-material/Delete"

export default function ManageProductsPage() {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const highlightId = searchParams?.get("highlight")

  // Fetch all products
  const [products, { isLoading }] = useQuery(getAllProducts, null, {
    suspense: false,
  })

  // Sort by ID descending to see the most recently listed products at the top
  const newlyListedProducts = useMemo(() => {
    return products ? [...products].sort((a: any, b: any) => b.id - a.id) : []
  }, [products])

  useEffect(() => {
    if (highlightId && newlyListedProducts.length > 0) {
      const targetId = Number(highlightId)
      const index = newlyListedProducts.findIndex((p) => p.id === targetId)

      if (index !== -1) {
        const targetPage = Math.floor(index / rowsPerPage)

        if (page !== targetPage) {
          setPage(targetPage)
        } else {
          setTimeout(() => {
            const el = document.getElementById(`product-row-${targetId}`)
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" })

              // Clear the parameter from the URL after 2 seconds to fade out the highlight
              setTimeout(() => {
                const params = new URLSearchParams(searchParams.toString())
                if (params.has("highlight")) {
                  params.delete("highlight")
                  router.replace(
                    `${pathname}${params.toString() ? `?${params.toString()}` : ""}` as any,
                    { scroll: false }
                  )
                }
              }, 2000)
            }
          }, 100)
        }
      }
    }
  }, [highlightId, newlyListedProducts, page, rowsPerPage, pathname, router, searchParams])

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const paginatedProducts = newlyListedProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      // TODO: Add your delete mutation here
      console.log("Deleting product with ID:", id)
    }
  }

  return (
    <Box p={4} className="max-w-[1200px] mx-auto w-full">
      <Typography variant="h4" fontWeight="bold" color="#1b2a80" gutterBottom>
        Newly Listed Products
      </Typography>

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={0} className="border border-gray-200">
          <TableContainer>
            <Table>
              <TableHead className="bg-gray-50">
                <TableRow>
                  <TableCell className="font-bold">ID</TableCell>
                  <TableCell className="font-bold">Product Name</TableCell>
                  <TableCell className="font-bold">Shop Name</TableCell>
                  <TableCell className="font-bold">Category</TableCell>
                  <TableCell className="font-bold" align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProducts.map((product) => (
                  <TableRow
                    id={`product-row-${product.id}`}
                    key={product.id}
                    hover
                    sx={{
                      bgcolor: product.id === Number(highlightId) ? "#eef2ff" : "inherit",
                      transition: "background-color 0.5s ease",
                    }}
                  >
                    <TableCell>{product.id}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.shop?.shopName || "N/A"}</TableCell>
                    <TableCell>{product.category?.name || "N/A"}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Product">
                        <IconButton
                          component={Link}
                          href={`/product/${product.id}` as any}
                          color="primary"
                          size="small"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Product">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDelete(product.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={newlyListedProducts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
    </Box>
  )
}
