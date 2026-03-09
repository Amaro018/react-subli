import React from "react"

interface Address {
  id: string
  street: string
  barangay: string
  city: string
  province: string
  country: string
  zipCode: string
  isDefault: boolean
}

interface AddressListProps {
  addresses: Address[]
  onEdit: (addr: Address) => void
  onDelete: (id: string) => void
  onSetDefault: (id: string) => void
}

export default function AddressList({
  addresses,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressListProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {addresses.map((addr, index) => {
        const isHomeAddress = addr.id === "personal-info-address"
        const homeExists = addresses.some((a) => a.id === "personal-info-address")
        const label = isHomeAddress ? "Home Address" : `Address ${homeExists ? index : index + 1}`

        return (
          <div
            key={addr.id}
            className={`relative flex flex-col justify-between rounded-lg border p-5 shadow-sm transition-all sm:flex-row sm:items-start ${
              addr.isDefault
                ? "border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="mb-4 min-w-0 flex-1 sm:mb-0">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">{label}</span>
                {addr.isDefault && (
                  <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 whitespace-nowrap">
                    Default
                  </span>
                )}
              </div>
              <h3 className="mb-1 text-base font-semibold text-gray-900">{addr.street}</h3>
              <p className="leading-relaxed text-sm text-gray-600">
                {[addr.barangay, addr.city, addr.province, addr.country].filter(Boolean).join(", ")}{" "}
                {addr.zipCode}
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-3 sm:ml-6 sm:justify-start sm:border-none sm:pt-0">
              {!isHomeAddress && (
                <button
                  onClick={() => onEdit(addr)}
                  className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
                >
                  Edit
                </button>
              )}
              {!addr.isDefault && (
                <>
                  {!isHomeAddress && <span className="hidden text-gray-300 sm:inline">|</span>}
                  <button
                    onClick={() => onSetDefault(addr.id)}
                    className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                  >
                    Set Default
                  </button>
                </>
              )}
              {!isHomeAddress && (
                <>
                  <span className="hidden text-gray-300 sm:inline">|</span>
                  <button
                    onClick={() => onDelete(addr.id)}
                    className="text-sm font-medium text-red-600 transition-colors hover:text-red-700"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        )
      })}
      {addresses.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-12 text-center text-gray-500">
          <p className="text-base font-medium text-gray-900">No addresses found</p>
          <p className="mt-1 text-sm">Add a new address to get started.</p>
        </div>
      )}
    </div>
  )
}
