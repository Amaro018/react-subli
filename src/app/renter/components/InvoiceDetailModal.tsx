"use client"

import React from "react"
import { useQuery } from "@blitzjs/rpc"
import getInvoice from "../../queries/getInvoice"
import getShopInvoice from "../../queries/getShopInvoice"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material"
import PrintIcon from "@mui/icons-material/Print"

interface Props {
  invoiceId: number
  open: boolean
  onClose: () => void
  audience?: "renter" | "shop"
}

export default function InvoiceDetailModal({
  invoiceId,
  open,
  onClose,
  audience = "renter",
}: Props) {
  const invoiceQuery = audience === "shop" ? getShopInvoice : getInvoice
  const [invoice, { isLoading }] = useQuery(
    invoiceQuery,
    { id: invoiceId },
    { enabled: Boolean(invoiceId), suspense: false }
  )

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {isLoading || !invoice ? (
        <div className="p-12 flex justify-center items-center">
          <CircularProgress />
        </div>
      ) : (
        <>
          <DialogTitle className="flex justify-between items-center border-b pb-3">
            <div>
              <Typography variant="h6" fontWeight="bold">
                {invoice.invoiceNumber}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Issued: {new Date(invoice.issuedAt).toLocaleDateString()}
              </Typography>
            </div>
            <Typography variant="subtitle2" className="px-3 py-1 bg-slate-100 rounded-full">
              Type: {invoice.type}
            </Typography>
          </DialogTitle>

          <DialogContent className="py-6 flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div>
                <Typography variant="caption" color="text.secondary" display="block">
                  Billed To
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold">
                  {invoice.rent.user?.personalInfo?.firstName}{" "}
                  {invoice.rent.user?.personalInfo?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {invoice.rent.deliveryAddress}
                </Typography>
              </div>

              <div className="text-right">
                <Typography variant="caption" color="text.secondary" display="block">
                  Payment Status
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                  {invoice.status}
                </Typography>
              </div>
            </div>

            <Divider />

            {/* Line Items */}
            <Typography variant="subtitle2" fontWeight="bold">
              Invoice Summary
            </Typography>

            <Table size="small">
              <TableHead className="bg-slate-50">
                <TableRow>
                  <TableCell className="font-bold">Description</TableCell>
                  <TableCell className="font-bold" align="center">
                    Qty
                  </TableCell>
                  <TableCell className="font-bold" align="right">
                    Unit Price
                  </TableCell>
                  <TableCell className="font-bold" align="right">
                    Amount
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="right">₱{item.unitPrice.toLocaleString()}</TableCell>
                    <TableCell align="right">₱{item.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end mt-2">
              <div className="w-64 flex flex-col gap-1 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>₱{invoice.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Upfront payment required:</span>
                  <span>₱{invoice.securityDeposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Extra Charges:</span>
                  <span>₱{invoice.extraCharges.toLocaleString()}</span>
                </div>
                <Divider className="my-1" />
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total Amount:</span>
                  <span>₱{invoice.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Amount Paid:</span>
                  <span>-₱{invoice.amountPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-red-600 text-base pt-1">
                  <span>Balance Due:</span>
                  <span>₱{invoice.balanceDue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </DialogContent>

          <DialogActions className="border-t p-4">
            <Button onClick={onClose} variant="text" color="inherit">
              Close
            </Button>
            <Button onClick={handlePrint} startIcon={<PrintIcon />} variant="contained">
              Print Statement
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}
