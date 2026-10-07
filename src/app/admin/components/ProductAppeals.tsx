"use client"

import { useMutation, useQuery } from "@blitzjs/rpc"
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  TextField,
  Typography,
} from "@mui/material"
import { useState } from "react"
import { toast } from "@/src/app/utils/toast"
import getPendingProductAppeals from "../../queries/getPendingProductAppeals"
import reviewProductAppeal from "../../mutations/reviewProductAppeal"

type Appeal = Awaited<ReturnType<typeof getPendingProductAppeals>>[number]
type Decision = "approved" | "rejected"

export default function ProductAppeals() {
  const [appeals, { isLoading, isError, error, refetch }] = useQuery(
    getPendingProductAppeals,
    null,
    { suspense: false }
  )
  const [reviewAppeal, { isLoading: isReviewing }] = useMutation(reviewProductAppeal)
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null)
  const [decision, setDecision] = useState<Decision>("rejected")
  const [adminNote, setAdminNote] = useState("")

  const openDecision = (appeal: Appeal, nextDecision: Decision) => {
    setSelectedAppeal(appeal)
    setDecision(nextDecision)
    setAdminNote("")
  }

  const handleReview = async () => {
    if (!selectedAppeal || !adminNote.trim()) return

    try {
      await reviewAppeal({
        appealId: selectedAppeal.id,
        status: decision,
        adminNote,
      })
      toast.success(
        decision === "approved" ? "Appeal approved; product restored." : "Appeal rejected."
      )
      setSelectedAppeal(null)
      try {
        await refetch()
      } catch {
        toast.error("The appeal was reviewed, but the queue could not be refreshed.")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to review the appeal.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <CircularProgress />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert severity="error">
        {error instanceof Error ? error.message : "Failed to load appeals."}
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <Typography variant="h5" component="h1" fontWeight="bold">
          Product Ban Appeals
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review shop evidence. Approving an appeal restores the product listing.
        </Typography>
      </div>

      {appeals?.length ? (
        appeals.map((appeal) => (
          <Paper key={appeal.id} variant="outlined" className="space-y-3 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Typography variant="h6">{appeal.product.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {appeal.product.shop.shopName} · {appeal.product.shop.email} · Submitted{" "}
                  {new Date(appeal.createdAt).toLocaleString()}
                </Typography>
              </div>
              <Button
                component="a"
                href={`/products/${appeal.product.id}`}
                target="_blank"
                rel="noreferrer"
                variant="outlined"
                size="small"
              >
                View product
              </Button>
            </div>
            <Alert severity="warning">
              <strong>Ban reason:</strong> {appeal.product.banReason || "No reason recorded."}
            </Alert>
            <Typography sx={{ whiteSpace: "pre-wrap" }}>{appeal.message}</Typography>
            <div className="flex gap-2">
              <Button
                variant="contained"
                color="success"
                onClick={() => openDecision(appeal, "approved")}
              >
                Approve and restore
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => openDecision(appeal, "rejected")}
              >
                Reject appeal
              </Button>
            </div>
          </Paper>
        ))
      ) : (
        <Paper variant="outlined" className="p-8 text-center">
          <Typography color="text.secondary">There are no pending product appeals.</Typography>
        </Paper>
      )}

      <Dialog open={Boolean(selectedAppeal)} onClose={() => setSelectedAppeal(null)} fullWidth>
        <DialogTitle>
          {decision === "approved" ? "Approve product appeal" : "Reject product appeal"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {decision === "approved"
              ? "This will restore the product to active status and clear its ban reason."
              : "The product will remain banned. Provide a reason the shop can see."}
          </DialogContentText>
          <TextField
            autoFocus
            label="Decision note"
            value={adminNote}
            onChange={(event) => setAdminNote(event.target.value)}
            multiline
            minRows={3}
            fullWidth
            inputProps={{ maxLength: 2000 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAppeal(null)} disabled={isReviewing}>
            Cancel
          </Button>
          <Button
            onClick={handleReview}
            disabled={!adminNote.trim() || isReviewing}
            color={decision === "approved" ? "success" : "error"}
          >
            {isReviewing
              ? "Saving..."
              : decision === "approved"
              ? "Approve appeal"
              : "Reject appeal"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
