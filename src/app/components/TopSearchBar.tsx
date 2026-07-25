import React from "react"
import { FormControl, Select, MenuItem, TextField, InputAdornment, IconButton } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import ClearIcon from "@mui/icons-material/Clear"

interface TopSearchBarProps {
  sortBy: string
  onSortChange: (value: string) => void
  sortOptions: { value: string; label: string }[]
  searchQuery: string
  onSearchChange: (value: string) => void
  onSearchClear: () => void
  searchPlaceholder?: string
}

export default function TopSearchBar({
  sortBy,
  onSortChange,
  sortOptions,
  searchQuery,
  onSearchChange,
  onSearchClear,
  searchPlaceholder = "Search...",
}: TopSearchBarProps) {
  return (
    <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
      <FormControl
        size="small"
        sx={{
          minWidth: 180,
          bgcolor: "white",
          borderRadius: "12px",
          "& fieldset": { borderColor: "#e5e7eb" },
        }}
      >
        <Select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          displayEmpty
          sx={{ borderRadius: "12px", fontSize: "0.875rem" }}
        >
          {sortOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.875rem" }}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        className="w-full sm:w-96"
        placeholder={searchPlaceholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon className="text-gray-400" />
            </InputAdornment>
          ),
          endAdornment: searchQuery ? (
            <InputAdornment position="end">
              <IconButton aria-label="clear search" onClick={onSearchClear} edge="end" size="small">
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
          sx: {
            bgcolor: "white",
            borderRadius: "12px",
            "& fieldset": { borderColor: "#e5e7eb" },
          },
        }}
      />
    </div>
  )
}
