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
import Header from "../components/header";
import { useRouter } from "next/navigation";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useEffect, useState } from "react";
import axiosInstance from "@/app/utils/axios";
import { CircularProgress } from "@mui/material";

const drawerWidth = 240;

interface Props {
  window?: () => Window;
  children: React.ReactNode;
}

interface Award {
  id: string;
  name: string;
  // Add other award properties as needed
}

export default function AdminLayout({ window, children }: Props) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [awardsOpen, setAwardsOpen] = React.useState(false);
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (awardsOpen && awards.length === 0) {
      fetchAwards();
    }
  }, [awardsOpen]);

  const fetchAwards = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/awards");
      const data = response.data.data;
      setAwards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch awards");
      console.error("Error fetching awards:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAwardsClick = () => {
    setAwardsOpen(!awardsOpen);
  };

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

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {["Dashboard", "Judges", "Website"].map((text) => (
          <ListItem key={text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(`/${text.toLowerCase()}`)}
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

        {/* Awards section with expandable submenu */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleAwardsClick}
            sx={{
              display: "flex",
              justifyContent: "center",
              pl: 3,
            }}
          >
            <ListItemText
              primary="Awards"
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
            {awardsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>

        <Collapse in={awardsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {loading && (
              <ListItem sx={{ justifyContent: "center" }}>
                <CircularProgress />
              </ListItem>
            )}

            {error && (
              <ListItem>
                <ListItemText primary={`Error: ${error}`} />
              </ListItem>
            )}

            {awards?.map((award) => (
              <ListItem key={award.id} disablePadding sx={{ pl: 4 }}>
                <ListItemButton
                  onClick={() => handleNavigation(`/award/${award.id}`)}
                >
                  <ListItemText
                    primary={award.nameEn}
                    primaryTypographyProps={{
                      sx: {
                        fontSize: "18px",
                        color: "gray",
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <CssBaseline />

      <Header />

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
          {children}
        </Box>
      </Box>
    </Box>
  );
}
