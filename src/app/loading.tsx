import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"

export default function Loading() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <CircularProgress size={100} />
    </Box>
  )
}
