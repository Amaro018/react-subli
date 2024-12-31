"use client"
import React, { useState } from "react"
import {
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Rating,
  Modal,
  Box,
  TextField,
  Checkbox,
  FormControl,
  MenuItem,
  InputLabel,
  Select,
} from "@mui/material"
import { useMutation, useQuery } from "@blitzjs/rpc"
import getAllRentOfUser from "../../queries/getAllRentOfUser"
import { useParams } from "next/navigation"
import { user } from "@nextui-org/theme"
import Image from "next/image"
import { p } from "vitest/dist/index-9f5bc072"
import { set } from "zod"
import addProductReview from "../../mutations/addProductReview"

export const RentList: React.FC = (props: any) => {
  const currentUser = props.currentUser
  const userId = currentUser.id

  const [userRents, { refetch }] = useQuery(getAllRentOfUser, { id: userId })
  const [addReview] = useMutation(addProductReview)

  if (!userRents) {
    return <CircularProgress />
  }
  // console.log(userRents)

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

  const [selectedItem, setSelectedItem] = React.useState<number | null>(null)
  const [comment, setComment] = useState("")
  const [anonymous, setAnonymous] = useState(false)

  //this is for filtering and sorting data
  const [filterStatus, setFilterStatus] = useState("all") // Filter status
  const [currentPage, setCurrentPage] = useState(1) // Current page
  const itemsPerPage = 3

  // Filter rents by status
  const filteredRents =
    filterStatus === "all" ? userRents : userRents.filter((rent) => rent.status === filterStatus)

  // Paginate rents
  const totalPages = Math.ceil(filteredRents.length / itemsPerPage)
  const paginatedRents = filteredRents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleCloseReview = () => {
    setOpenReview(false)
    setReview(0)
  }
  const handleReviewChange = (event, rating: number, item: any) => {
    setReview(rating)
    setOpenReview(true)

    // console.log("Selected Item ID:", item);
    // console.log("Rating for the item:", rating);

    // Save the itemId in state to track which item is being reviewed
    setSelectedItem(item)
  }

  // State to track the currently selected item's ID
  // console.log("Selected Item:", selectedItem);

  const handleReviewSubmit = async () => {
    const variantId = selectedItem?.productVariant?.id
    const productId = selectedItem?.productVariant?.product?.id
    console.log("variant ID:", variantId)
    console.log("productId", productId)

    if (selectedItem !== null && review !== 0) {
      try {
        const newReview = await addReview({
          productId: productId,
          rentItemId: selectedItem?.id,
          rating: review,
          userId: currentUser.id,
          anonymous: anonymous,
          comment: comment,
        })
        console.log("Review submitted successfully:", review)
        setOpenReview(false)
        alert("Review submitted successfully!")
      } catch (error) {
        console.error("Error submitting review:", error)
      }
    }
  }

  return (
    <div className="w-full">
      {/* Filter Dropdown */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Status</InputLabel>
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          label="Status"
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
        </Select>
      </FormControl>

      {/* Rent List */}
      {paginatedRents.length === 0 && <p className="text-center">No rents</p>}
      {paginatedRents.map((rent) => (
        <div
          className="border rounded-lg shadow-md p-4 bg-white flex justify-start gap-16 my-2 w-full"
          key={rent.id}
        >
          <div className="flex flex-col w-full">
            <div className="flex justify-between items-center w-full border-b border-gray-200 p-2">
              <p>
                {rent.items.length > 1 ? "Items Renting :" : "Item Renting :"} {rent.items.length}
              </p>
              <p className="font-bold bg-gray-200 p-2 rounded-full">{rent.status}</p>
            </div>

            {rent.items.map((item) => {
              const startDate = new Date(item.startDate)
              const endDate = new Date(item.endDate)
              const today = new Date()

              // Check if today is past the end date
              const lapseInDays =
                item.status !== "completed" && today > endDate
                  ? Math.ceil((today - endDate) / (1000 * 60 * 60 * 24)) // Days overdue
                  : 0 // No penalty if today is before or on the end date OR status is "completed"

              const penalty = item.price * lapseInDays * item.quantity
              const totalPayment = item.payments.reduce(
                (total, payment) => total + payment.amount,
                0
              )

              return (
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
                    <p className="capitalize">{item.deliveryMethod}</p>
                  </div>

                  <div className="flex flex-col justify-between h-full ml-4">
                    <p>Price : {item.productVariant.price}</p>
                    <p>Qty : {item.quantity}</p>
                    <p>
                      Rent Range:{" "}
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      }).formatRange(new Date(item.startDate), new Date(item.endDate))}{" "}
                      - (
                      {Math.ceil(
                        (new Date(item.endDate).getTime() - new Date(item.startDate).getTime()) /
                          (1000 * 60 * 60 * 24) +
                          1
                      )}{" "}
                      days)
                    </p>
                  </div>

                  <div className="flex flex-col justify-between h-full ml-4">
                    <p>
                      Total :{" "}
                      {"\u20B1 " +
                        (
                          item.productVariant.price *
                          Math.ceil(
                            (new Date(item.endDate).getTime() -
                              new Date(item.startDate).getTime()) /
                              (1000 * 60 * 60 * 24) +
                              1
                          ) *
                          item.quantity
                        ).toLocaleString("en-PH")}
                    </p>
                    <p>
                      Penalty :{" "}
                      {item.status === "completed" ? (
                        <span className="text-green-600">Paid</span>
                      ) : (
                        <>
                          {penalty} ({lapseInDays} {lapseInDays > 1 ? "days" : "day"})
                        </>
                      )}
                    </p>

                    <p>
                      Amount Paid :{" "}
                      {item.status === "completed" ? (
                        <span className="text-green-600">Paid</span>
                      ) : (
                        totalPayment
                      )}
                    </p>

                    {item.status == "completed" ? (
                      <p className="text-green-600">Completed</p>
                    ) : (
                      <p>
                        balance :{" "}
                        {item.productVariant.price *
                          Math.ceil(
                            (new Date(item.endDate).getTime() -
                              new Date(item.startDate).getTime()) /
                              (1000 * 60 * 60 * 24) +
                              1
                          ) *
                          item.quantity -
                          totalPayment +
                          penalty}
                      </p>
                    )}
                  </div>

                  {item.isReviewed ? (
                    <div className="flex flex-col justify-between h-full ml-4 border-l border-gray-200">
                      <div className="ml-2">
                        <p>Review</p>
                        <Rating
                          name="review"
                          value={item.reviews[0]?.rating}
                          precision={0.25}
                          readOnly
                        />
                        <p>{item.reviews[0]?.rating}</p>
                      </div>
                    </div>
                  ) : (
                    item.status === "completed" && (
                      <div className="flex flex-col justify-between h-full ml-4 border-l border-gray-200">
                        <div className="ml-2">
                          <p>Review</p>
                          <Rating
                            name="review"
                            precision={0.25}
                            onChange={(event, newValue) =>
                              handleReviewChange(event, newValue, item)
                            }
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <Modal open={openReview} onClose={handleCloseReview}>
        <Box sx={style}>
          <div className="flex flex-row justify-between items-center">
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Review for Item ID: {selectedItem?.id}
            </Typography>

            <div className="flex flex-row gap-2 items-center">
              <Typography id="modal-modal-description">
                <Rating
                  name="rating"
                  value={review}
                  onChange={(event, newNewValue) => setReview(newNewValue)}
                  precision={0.25}
                />
              </Typography>
              <p className="text-slate-600 font-bold text-lg">{review}</p>
            </div>
          </div>

          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <TextField
              id="outlined-multiline-static"
              label="Review"
              name="comment"
              multiline
              rows={4}
              fullWidth
              value={comment} // Use the state here
              onChange={(e) => setComment(e.target.value)} // Update the state on change
            />
          </Typography>

          <div className="flex flex-row gap-2 items-center">
            <Checkbox
              id="anonymous"
              name="anonymous"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
            />
            <label htmlFor="anonymous">Rate as an Anonymous</label>
          </div>

          <div className="flex flex-row justify-end gap-2">
            <Button onClick={handleReviewSubmit}>Submit Review</Button>
            <Button onClick={handleCloseReview}>Close</Button>
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

      {/* <button onClick={() => console.log(currentUser)}>click me</button> */}
    </div>
  )
}
