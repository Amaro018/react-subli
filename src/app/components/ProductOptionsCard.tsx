import React from "react"

interface ProductOptionsCardProps {
  uniqueColors: any[]
  nonColorAttributes: { name: string; values: string[] }[]
  selectedColor: number | null
  handleChangeColor: (colorId: number) => void
  selectedAttributes: Record<string, string>
  handleChangeAttribute: (attrName: string, value: string) => void
  findVariant: (colorId: number | null, attrs: Record<string, string>) => any
}

export default function ProductOptionsCard({
  uniqueColors,
  nonColorAttributes,
  selectedColor,
  handleChangeColor,
  selectedAttributes,
  handleChangeAttribute,
  findVariant,
}: ProductOptionsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-6">
      <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">
        Product Options
      </h3>

      {/* Colors */}
      {uniqueColors.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Color</p>
          <div className="flex flex-wrap gap-3">
            {uniqueColors.map((color: any, index: number) => (
              <button
                key={color?.id || `color-${index}`}
                type="button"
                onClick={() => handleChangeColor(color?.id)}
                className={`w-10 h-10 rounded-full border-2 ring-2 ring-offset-2 transition-all ${
                  selectedColor === color?.id
                    ? "ring-[#1b2a80] border-white scale-110 shadow-md"
                    : "ring-transparent border-gray-200 hover:scale-105"
                }`}
                style={{ backgroundColor: color?.hexCode }}
                aria-label={`Select color ${color?.name}`}
                title={color?.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Attributes (Size, Style, etc.) */}
      {nonColorAttributes.map((attr) => {
        return (
          <div key={attr.name} className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">{attr.name}</p>
              <div className="flex flex-wrap gap-3">
                {attr.values.map((val, index) => {
                  const isDisabled =
                    selectedColor &&
                    !findVariant(selectedColor, { ...selectedAttributes, [attr.name]: val })

                  return (
                    <button
                      key={val ? String(val) : `${attr.name}-${index}`}
                      type="button"
                      onClick={() => handleChangeAttribute(attr.name, val)}
                      disabled={Boolean(isDisabled)}
                      className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                        selectedAttributes[attr.name] === val
                          ? "border-[#1b2a80] bg-[#1b2a80] text-white shadow-md"
                          : "border-gray-200 text-gray-700 hover:border-[#1b2a80] hover:text-[#1b2a80] bg-white"
                      } ${
                        isDisabled
                          ? "opacity-40 cursor-not-allowed hover:border-gray-200 hover:text-gray-700 bg-gray-50"
                          : ""
                      }`}
                    >
                      {val}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
