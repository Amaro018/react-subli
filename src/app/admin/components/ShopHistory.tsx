"use client"

import React, { useQuery } from "@blitzjs/rpc"
import getShopActionHistory from "../../queries/getShopActionHistory"
import { Box, Typography, CircularProgress } from "@mui/material"

interface HistoryItem {
  date: Date
  action: string
  details: string
  actor?: string | null
}

interface ShopActionHistoryProps {
  shopId: number
  shopName: string
}

export default function ShopActionHistory({ shopId, shopName }: ShopActionHistoryProps) {
  const [historyData, { isLoading, isError }] = useQuery(getShopActionHistory, {
    shopId,
    shopName,
  })

  return (
    <Box
      sx={{
        margin: 1,
        padding: { xs: 1, sm: 2 },
        bgcolor: "rgb(249 250 251)",
        borderRadius: 1,
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        component="div"
        sx={{
          mb: 2,
          fontWeight: 600,
        }}
      >
        Action History
      </Typography>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <CircularProgress size={24} />

          <p className="text-gray-500 ml-3">Loading history...</p>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="py-4">
          <p className="text-red-500">Error loading history.</p>
        </div>
      )}

      {/* History */}
      {!isLoading && !isError && historyData && historyData.length > 0 && (
        <div className="space-y-4">
          {(historyData as HistoryItem[]).map((item: HistoryItem, itemIndex: number) => (
            <div key={itemIndex} className="flex gap-4">
              {/* Date / Time */}
              <div className="text-right w-32 flex-shrink-0">
                <p className="font-semibold text-sm text-gray-700">
                  {new Date(item.date).toLocaleDateString()}
                </p>

                <p className="text-xs text-gray-500">{new Date(item.date).toLocaleTimeString()}</p>
              </div>

              {/* Timeline */}
              <div className="relative pl-4">
                {/* Vertical line */}
                <div className="absolute left-0 top-1.5 h-full w-px bg-gray-300" />

                {/* Timeline dot */}
                <div className="absolute left-[-4.5px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-500" />

                {/* Action */}
                <p className="font-bold text-blue-600">{item.action}</p>

                {/* Details */}
                <p className="text-sm text-gray-600 mt-1">{item.details}</p>

                {/* Actor */}
                {item.actor && <p className="text-xs text-gray-500 mt-1">By: {item.actor}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && historyData && historyData.length === 0 && (
        <div className="py-4">
          <p className="text-gray-500">No action history found for this shop.</p>
        </div>
      )}
    </Box>
  )
}
