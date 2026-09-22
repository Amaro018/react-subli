"use client"

import React, { useState } from "react"
import { useQuery } from "@blitzjs/rpc"
import getInvoices from "../../queries/getInvoices"
import InvoiceDetailModal from "./InvoiceDetailModal"
import {
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Tabs,
  Tab,
} from "@mui/material"
import ReceiptIcon from "@mui/icons-material/Receipt"
import VisibilityIcon from "@mui/icons-material/Visibility"

export default function InvoicesList() {
  const [invoices = []] = useQuery(getInvoices, null, {
    suspense: false,
    refetchOnWindowFocus: true,
  })

  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null)

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter === "ALL") return true
    return inv.status === statusFilter
  })

  const totalUnpaid = invoices
    .filter((inv) => inv.status !== "PAID")
    .reduce((acc, inv) => acc + inv.balanceDue, 0)

  const getStatusChip = (status: string) => {
    switch (status) {
      case "PAID":
        return <Chip label="Paid" color="success" size="small" variant="outlined" />
      case "PARTIALLY_PAID":
        return <Chip label="Partially Paid" color="warning" size="small" variant="outlined" />
      default:
        return <Chip label="Unpaid" color="error" size="small" variant="outlined" />
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Paper className="p-4 rounded-xl border border-gray-100 shadow-sm">
          <Typography variant="caption" color="text.secondary">
            Total Invoices
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {invoices.length}
          </Typography>
        </Paper>
        <Paper className="p-4 rounded-xl border border-gray-100 shadow-sm">
          <Typography variant="caption" color="text.secondary">
            Outstanding Balance
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="error.main">
            ₱{totalUnpaid.toLocaleString()}
          </Typography>
        </Paper>
      </div>

      {/* Filter Tabs */}
      <Tabs
        value={statusFilter}
        onChange={(_, newValue) => setStatusFilter(newValue)}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="All" value="ALL" />
        <Tab label="Unpaid" value="UNPAID" />
        <Tab label="Partially Paid" value="PARTIALLY_PAID" />
        <Tab label="Paid" value="PAID" />
      </Tabs>

      {/* Table */}
      {filteredInvoices.length === 0 ? (
        <Paper className="py-16 flex flex-col items-center justify-center text-center p-6 rounded-xl border border-gray-100 shadow-sm">
          <ReceiptIcon sx={{ fontSize: 48, color: "#94a3b8" }} className="mb-2" />
          <Typography variant="h6" className="text-gray-800">
            No invoices found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Invoices generated for your rental orders will appear here.
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          className="rounded-xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <Table>
            <TableHead className="bg-slate-50">
              <TableRow>
                <TableCell className="font-bold">Invoice Number</TableCell>
                <TableCell className="font-bold">Issued Date</TableCell>
                <TableCell className="font-bold">Due Date</TableCell>
                <TableCell className="font-bold">Total Amount</TableCell>
                <TableCell className="font-bold">Balance Due</TableCell>
                <TableCell className="font-bold">Status</TableCell>
                <TableCell className="font-bold" align="right">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.map((inv) => (
                <TableRow key={inv.id} hover>
                  <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                  <TableCell>{new Date(inv.issuedAt).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>₱{inv.totalAmount.toLocaleString()}</TableCell>
                  <TableCell className="font-semibold text-red-600">
                    ₱{inv.balanceDue.toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusChip(inv.status)}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => setSelectedInvoiceId(inv.id)}
                      variant="outlined"
                      sx={{ borderRadius: "8px", textTransform: "none" }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedInvoiceId && (
        <InvoiceDetailModal
          invoiceId={selectedInvoiceId}
          open={Boolean(selectedInvoiceId)}
          onClose={() => setSelectedInvoiceId(null)}
        />
      )}
    </div>
  )
}
