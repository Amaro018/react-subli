import React, { useState } from "react"
import { Rating, TextField, Pagination, MenuItem } from "@mui/material"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import ResponsiveImage from "./ResponsiveImage"

interface ProductReviewsProps {
  reviews: any[]
}

export default function ProductReviews({ reviews }: ProductReviewsProps) {
  const [isReviewsOpen, setIsReviewsOpen] = useState(true)
  const [reviewPage, setReviewPage] = useState(1)
  const [reviewSort, setReviewSort] = useState("newest")
  const REVIEWS_PER_PAGE = 10

  const sortedReviews = React.useMemo(() => {
    if (!reviews) return []
    return [...reviews].sort((a: any, b: any) => {
      if (reviewSort === "newest")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (reviewSort === "oldest")
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (reviewSort === "highest") return b.rating - a.rating
      if (reviewSort === "lowest") return a.rating - b.rating
      return 0
    })
  }, [reviews, reviewSort])

  const totalReviewPages = Math.ceil((sortedReviews.length || 0) / REVIEWS_PER_PAGE)
  const paginatedReviews = sortedReviews.slice(
    (reviewPage - 1) * REVIEWS_PER_PAGE,
    reviewPage * REVIEWS_PER_PAGE
  )

  return (
    <div id="reviews-section" className="mt-8 pt-8 border-t border-gray-200 w-full scroll-mt-24">
      <div className="bg-white rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setIsReviewsOpen((prev) => !prev)}
          className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors focus:outline-none"
          aria-expanded={isReviewsOpen}
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Product Reviews</h2>
            <p className="text-gray-500 mt-1 text-sm font-normal">
              See what other renters are saying about this item
            </p>
          </div>
          <svg
            className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${
              isReviewsOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div
          className={`transition-all duration-300 ease-in-out ${
            isReviewsOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-6 pt-0 w-full">
            {reviews?.length > 0 ? (
              <>
                <div className="flex justify-end mb-6">
                  <TextField
                    select
                    size="small"
                    value={reviewSort}
                    onChange={(e) => {
                      setReviewSort(e.target.value)
                      setReviewPage(1)
                    }}
                    sx={{ minWidth: 160 }}
                  >
                    <MenuItem value="newest">Newest First</MenuItem>
                    <MenuItem value="oldest">Oldest First</MenuItem>
                    <MenuItem value="highest">Highest Rating</MenuItem>
                    <MenuItem value="lowest">Lowest Rating</MenuItem>
                  </TextField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paginatedReviews.map((review: any, index: number) => (
                    <div
                      key={review?.id || `review-${index}`}
                      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-row items-center gap-4">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          <ResponsiveImage
                            src={review.isAnonymous ? null : review.user?.profileImage}
                            imageType="renter-profile"
                            alt="Profile Picture"
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col">
                          <p className="font-bold text-gray-900">
                            {review.isAnonymous
                              ? "Anonymous"
                              : `${review.user.personalInfo?.firstName || ""} ${
                                  review.user.personalInfo?.lastName || ""
                                }`}
                          </p>
                          <Rating
                            name="review"
                            value={review.rating}
                            precision={0.25}
                            size="small"
                            readOnly
                          />
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                      {review.createdAt && (
                        <p className="text-xs text-gray-400 mt-auto pt-2">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {totalReviewPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      count={totalReviewPages}
                      page={reviewPage}
                      onChange={(e, value) => {
                        setReviewPage(value)
                        document
                          .getElementById("reviews-section")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }}
                      color="primary"
                      shape="rounded"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center flex flex-col items-center justify-center">
                <InfoOutlinedIcon className="text-gray-400 mb-3" sx={{ fontSize: 48 }} />
                <p className="text-gray-600 font-medium">No reviews yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Be the first to rent and review this item.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
