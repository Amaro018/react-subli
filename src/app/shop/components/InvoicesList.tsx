"use client"

import React, { useState } from "react"
import { useQuery } from "@blitzjs/rpc"
import getShopInvoices from "../../queries/getShopInvoices"
import InvoiceDetailModal from "../../renter/components/InvoiceDetailModal"
import {
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import ReceiptIcon from "@mui/icons-material/Receipt"
import VisibilityIcon from "@mui/icons-material/Visibility"

const statusChip = (status: string) => {
  const color = status === "PAID" ? "success" : status === "PARTIALLY_PAID" ? "warning" : "error"
  return <Chip label={status.replace(/_/g, " ")} color={color} size="small" variant="outlined" />
}

export default function InvoicesList() {
  const [invoices = []] = useQuery(getShopInvoices, null, { suspense: false })
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null)
  const outstanding = invoices.reduce((sum, invoice) => sum + invoice.balanceDue, 0)

  if (invoices.length === 0) {
    return (
      <Paper className="py-16 flex flex-col items-center text-center p-6 rounded-xl border border-gray-100">
        <ReceiptIcon sx={{ fontSize: 48, color: "#94a3b8" }} />
        <Typography variant="h6" className="mt-2">
          No shop invoices found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Invoices are created automatically when customers place rental orders.
        </Typography>
      </Paper>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Paper className="p-4 rounded-xl border border-gray-100">
          <Typography variant="caption" color="text.secondary">
            Shop invoices
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {invoices.length}
          </Typography>
        </Paper>
        <Paper className="p-4 rounded-xl border border-gray-100">
          <Typography variant="caption" color="text.secondary">
            Outstanding balance
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="error.main">
            ₱{outstanding.toLocaleString()}
          </Typography>
        </Paper>
      </div>
      <TableContainer
        component={Paper}
        className="rounded-xl border border-gray-100 overflow-hidden"
      >
        <Table>
          <TableHead className="bg-slate-50">
            <TableRow>
              <TableCell className="font-bold">Invoice</TableCell>
              <TableCell className="font-bold">Renter</TableCell>
              <TableCell className="font-bold">Due date</TableCell>
              <TableCell className="font-bold">Total</TableCell>
              <TableCell className="font-bold">Status</TableCell>
              <TableCell align="right" className="font-bold">
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id} hover>
                <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                <TableCell>
                  {invoice.rent.user.personalInfo?.firstName || "Renter"}{" "}
                  {invoice.rent.user.personalInfo?.lastName || ""}
                </TableCell>
                <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>₱{invoice.totalAmount.toLocaleString()}</TableCell>
                <TableCell>{statusChip(invoice.status)}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => setSelectedInvoiceId(invoice.id)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {selectedInvoiceId && (
        <InvoiceDetailModal
          invoiceId={selectedInvoiceId}
          open
          audience="shop"
          onClose={() => setSelectedInvoiceId(null)}
        />
      )}
    </div>
  )
}
