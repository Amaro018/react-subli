"use client"
import React from "react"
import Link from "next/link"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Help Center", href: "/help" },
    { name: "Contact Us", href: "/contact" },
  ]

  return (
    <footer className="mt-auto border-t border-gray-100 bg-white px-4 py-6 md:px-6">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        {/* Copyright Section */}
        <div className="text-sm text-gray-500">
          <p>
            © {currentYear} <span className="font-bold text-[#1b2a80]">Subli</span>. All rights
            reserved.
          </p>
        </div>

        {/* Links Section */}
        <nav>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href as any}
                  className="text-sm text-gray-500 transition-colors hover:text-[#1b2a80]"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
