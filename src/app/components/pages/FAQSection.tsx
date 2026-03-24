"use client"

import React from "react"
import Accordion from "@mui/material/Accordion"
import AccordionSummary from "@mui/material/AccordionSummary"
import AccordionDetails from "@mui/material/AccordionDetails"
import Typography from "@mui/material/Typography"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

const faqs = [
  {
    question: "How do I rent an item?",
    answer:
      "Simply browse our categories, select the item you need, choose your rental dates, and proceed to checkout. You'll receive a confirmation email with pick-up or delivery details.",
  },
  {
    question: "Do I need to pay a security deposit?",
    answer:
      "Some high-value items may require a security deposit. This will be clearly stated on the item's listing page. The deposit is fully refundable upon safe return of the item.",
  },
  {
    question: "What happens if an item gets damaged?",
    answer:
      "We understand that normal wear and tear happens. However, for significant damage, you may be responsible for repair or replacement costs. Please review our full terms and conditions for details.",
  },
  {
    question: "Can I cancel my reservation?",
    answer:
      "Yes, you can cancel your reservation up to 24 hours before the rental period begins for a full refund. Cancellations made within 24 hours may be subject to a fee.",
  },
]

export default function FAQSection() {
  return (
    <section className="bg-white py-12 md:py-16 w-full border-t border-gray-100">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-[#1b2a80] sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-gray-600">Got questions? We&apos;ve got answers.</p>
          </div>

          <div>
            {faqs.map((faq, index) => (
              <Accordion
                key={index}
                disableGutters
                elevation={0}
                sx={{
                  "&:before": { display: "none" },
                  borderBottom: "1px solid #e5e7eb",
                  background: "transparent",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon className="text-[#1b2a80]" />}
                  sx={{ px: 0 }}
                >
                  <Typography variant="subtitle1" fontWeight="bold" className="text-gray-900">
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0, pb: 3, pt: 0 }}>
                  <Typography className="text-gray-600">{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
