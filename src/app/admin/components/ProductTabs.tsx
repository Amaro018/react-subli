"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

const tabs = [
  { name: "All Products", href: "/admin/manage-products" },
  { name: "Reported Products", href: "/admin/manage-products/reported" },
  { name: "Banned Products", href: "/admin/manage-products/banned" },
]

export default function ProductTabs() {
  const pathname = usePathname()

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            href={tab.href as any}
            className={`${
              pathname === tab.href
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            aria-current={pathname === tab.href ? "page" : undefined}
          >
            {tab.name}
          </Link>
        ))}
      </nav>
    </div>
  )
}
