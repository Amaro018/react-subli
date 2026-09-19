"use client"
import React, { useState } from "react"
import {
  CircularProgress,
  Button,
  Rating,
  Modal,
  Box,
  TextField,
  Checkbox,
  Tabs,
  Tab,
  Typography,
  Badge,
} from "@mui/material"
import { useMutation, useQuery } from "@blitzjs/rpc"
import getAllRentOfUser from "../../queries/getAllRentOfUser"
import Image from "next/image"
import addProductReview from "../../mutations/addProductReview"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { toast } from "@/src/app/utils/toast"

export const ReviewList = (props: any): React.ReactElement | null => {
  const currentUser = props.currentUser
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const currentStatus = searchParams.get("status") || "all"

  // Query now returns a flattened array of RentItems
  const [rentItems, { refetch }] = useQuery(getAllRentOfUser, undefined)
  const [addReview] = useMutation(addProductReview)

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    bgcolor: "background.paper",
    border: "1px solid #ccc",
    boxShadow: 24,
    p: 4,
    borderRadius: "10px",
  }

  const [review, setReview] = useState<number>(0)
  const [openReview, setOpenReview] = useState<boolean>(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [comment, setComment] = useState<string>("")
  const [anonymous, setAnonymous] = useState<boolean>(false)

  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 5

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    const params = new URLSearchParams(searchParams)
    if (newValue === "all") {
      params.delete("status")
    } else {
      params.set("status", newValue)
    }
    router.replace(`${pathname}?${params.toString()}` as any)
    setCurrentPage(1)
  }

  if (!rentItems) {
    return <CircularProgress />
  }

  // Filter flattened rent items according to tab status
  const filteredItems = rentItems.filter((item: any) => {
    if (currentStatus === "all") {
      return item.status === "completed"
    }
    if (currentStatus === "to-rate") {
      return item.status === "completed" && !item.isReviewed
    }
    if (currentStatus === "reviewed") {
      return item.isReviewed
    }
    return false
  })

  // Count items needing review
  const toRateCount = rentItems.filter(
    (item: any) => item.status === "completed" && !item.isReviewed
  ).length

  // Paginate items
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleCloseReview = () => {
    setOpenReview(false)
    setReview(0)
    setComment("")
    setAnonymous(false)
    setSelectedItem(null)
  }

  const handleReviewChange = (_event: React.SyntheticEvent, rating: number | null, item: any) => {
    setReview(rating || 0)
    setSelectedItem(item)
    setOpenReview(true)
  }

  const handleReviewSubmit = async () => {
    const productId = selectedItem?.productVariant?.product?.id

    if (selectedItem && review !== 0) {
      try {
        await addReview({
          productId: productId,
          rentItemId: selectedItem.id,
          rating: review,
          anonymous: anonymous,
          comment: comment,
        })
        handleCloseReview()
        await refetch()
        toast.success("Review submitted successfully!")
      } catch (error) {
        console.error("Error submitting review:", error)
        toast.error("Failed to submit review")
      }
    }
  }

  const getEmptyMessage = () => {
    switch (currentStatus) {
      case "all":
        return "No completed rental items found"
      case "to-rate":
        return "No items waiting to be rated"
      case "reviewed":
        return "No reviewed items found"
      default:
        return "No rental items found"
    }
  }

  // Helper to format attributes (e.g., Color / Size)
  const getAttributesDisplay = (attributes: any[]) => {
    if (!attributes || attributes.length === 0) return null
    return attributes
      .map((attr) => attr?.attributeValue?.value)
      .filter(Boolean)
      .join(" / ")
  }

  return (
    <div className="w-full">
      {/* Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={currentStatus}
          onChange={handleTabChange}
          aria-label="review status tabs"
          variant="fullWidth"
        >
          <Tab label="All" value="all" />
          <Tab
            label={
              <Badge badgeContent={toRateCount} color="error">
                To Rate
              </Badge>
            }
            value="to-rate"
          />
          <Tab label="Reviewed" value="reviewed" />
        </Tabs>
      </Box>

      {/* Item List */}
      {paginatedItems.length === 0 && <p className="text-center py-8">{getEmptyMessage()}</p>}

      {paginatedItems.map((item: any) => {
        const product = item.productVariant?.product
        const thumbnail = product?.images?.[0]?.url
          ? `/uploads/products/${product.images[0].url}`
          : "/placeholder.png"
        const variantAttributes = getAttributesDisplay(item.productVariant?.attributes)

        return (
          <div
            className="border rounded-lg shadow-md p-4 bg-white flex justify-between gap-4 my-2 w-full"
            key={item.id}
          >
            <div className="flex flex-col w-full gap-2">
              <div className="flex justify-between items-center w-full border-b border-gray-200 pb-2">
                <p className="text-sm text-gray-500">Order ID: #{item.rent?.id ?? item.rentId}</p>
                <p className="font-bold text-xs bg-gray-200 px-3 py-1 rounded-full uppercase">
                  {item.status}
                </p>
              </div>

              <div className="flex justify-between items-center w-full pt-2">
                <div className="flex gap-4 items-center">
                  <Image
                    src={thumbnail}
                    alt={product?.name || "Product image"}
                    width={96}
                    height={96}
                    className="w-24 h-24 object-cover rounded"
                  />

                  <div className="flex flex-col justify-center gap-1">
                    <p className="font-bold underline text-slate-600">
                      {product?.shop?.shopName || "Shop"}
                    </p>
                    <p className="font-medium text-gray-900">{product?.name}</p>
                    {variantAttributes && (
                      <p className="text-sm text-gray-500">{variantAttributes}</p>
                    )}
                  </div>
                </div>

                {item.isReviewed ? (
                  <div className="flex flex-col justify-center min-w-[200px] border-l border-gray-200 pl-4">
                    <p className="text-sm font-semibold mb-1">Your Review</p>
                    <Rating
                      name={`item-review-${item.id}`}
                      value={item.reviews[0]?.rating || 0}
                      precision={0.25}
                      readOnly
                    />
                    {item.reviews[0]?.comment && (
                      <p className="text-sm text-gray-500 italic mt-1">
                        &quot;{item.reviews[0].comment}&quot;
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col justify-center min-w-[200px] border-l border-gray-200 pl-4">
                    <p className="text-sm font-semibold mb-1">Rate this item</p>
                    <Rating
                      name={`rate-${item.id}`}
                      precision={0.25}
                      onChange={(event, newValue) => handleReviewChange(event, newValue, item)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Review Modal */}
      <Modal open={openReview} onClose={handleCloseReview}>
        <Box sx={style}>
          <div className="flex flex-row justify-between items-center">
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Review for {selectedItem?.productVariant?.product?.name}
            </Typography>

            <div className="flex flex-row gap-2 items-center">
              <Rating
                name="modal-rating"
                value={review}
                onChange={(_event, newValue) => setReview(newValue || 0)}
                precision={0.25}
              />
              <span className="text-slate-600 font-bold text-lg">{review}</span>
            </div>
          </div>

          <Typography id="modal-modal-description" component="div" sx={{ mt: 2 }}>
            <TextField
              id="outlined-multiline-static"
              label="Write a review"
              name="comment"
              multiline
              rows={4}
              fullWidth
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </Typography>

          <div className="flex flex-row gap-2 items-center mt-2">
            <Checkbox
              id="anonymous"
              name="anonymous"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
            />
            <label htmlFor="anonymous" className="text-sm text-gray-700 cursor-pointer">
              Rate as Anonymous
            </label>
          </div>

          <div className="flex flex-row justify-end gap-2 mt-4">
            <Button onClick={handleReviewSubmit} variant="contained" color="primary">
              Submit Review
            </Button>
            <Button onClick={handleCloseReview} variant="outlined">
              Cancel
            </Button>
          </div>
        </Box>
      </Modal>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center my-4 items-center">
          <Button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>
            Previous
          </Button>
          <Typography className="mx-2">
            Page {currentPage} of {totalPages}
          </Typography>
          <Button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
