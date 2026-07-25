import React from "react"
import {
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material"
import FilterListIcon from "@mui/icons-material/FilterList"
import CategoryIcon from "@mui/icons-material/Category"
import LocationOnIcon from "@mui/icons-material/LocationOn"

interface FilterSidebarProps {
  showClearAll: boolean
  onClearAll: () => void
  availableCategories: string[]
  selectedCategories: string[]
  onCategoryToggle: (category: string) => void
  onClearCategories: () => void
  availableLocations: string[]
  selectedLocation: string
  onLocationChange: (location: string) => void
  children?: React.ReactNode // Used to inject extra filters (like Price Range)
}

export default function FilterSidebar({
  showClearAll,
  onClearAll,
  availableCategories,
  selectedCategories,
  onCategoryToggle,
  onClearCategories,
  availableLocations,
  selectedLocation,
  onLocationChange,
  children,
}: FilterSidebarProps) {
  return (
    <div className="w-full md:w-[280px] flex-shrink-0">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-6 flex flex-col divide-y divide-gray-100">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FilterListIcon className="text-[#1b2a80]" />
            <Typography variant="h6" fontWeight="bold" className="text-gray-900">
              Filters
            </Typography>
          </div>
          {showClearAll && (
            <button
              onClick={onClearAll}
              className="text-sm font-medium text-[#1b2a80] hover:text-blue-800 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <CategoryIcon sx={{ fontSize: 16, color: "#1b2a80" }} />
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              className="text-gray-900 uppercase tracking-wider text-xs"
            >
              Categories
            </Typography>
          </div>
          <FormGroup sx={{ gap: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  sx={{ color: "#cbd5e1", "&.Mui-checked": { color: "#1b2a80" } }}
                  checked={selectedCategories.length === 0}
                  onChange={onClearCategories}
                />
              }
              label={
                <Typography variant="body2" className="text-gray-700">
                  All Categories
                </Typography>
              }
              sx={{ margin: 0, ml: -1 }}
            />
            {availableCategories.map((cat) => (
              <FormControlLabel
                key={cat}
                control={
                  <Checkbox
                    size="small"
                    sx={{ color: "#cbd5e1", "&.Mui-checked": { color: "#1b2a80" } }}
                    checked={selectedCategories.includes(cat)}
                    onChange={() => onCategoryToggle(cat)}
                  />
                }
                label={
                  <Typography variant="body2" className="text-gray-700">
                    {cat}
                  </Typography>
                }
                sx={{ margin: 0, ml: -1 }}
              />
            ))}
          </FormGroup>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <LocationOnIcon sx={{ fontSize: 16, color: "#1b2a80" }} />
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              className="text-gray-900 uppercase tracking-wider text-xs"
            >
              Location
            </Typography>
          </div>
          <FormControl fullWidth size="small">
            <Select
              value={selectedLocation}
              onChange={(e) => onLocationChange(e.target.value)}
              displayEmpty
              sx={{
                bgcolor: "#f8fafc",
                borderRadius: "10px",
                "& fieldset": { borderColor: "#e2e8f0" },
                "&:hover fieldset": { borderColor: "#cbd5e1" },
                "&.Mui-focused fieldset": { borderColor: "#1b2a80" },
                fontSize: "0.875rem",
              }}
            >
              <MenuItem value="All" sx={{ fontSize: "0.875rem" }}>
                All Barangays
              </MenuItem>
              {availableLocations.map((loc: string) => (
                <MenuItem key={loc} value={loc} sx={{ fontSize: "0.875rem" }}>
                  {loc}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {children}
      </div>
    </div>
  )
}
