"use client"
import { useQuery, useMutation } from "@blitzjs/rpc"
import React, { useState, Fragment } from "react"
import {
  Button,
  Typography,
  Tooltip,
  Collapse,
  IconButton,
  Tabs,
  Tab,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import getShopReports from "../../queries/getShopReports"
import banShop from "src/app/mutations/banShop"
import dismissAllShopReports from "src/app/mutations/dismissAllShopReports"
import updateShopReportStatus from "src/app/mutations/updateShopReportStatus"
import { toast } from "@/src/app/utils/toast"
import { useCurrentUser } from "../../users/hooks/useCurrentUser"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import getShopActionHistory from "src/app/queries/getShopActionHistory"

type GroupedReport = Awaited<ReturnType<typeof getShopReports>>[number]
type ReportType = GroupedReport["reports"][number]

function Row({
  group,
  refetchReports,
  index,
}: {
  group: GroupedReport
  refetchReports: () => void
  index: number
}) {
  const currentUser = useCurrentUser()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [banShopMutation, { isLoading: isBanning }] = useMutation(banShop)
  const [dismissAllMutation, { isLoading: isDismissingAll }] = useMutation(dismissAllShopReports)
  const [updateReportStatusMutation] = useMutation(updateShopReportStatus)
  const [confirmBanOpen, setConfirmBanOpen] = useState(false)
  const [banReason, setBanReason] = useState("")
  const [dismissReportOpen, setDismissReportOpen] = useState(false)
  const [reportToDismiss, setReportToDismiss] = useState<ReportType | null>(null)
  const [dismissalNote, setDismissalNote] = useState("")
  const [dismissAllNote, setDismissAllNote] = useState("")
  const [confirmDismissAllOpen, setConfirmDismissAllOpen] = useState(false)
  const [historyData, { isLoading: historyLoading, isError: historyError }] = useQuery(
    getShopActionHistory,
    { shopId: group.shop.id, shopName: group.shop.shopName },
    { enabled: open && activeTab === 1 }
  )

  const { shop, reports } = group

  const handleBanClick = () => setConfirmBanOpen(true)

  const handleConfirmBan = async () => {
    if (!banReason.trim()) {
      toast.error("A reason for banning the shop is required.")
      return
    }

    try {
      await banShopMutation({ shopId: shop.id, banReason })
      toast.success(`Shop "${shop.shopName}" has been banned.`)
      refetchReports()
    } catch (error: any) {
      toast.error(error?.message || "Failed to ban shop.")
      console.error(error)
    } finally {
      setConfirmBanOpen(false)
      setBanReason("")
    }
  }

  const handleDismissReportClick = (report: ReportType) => {
    setReportToDismiss(report)
    setDismissReportOpen(true)
  }

  const handleConfirmDismissReport = async () => {
    if (!reportToDismiss) return

    if (!dismissalNote.trim()) {
      toast.error("A dismissal note is required.")
      return
    }

    if (!currentUser) {
      toast.error("Could not identify the current user.")
      return
    }

    try {
      await updateReportStatusMutation({
        reportId: reportToDismiss.id,
        status: "resolved",
        note: dismissalNote,
        adminId: currentUser.id,
      })
      toast.success(`Report #${reportToDismiss.id} has been dismissed.`)
      refetchReports()
    } catch (error) {
      console.error("Failed to dismiss report", error)
      toast.error("Failed to dismiss report.")
    } finally {
      setDismissReportOpen(false)
      setReportToDismiss(null)
      setDismissalNote("")
    }
  }

  const handleCancelDismissReport = () => {
    setDismissReportOpen(false)
    setReportToDismiss(null)
    setDismissalNote("")
  }

  const handleDismissAllClick = () => setConfirmDismissAllOpen(true)

  const handleConfirmDismissAll = async () => {
    if (!dismissAllNote.trim()) {
      toast.error("A note is required to dismiss all reports.")
      return
    }

    if (!currentUser) {
      toast.error("Could not identify the current user.")
      return
    }

    try {
      await dismissAllMutation({ shopId: shop.id, note: dismissAllNote, adminId: currentUser.id })
      toast.success(`All reports for "${shop.shopName}" have been dismissed.`)
      refetchReports()
    } catch (error) {
      toast.error("Failed to dismiss all reports.")
      console.error(error)
    } finally {
      setConfirmDismissAllOpen(false)
      setDismissAllNote("")
    }
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  return (
    <Fragment>
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 flex items-center gap-2">
          {index}
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </td>
        <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900">{shop.shopName}</td>
        <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
          {shop.user?.personalInfo
            ? `${shop.user.personalInfo.firstName} ${shop.user.personalInfo.lastName}`
            : "N/A"}
        </td>
        <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 text-center">
          <span className="font-bold">{reports.length}</span>
        </td>
        <td className="px-4 sm:px-6 py-4 text-center whitespace-nowrap space-x-2">
          <Link
            href={`/shops/${shop.id}`}
            target="_blank"
            className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded transition-colors"
          >
            Visit Shop
          </Link>
          <button
            className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium py-2 px-3 rounded transition-colors disabled:opacity-70"
            onClick={handleBanClick}
            disabled={isBanning}
          >
            {isBanning ? "Banning..." : "Ban Shop"}
          </button>
        </td>
      </tr>

      <tr>
        <td style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit className="w-full">
            <Box sx={{ margin: 1, padding: { xs: 1, sm: 2 }, bgcolor: "rgb(249 250 251)" }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="shop report details tabs"
              >
                <Tab label="Reports" />
                <Tab label="History" />
              </Tabs>

              {activeTab === 0 && (
                <Box sx={{ pt: 2 }}>
                  <div className="flex justify-between items-center mb-2">
                    <Typography variant="h6" gutterBottom component="div" sx={{ mb: 0 }}>
                      Report Details
                    </Typography>
                    <Button
                      size="small"
                      onClick={handleDismissAllClick}
                      color="inherit"
                      disabled={isDismissingAll}
                    >
                      {isDismissingAll ? "Dismissing..." : "Dismiss All"}
                    </Button>
                  </div>
                  <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 tracking-wider w-24">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 tracking-wider w-32">
                            Reason
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 tracking-wider flex-1">
                            Description
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 tracking-wider w-32">
                            Reported By
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 tracking-wider w-24">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.map((report) => (
                          <tr key={report.id} className="border-b border-gray-100">
                            <td className="px-4 py-2">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2 max-w-xs truncate">{report.reason}</td>
                            <td className="px-4 py-2 max-w-0 w-full">
                              <Tooltip
                                title={report.description || "No description provided."}
                                arrow
                                placement="top"
                              >
                                <span className="truncate block">
                                  {report.description || "N/A"}
                                </span>
                              </Tooltip>
                            </td>
                            <td className="px-4 py-2">{report.user?.email || "N/A"}</td>
                            <td className="px-4 py-2 text-center">
                              <button
                                onClick={() => handleDismissReportClick(report)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium py-1 px-3 rounded transition-colors"
                              >
                                Dismiss
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Box>
              )}

              {activeTab === 1 && (
                <Box sx={{ pt: 2 }}>
                  <Typography variant="h6" gutterBottom component="div">
                    Action History
                  </Typography>
                  {historyLoading && <p>Loading history...</p>}
                  {historyError && <p className="text-red-500">Error loading history.</p>}
                  {historyData && historyData.length > 0 ? (
                    <ul className="space-y-4">
                      {historyData.map((item: any, index: number) => (
                        <li key={index} className="flex gap-4">
                          <div className="text-right w-32 flex-shrink-0">
                            <p className="font-semibold text-sm text-gray-700">
                              {new Date(item.date).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(item.date).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="relative pl-4">
                            <div className="absolute left-0 top-1.5 h-full w-px bg-gray-300"></div>
                            <div className="absolute left-[-4.5px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                            <p className="font-bold text-blue-600">{item.action}</p>
                            <p className="text-sm text-gray-600 mt-1">{item.details}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No action history found for this shop.</p>
                  )}
                </Box>
              )}
            </Box>
          </Collapse>
        </td>
      </tr>

      <Dialog open={confirmBanOpen} onClose={() => setConfirmBanOpen(false)}>
        <DialogTitle>Confirm Ban</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to ban the shop &quot;{shop.shopName}&quot;. Please provide a reason
            below.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="reason"
            label="Reason for Banning"
            type="text"
            fullWidth
            variant="standard"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmBanOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmBan} color="error">
            Confirm Ban
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDismissAllOpen} onClose={() => setConfirmDismissAllOpen(false)}>
        <DialogTitle>Dismiss All Reports</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to dismiss all {reports.length} reports for the shop &quot;{shop.shopName}
            &quot;. Please provide a reason for this action.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="dismiss-all-note"
            label="Reason for Dismissal (Required)"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={dismissAllNote}
            onChange={(e) => setDismissAllNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmDismissAllOpen(false)
              setDismissAllNote("")
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirmDismissAll} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dismissReportOpen} onClose={handleCancelDismissReport}>
        <DialogTitle>Dismiss Report</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to dismiss report #{reportToDismiss?.id}. Please provide a note below for
            auditing purposes.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="note"
            label="Dismissal Note (Required)"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={dismissalNote}
            onChange={(e) => setDismissalNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDismissReport}>Cancel</Button>
          <Button onClick={handleConfirmDismissReport} color="primary">
            Confirm Dismissal
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}

export default function ReportedShop() {
  const [groupedReports, { refetch }] = useQuery(getShopReports, null) as [
    GroupedReport[],
    { refetch: () => void }
  ]
  const searchParams = useSearchParams()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const highlightReportId = searchParams.get("highlightReport")

  const totalPages = Math.ceil(groupedReports.length / itemsPerPage)
  const paginatedReports = groupedReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="w-full">
      <div className="w-full rounded-lg border border-gray-200 shadow-sm overflow-x-auto scrollbar-hide">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider w-20">
                #
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider">
                Shop Name
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider hidden md:table-cell">
                Owner
              </th>
              <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-500 tracking-wider">
                Pending Reports
              </th>
              <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-500 tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedReports.length > 0 ? (
              paginatedReports.map((group, index) => (
                <Row
                  key={group.shop.id}
                  group={group}
                  refetchReports={refetch}
                  index={(currentPage - 1) * itemsPerPage + index + 1}
                />
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-500">
                  No pending shop reports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center my-4 items-center gap-4 p-4">
          <Button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>
            Previous
          </Button>
          <Typography variant="body2">
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
