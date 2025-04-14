import {
  Box,
  IconButton,
  Popover,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { AccessibilityProvider } from "../context/accessibilityContext";
import AccessibilityToolbar from "./AccessibilityToolbar";
import { Bell, Calendar, Expand, Menu } from "lucide-react";
import { ExitToApp, Person } from "@mui/icons-material";
import TranslateIcon from "@mui/icons-material/Translate";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleMyProfileClick = () => {
    router.push("/my-profile");
    handleClose();
    handleMobileMenuClose();
  };

  const handleLogout = () => {
    router.push("/");
    handleClose();
    handleMobileMenuClose();
  };

  const open = Boolean(anchorEl);
  const mobileMenuOpen = Boolean(mobileMenuAnchor);
  const id = open ? "user-popover" : undefined;
  const mobileMenuId = mobileMenuOpen ? "mobile-menu-popover" : undefined;

  return (
    <AccessibilityProvider
      defaultSettings={{
        rootFontSize: 100,
        colorBlind: false,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          overflowX: "hidden", 
        }}
      >
        <AccessibilityToolbar />
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: { xs: "4.5rem", sm: "5.5rem", md: "5rem" },
            bgcolor: "#721F31",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: "0.5rem", sm: "1.5rem", md: "3rem" },
            boxSizing: "border-box", // Include padding in width calculation
            overflow: "hidden", // Prevent content overflow
          }}
        >
          {/* Background Image */}
          <Box
            component="img"
            src="/assets/MaskGroup.png"
            alt="Mask Group"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: 0.9,
              objectFit: "cover", // Ensure image covers area without distortion
            }}
          />

          {/* Content Container */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              maxWidth: "1400px",
              mx: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              zIndex: 1,
              boxSizing: "border-box", // Include padding in width calculation
            }}
          >
            {/* Left Icons */}
            {isMobile ? (
              // Mobile view with menu icon
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton
                  onClick={handleMobileMenuOpen}
                  sx={{ color: "white" }}
                >
                  <Menu size={24} />
                </IconButton>
                <IconButton onClick={handleClick}>
                  <Box
                    component="img"
                    src="/assets/UserIcon.svg"
                    alt="User Icon"
                    sx={{
                      width: { xs: "1.8rem", sm: "2rem", md: "2.11rem" },
                      height: { xs: "1.8rem", sm: "2rem", md: "2.11rem" },
                      objectFit: "contain",
                    }}
                  />
                </IconButton>
              </Box>
            ) : (
              // Desktop/Tablet view with all icons
              <Stack
                direction="row"
                spacing={{ xs: 1, sm: 1.5, md: 2 }}
                alignItems="center"
              >
                <IconButton onClick={handleClick}>
                  <Box
                    component="img"
                    src="/assets/UserIcon.svg"
                    alt="User Icon"
                    sx={{
                      width: { xs: "1.8rem", sm: "2rem", md: "2.11rem" },
                      height: { xs: "1.8rem", sm: "2rem", md: "2.11rem" },
                      objectFit: "contain",
                    }}
                  />
                </IconButton>
                <IconButton sx={{ color: "white" }}>
                  <Bell size={isTablet ? 24 : 30} />
                </IconButton>
                <IconButton sx={{ color: "white" }}>
                  <Calendar size={isTablet ? 24 : 30} />
                </IconButton>
                <IconButton sx={{ color: "white" }}>
                  <Expand size={isTablet ? 24 : 30} />
                </IconButton>
              </Stack>
            )}

            {/* Right Icons */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: "0.5rem", md: "1rem" },
              }}
            >
              <Stack
                direction="row"
                spacing={{ xs: 1, md: 1.5 }}
                alignItems="center"
              >
                <Typography
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: { xs: "14px", md: "16px" },
                    display: { xs: "none", sm: "flex" },
                  }}
                >
                  Arabic
                </Typography>
                <IconButton
                  sx={{
                    color: "white",
                  }}
                >
                  <TranslateIcon
                    sx={{
                      fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.5rem" },
                    }}
                  />
                </IconButton>
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* User Profile Popover */}
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          sx={{
            "& .MuiPaper-root": {
              backgroundColor: "transparent",
              boxShadow: "none",
            },
          }}
        >
          <Box
            sx={{
              width: { xs: "10rem", sm: "12.0625rem" },
              height: "auto",
              padding: "1rem",
              borderRadius: "0.75rem",
              border: "1px solid #E2E2E2",
              background: "rgba(255, 255, 255, 0.85)",
              boxShadow: "0px 0px 8px 0px rgba(0, 0, 0, 0.25)",
            }}
          >
            {/* My Profile Section */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                mb: "1.25rem",
                cursor: "pointer",
              }}
              onClick={handleMyProfileClick}
            >
              <Person
                sx={{ color: "#C4AB69", width: "1.25rem", height: "1.25rem" }}
              />
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 400,
                  fontSize: { xs: "1rem", sm: "1.125rem" },
                  lineHeight: "1.36125rem",
                  color: "#000000",
                }}
              >
                My Profile
              </Typography>
            </Box>

            {/* Logout Section */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
              }}
              onClick={handleLogout}
            >
              <ExitToApp
                sx={{ color: "#C4AB69", width: "1rem", height: "1rem" }}
              />
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 400,
                  fontSize: { xs: "1rem", sm: "1.125rem" },
                  lineHeight: "1.36125rem",
                  color: "#000000",
                }}
              >
                Logout
              </Typography>
            </Box>
          </Box>
        </Popover>

        {/* Mobile Menu Popover */}
        <Popover
          id={mobileMenuId}
          open={mobileMenuOpen}
          anchorEl={mobileMenuAnchor}
          onClose={handleMobileMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          sx={{
            "& .MuiPaper-root": {
              backgroundColor: "transparent",
              boxShadow: "none",
            },
          }}
        >
          <Box
            sx={{
              width: "12rem",
              padding: "1rem",
              borderRadius: "0.75rem",
              border: "1px solid #E2E2E2",
              background: "rgba(255, 255, 255, 0.9)",
              boxShadow: "0px 0px 8px 0px rgba(0, 0, 0, 0.25)",
            }}
          >
            {/* Mobile Menu Icons */}
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  cursor: "pointer",
                }}
                onClick={handleMobileMenuClose}
              >
                <Bell size={20} color="#721F31" />
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "1rem",
                    color: "#000000",
                  }}
                >
                  Notifications
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  cursor: "pointer",
                }}
                onClick={handleMobileMenuClose}
              >
                <Calendar size={20} color="#721F31" />
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "1rem",
                    color: "#000000",
                  }}
                >
                  Calendar
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  cursor: "pointer",
                }}
                onClick={handleMobileMenuClose}
              >
                <Expand size={20} color="#721F31" />
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "1rem",
                    color: "#000000",
                  }}
                >
                  Expand
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Popover>
      </Box>
    </AccessibilityProvider>
  );
}
