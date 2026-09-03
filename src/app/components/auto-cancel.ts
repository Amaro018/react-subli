import { NextApiRequest, NextApiResponse } from "next"
import db from "db"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Security check: Ensure only your authorized cron service can trigger this endpoint
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  try {
    const now = new Date()

    // Update all pending orders where the start date has passed
    const result = await db.rent.updateMany({
      where: {
        status: "pending",
        startDate: {
          lt: now, // "Less than" the current time
        },
      },
      data: {
        status: "cancelled",
      },
    })

    res.status(200).json({ success: true, cancelledCount: result.count })
  } catch (error) {
    console.error("Failed to auto-cancel orders:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}
