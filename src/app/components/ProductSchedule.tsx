import * as React from "react"
import { DemoContainer } from "@mui/x-date-pickers/internals/demo"
import { LocalizationProvider } from "@mui/x-date-pickers-pro/LocalizationProvider"
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs"
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker"
import dayjs from "dayjs"

export default function BasicDateRangePicker() {
  const shouldDisableDate = (date) => {
    const yesterday = dayjs().subtract(1, "day").endOf("day") // End of yesterday
    return date.isBefore(yesterday) // Disable yesterday and earlier
  }
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={["DateRangePicker"]}>
        <DateRangePicker
          localeText={{ start: "Start", end: "End" }}
          shouldDisableDate={shouldDisableDate}
        />
      </DemoContainer>
    </LocalizationProvider>
  )
}
