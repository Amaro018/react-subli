import * as React from "react"
import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import Button from "@mui/material/Button"
import List from "@mui/material/List"
import Divider from "@mui/material/Divider"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import InboxIcon from "@mui/icons-material/MoveToInbox"
import MailIcon from "@mui/icons-material/Mail"

export default function TemporaryDrawer() {
  const [open, setOpen] = React.useState(false)

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen)
  }

  const DrawerList = (
    <Box
      sx={{
        width: 400,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 250,
          boxSizing: "border-box",
        },
      }}
      role="presentation"
      onClick={toggleDrawer(false)}
    >
      <p>items here</p>
    </Box>
  )

  return (
    <div>
      <Button onClick={toggleDrawer(true)}>Open drawer</Button>
      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  )
}
