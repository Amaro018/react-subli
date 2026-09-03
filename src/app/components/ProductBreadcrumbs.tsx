import Link from "next/link"

interface ProductBreadcrumbsProps {
  categoryName?: string
  productName?: string
}

export default function ProductBreadcrumbs({ categoryName, productName }: ProductBreadcrumbsProps) {
  return (
    <nav
      className="flex text-sm text-gray-500 overflow-x-auto scrollbar-seamless pb-2 -mb-2"
      aria-label="Breadcrumb"
    >
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            href="/"
            className="inline-flex items-center hover:text-[#1b2a80] transition-colors whitespace-nowrap"
          >
            Home
          </Link>
        </li>
        <li>
          <div className="flex items-center">
            <span className="mx-2 text-gray-400">/</span>
            <Link
              href="/products"
              className="hover:text-[#1b2a80] transition-colors whitespace-nowrap"
            >
              Products
            </Link>
          </div>
        </li>
        {categoryName && (
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                href={`/products?category=${encodeURIComponent(categoryName)}`}
                className="hover:text-[#1b2a80] transition-colors whitespace-nowrap"
              >
                {categoryName}
              </Link>
            </div>
          </li>
        )}
        <li aria-current="page">
          <div className="flex items-center">
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-[400px]">
              {productName}
            </span>
          </div>
        </li>
      </ol>
    </nav>
  )
}
