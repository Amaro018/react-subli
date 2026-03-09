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
import { toast } from "sonner"

export const ReviewList = (props: any): React.ReactElement | null => {
  const currentUser = props.currentUser
  const userId = currentUser.id
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const currentStatus = searchParams.get("status") || "all"

  const [userRents, { refetch }] = useQuery(getAllRentOfUser, { id: userId })
  const [addReview] = useMutation(addProductReview)

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

  const [review, setReview] = React.useState(0)
  const [openReview, setOpenReview] = React.useState(false)

  const [selectedItem, setSelectedItem] = React.useState<any>(null)
  const [comment, setComment] = useState("")
  const [anonymous, setAnonymous] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    const params = new URLSearchParams(searchParams)
    if (newValue === "all") {
      params.delete("status")
    } else {
      params.set("status", newValue)
    }
    router.replace(`${pathname}?${params.toString()}` as any)
    setCurrentPage(1)
  }

  // Filter rents based on whether they have items matching the current tab
  const filteredRents = userRents.filter((rent) => {
    if (currentStatus === "all") {
      return rent.items.some((item) => item.status === "completed")
    }
    if (currentStatus === "to-rate") {
      return rent.items.some((item) => item.status === "completed" && !item.isReviewed)
    }
    if (currentStatus === "reviewed") {
      return rent.items.some((item) => item.isReviewed)
    }
    return false
  })

  const toRateCount = userRents.filter((rent) => {
    return rent.items.some((item) => item.status === "completed" && !item.isReviewed)
  }).length

  // Paginate rents
  const totalPages = Math.ceil(filteredRents.length / itemsPerPage)
  const paginatedRents = filteredRents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleCloseReview = () => {
    setOpenReview(false)
    setReview(0)
    setComment("")
    setAnonymous(false)
  }
  const handleReviewChange = (event: React.SyntheticEvent, rating: number | null, item: any) => {
    setReview(rating || 0)
    setOpenReview(true)
    setSelectedItem(item)
  }

  const handleReviewSubmit = async () => {
    const productId = selectedItem?.productVariant?.product?.id

    if (selectedItem !== null && review !== 0) {
      try {
        await addReview({
          productId: productId,
          rentItemId: selectedItem?.id,
          rating: review,
          userId: currentUser.id,
          anonymous: anonymous,
          comment: comment,
        })
        setOpenReview(false)
        await refetch()
        toast.success("Review submitted successfully!")
      } catch (error) {
        console.error("Error submitting review:", error)
      }
    }
  }

  if (!userRents) {
    return <CircularProgress />
  }

  const getEmptyMessage = () => {
    switch (currentStatus) {
      case "all":
        return "No reviews found"
      case "to-rate":
        return "No items to rate found"
      case "reviewed":
        return "No reviewed items found"
      default:
        return "No reviews found"
    }
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

      {/* Review List */}
      {paginatedRents.length === 0 && <p className="text-center">{getEmptyMessage()}</p>}
      {paginatedRents.map((rent) => (
        <div
          className="border rounded-lg shadow-md p-4 bg-white flex justify-start gap-16 my-2 w-full"
          key={rent.id}
        >
          <div className="flex flex-col w-full">
            <div className="flex justify-between items-center w-full border-b border-gray-200 p-2">
              <p>Order ID: {rent.id}</p>
              <p className="font-bold bg-gray-200 p-2 rounded-full">{rent.status}</p>
            </div>

            {rent.items
              .filter((item) => {
                if (currentStatus === "all") return item.status === "completed"
                if (currentStatus === "to-rate")
                  return item.status === "completed" && !item.isReviewed
                if (currentStatus === "reviewed") return item.isReviewed
                return false
              })
              .map((item) => (
                <div
                  key={item.id}
                  className="flex justify-start items-center w-full border-b border-gray-200 p-2 gap-2"
                >
                  <Image
                    src={`/uploads/products/${item.productVariant.product.images[0]?.url}`}
                    alt={item.productVariant.product.name}
                    width={100}
                    height={100}
                    className="w-24 h-24 object-cover rounded"
                  />

                  <div className="flex flex-col justify-between h-full">
                    <p className="font-bold underline text-slate-600">
                      {item.productVariant.product.shop.shopName}
                    </p>
                    <p>{item.productVariant.product.name}</p>
                    <p>
                      {item.productVariant.size} - {item.productVariant.color.name}
                    </p>
                  </div>

                  {item.isReviewed ? (
                    <div className="flex flex-col justify-between h-full ml-4 border-l border-gray-200 pl-4">
                      <p>Your Review</p>
                      <Rating
                        name="review"
                        value={item.reviews[0]?.rating}
                        precision={0.25}
                        readOnly
                      />
                      {item.reviews[0]?.comment && (
                        <p className="text-sm text-gray-500 italic">
                          &quot;{item.reviews[0]?.comment}&quot;
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col justify-between h-full ml-4 border-l border-gray-200 pl-4">
                      <p>Rate this item</p>
                      <Rating
                        name="review"
                        precision={0.25}
                        onChange={(event, newValue) => handleReviewChange(event, newValue, item)}
                      />
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}

      <Modal open={openReview} onClose={handleCloseReview}>
        <Box sx={style}>
          <div className="flex flex-row justify-between items-center">
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Review for {selectedItem?.productVariant?.product?.name}
            </Typography>

            <div className="flex flex-row gap-2 items-center">
              <Typography id="modal-modal-description">
                <Rating
                  name="rating"
                  value={review}
                  onChange={(event, newNewValue) => setReview(newNewValue || 0)}
                  precision={0.25}
                />
              </Typography>
              <p className="text-slate-600 font-bold text-lg">{review}</p>
            </div>
          </div>

          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
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
            <label htmlFor="anonymous">Rate as Anonymous</label>
          </div>

          <div className="flex flex-row justify-end gap-2 mt-4">
            <Button onClick={handleReviewSubmit} variant="contained">
              Submit Review
            </Button>
            <Button onClick={handleCloseReview} variant="outlined">
              Close
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
