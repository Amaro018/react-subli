"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import EmailIcon from "@mui/icons-material/Email"
import LocalShippingIcon from "@mui/icons-material/LocalShipping"
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"
import SupportAgentIcon from "@mui/icons-material/SupportAgent"

interface HelpCenterProps {
  orderReference?: string
  itemId?: string
  itemName?: string
}

const issueTypes = ["Delivery", "Pickup", "Return", "Disputed charge", "Other"] as const

const faqs = [
  {
    question: "How do I place and track a rental order?",
    answer:
      "Choose a product and available dates, select its variant, and submit your rental request. " +
      "The shop must accept the request before the rental is confirmed. Check My Rentals for the " +
      "latest item status, dates, and shop updates.",
  },
  {
    question: "What should I do if delivery or pickup is late or missed?",
    answer:
      "Check the rental status and the delivery or pickup details first. Contact the shop using " +
      "the contact information on its shop page. If you cannot resolve the issue, use the rental " +
      "support form below and include your order reference, item, and scheduled time.",
  },
  {
    question: "How do I arrange or report a return issue?",
    answer:
      "Follow the return instructions agreed with the shop and check the rental end date in My " +
      "Rentals. If the shop has not confirmed a return, the return arrangement is unclear, or " +
      "there is a disagreement about an item's condition, contact support with the order and item details.",
  },
  {
    question: "How do rental payments and invoice statuses work?",
    answer:
      "Payments are recorded by the shop when received, such as at delivery or pickup and at " +
      "return; the renter dashboard does not process payments. Unpaid means no payment is recorded, " +
      "Partially Paid means a balance remains, and Paid means recorded payments cover the invoice " +
      "total. Contact support if a recorded payment, balance, or charge looks incorrect.",
  },
  {
    question: "Can I cancel a rental request?",
    answer:
      "You can cancel your own request while it is still pending shop approval. Once the shop " +
      "accepts it, the self-service cancellation option is no longer available. Contact the shop " +
      "and include your order reference if you need help changing an accepted rental.",
  },
  {
    question: "What information should I include when contacting support?",
    answer:
      "Include your order reference, the product or item, the shop name, relevant dates or times, " +
      "and a clear description of what happened. For a disputed charge, include the invoice number, " +
      "amount, and payment date. Do not email passwords or full payment-card details.",
  },
]

export default function HelpCenter({
  orderReference = "",
  itemId = "",
  itemName = "",
}: HelpCenterProps) {
  const [issueType, setIssueType] = useState("")
  const [description, setDescription] = useState("")
  const [orderReferenceInput, setOrderReferenceInput] = useState(orderReference)
  const [itemInput, setItemInput] = useState(itemName || (itemId ? `Rental item ${itemId}` : ""))

  const emailSubject = issueType ? `Rental support: ${issueType}` : "Rental support request"
  const emailBody = [
    "Hello SUBLI Support,",
    "",
    `Issue type: ${issueType || "[select an issue type]"}`,
    `Order reference: ${orderReferenceInput || "[add your order reference]"}`,
    `Item: ${itemInput || "[add the item name]"}`,
    ...(itemId ? [`Rental item ID: ${itemId}`] : []),
    "",
    "What happened?",
    description || "[describe the issue, including relevant dates or times]",
    "",
    "Thank you.",
  ].join("\n")
  const supportEmail = `mailto:support@subli.com?subject=${encodeURIComponent(
    emailSubject
  )}&body=${encodeURIComponent(emailBody)}`

  return (
    <main className="flex-grow bg-slate-50">
      <section className="bg-gradient-to-br from-[#eef3ff] via-white to-[#e8f7ff]">
        <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#1b2a80]/10 px-4 py-2 text-sm font-semibold text-[#1b2a80]">
              <SupportAgentIcon fontSize="small" />
              SUBLI Help Center
            </div>
            <h1 className="text-4xl font-bold leading-tight text-[#1b2a80] sm:text-5xl">
              Help with your rental
            </h1>
            <p className="mt-5 text-base leading-7 text-gray-600 sm:text-lg">
              Find answers about orders, delivery, pickup, returns, and invoices—or contact support
              about a specific rental.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                component="a"
                href="#contact-support"
                variant="contained"
                startIcon={<EmailIcon />}
                sx={{ textTransform: "none", borderRadius: 2, backgroundColor: "#1b2a80" }}
              >
                Contact rental support
              </Button>
              <Button
                component={Link}
                href="/renter/rent-orders"
                variant="outlined"
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                View my rentals
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-[1400px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-14">
        <section aria-labelledby="faq-heading">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-[#1b2a80]">
              <ReceiptLongIcon />
            </div>
            <div>
              <h2 id="faq-heading" className="text-2xl font-bold text-gray-900">
                Frequently asked questions
              </h2>
              <p className="text-sm text-gray-600">Quick guidance for common rental questions.</p>
            </div>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <Accordion
                key={faq.question}
                disableGutters
                elevation={0}
                className="rounded-xl border border-gray-200 before:hidden"
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={600}>{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary" lineHeight={1.7}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </div>
        </section>

        <section id="contact-support" aria-labelledby="contact-support-heading">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-[#1b2a80]">
                <LocalShippingIcon />
              </div>
              <div>
                <h2 id="contact-support-heading" className="text-2xl font-bold text-gray-900">
                  Report a rental issue
                </h2>
                <p className="text-sm text-gray-600">Delivery, pickup, return, or charge concern</p>
              </div>
            </div>

            {orderReferenceInput && (
              <Alert severity="info" className="mb-5">
                Rental context added: order {orderReferenceInput}
                {itemInput ? ` — ${itemInput}` : ""}.
              </Alert>
            )}

            <div className="flex flex-col gap-4">
              <TextField
                select
                required
                label="What do you need help with?"
                value={issueType}
                onChange={(event) => setIssueType(event.target.value)}
                helperText="Select an issue type to prepare your support email."
                fullWidth
              >
                {issueTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Order reference"
                value={orderReferenceInput}
                onChange={(event) => setOrderReferenceInput(event.target.value)}
                placeholder="For example, ORD-00123"
                helperText="Find the reference at the top of the rental in My Rentals."
                fullWidth
              />
              <TextField
                label="Item"
                value={itemInput}
                onChange={(event) => setItemInput(event.target.value)}
                placeholder="Product or rental item"
                fullWidth
              />
              <TextField
                label="What happened?"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Include dates, times, shop name, and relevant details. For a charge concern, include the invoice number and amount."
                multiline
                minRows={4}
                fullWidth
              />
              <Button
                component="a"
                href={supportEmail}
                variant="contained"
                disabled={!issueType}
                startIcon={<EmailIcon />}
                sx={{
                  alignSelf: "flex-start",
                  textTransform: "none",
                  borderRadius: 2,
                  backgroundColor: "#1b2a80",
                }}
              >
                Open email to support
              </Button>
              <Typography variant="caption" color="text.secondary">
                This opens your email app with the details above. Review the message and send it
                from your email account. You can also email{" "}
                <a className="font-medium text-[#1b2a80] underline" href="mailto:support@subli.com">
                  support@subli.com
                </a>
                .
              </Typography>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
