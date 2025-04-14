import * as React from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Header from "./components/header";
import { useRouter } from "next/navigation";

const drawerWidth = 240;

interface Props {
  window?: () => Window;
  children: React.ReactNode;
}

export default function AdminLayout({ window, children }: Props) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const router = useRouter();

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };
   const handleNavigation = (text: string) => {
     const path = `/${text.toLowerCase()}`;
     router.push(path);
   };

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {["Dashboard", "Award", "Judges", "Website"].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(text)}
              sx={{
                display: "flex",
                justifyContent: "center",
                pl: 3,
              }}
            >
              <ListItemText
                primary={text}
                primaryTypographyProps={{
                  sx: {
                    fontWeight: 700,
                    fontSize: "22px",
                    lineHeight: "111.00000000000001%",
                    letterSpacing: "4.5%",
                    color: "#721F31",
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <CssBaseline />

        {/* Header first */}
        <Header />

        {/* Content area with drawer and main content */}
        <Box sx={{ display: "flex", position: "relative" }}>
          {/* Navigation drawer */}
          <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            aria-label="mailbox folders"
          >
            {/* Mobile drawer */}
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onTransitionEnd={handleDrawerTransitionEnd}
              onClose={handleDrawerClose}
              sx={{
                display: { xs: "block", sm: "none" },
                "& .MuiDrawer-paper": {
                  boxSizing: "border-box",
                  width: drawerWidth,
                  top: "auto",
                },
              }}
              slotProps={{
                root: {
                  keepMounted: true,
                },
              }}
            >
              {drawer}
            </Drawer>

            <Drawer
              variant="permanent"
              sx={{
                display: { xs: "none", sm: "block" },
                "& .MuiDrawer-paper": {
                  boxSizing: "border-box",
                  width: drawerWidth,
                  top: "auto",
                  position: "relative",
                  borderRight: "none",
                },
              }}
              open
            >
              {drawer}
            </Drawer>
          </Box>

          {/* Main content area */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: `calc(100% - ${drawerWidth}px)` },
            }}
          >
            {/* Add your main content here */}
            {children}
          </Box>
        </Box>
      </Box>
  );
}
