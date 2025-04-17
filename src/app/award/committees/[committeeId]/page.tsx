"use client";

import AdminLayout from "@/sections/adminLayout";
import {
  Box,
  Button,
  InputAdornment,
  Menu,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";

export default function CommitteePage({ params }: Params) {
  const { committeeId } = params;
  const [award, setAward] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const ApplicatinsColumns: readonly Column[] = [
    { id: "applicationName", label: "Application Name", minWidth: 170 },
    { id: "documents", label: "Upload Documents", minWidth: 100 },
    { id: "teamName", label: "Team Name", minWidth: 100 },
    { id: "rate", label: "Rate", minWidth: 100 },
    { id: "Action", label: "action", minWidth: 100 },
  ];

  interface Params {
    params: {
      committeeId: string;
    };
  }
  const columns = [
    {
      width: 100,
      label: "name",
      dataKey: "name",
    },
    {
      width: 150,
      label: "approved date",
      dataKey: "lastName",
    },
    {
      width: 150,
      label: "position",
      dataKey: "position",
    },
    {
      width: 110,
      label: "action",
      dataKey: "action",
    },
  ];
  const dummyData = [
    {
      id: 1,
      name: "John Smith",
      approvedDate: "2023-05-15",
      position: "Senior Judge",
      action: "Edit",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      approvedDate: "2023-06-22",
      position: "Technical Reviewer",
      action: "Edit",
    },
    {
      id: 3,
      name: "Michael Chen",
      approvedDate: "2023-04-10",
      position: "Ethics Committee",
      action: "Edit",
    },
    {
      id: 4,
      name: "Emily Wilson",
      approvedDate: "2023-07-30",
      position: "Awards Coordinator",
      action: "Edit",
    },
    {
      id: 5,
      name: "David Brown",
      approvedDate: "2023-03-18",
      position: "Junior Judge",
      action: "Edit",
    },
  ];

  useEffect(() => {
    const awardData = sessionStorage.getItem("currentAward");
    if (awardData) {
      try {
        const parsedAward = JSON.parse(awardData);
        setAward(parsedAward);
      } catch (error) {
        console.error("Failed to parse award data:", error);
      }
    }
  }, []);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setMenuAnchorEl(event.currentTarget);
    setOpenMenuId(id);
  };
  function createData(
    applicationName: string,
    documents: string,
    teamName: string,
    rate: string,
    Action: string
  ) {
    return { applicationName, documents, teamName, rate, Action };
  }

  const rows = [
    createData(
      "EduTracker",
      "10/4/ 2025  2:42PM",
      "Team Alpha",
      "done",
      "View"
    ),
    createData("HealthPortal", "10/4/ 2025  2:42PM", "Team Beta", "-", "Edit"),
    createData(
      "AgriInsight",
      "10/4/ 2025  2:42PM",
      "GreenThrive",
      "done",
      "Delete"
    ),
    createData(
      "FinAnalyzer",
      "10/4/ 2025  2:42PM",
      "MoneyMinds",
      "done",
      "View"
    ),
    createData(
      "SafeCity",
      "10/4/ 2025  2:42PM",
      "CivicGuardians",
      "done",
      "Edit"
    ),
    createData(
      "JobConnect",
      "10/4/ 2025  2:42PM",
      "CareerBuild",
      "-",
      "Delete"
    ),
    createData("SmartWaste", "10/4/ 2025  2:42PM", "EcoSquad", "-", "View"),
    createData(
      "AquaMonitor",
      "10/4/ 2025  2:42PM",
      "BlueWater",
      "done",
      "Edit"
    ),
    createData("TransitFlow", "10/4/ 2025  2:42PM", "MoveSmart", "-", "Delete"),
    createData("EnergySense", "10/4/ 2025  2:42PM", "WattWise", "done", "View"),
  ];
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setOpenMenuId(null);
  };

  const handleAction = (action: string, row: any) => {
    console.log(`Action "${action}" clicked for row:`, row);
    handleMenuClose();
  };

  return (
    <AdminLayout>
      <Box sx={{ width: "92%" }}>
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            p: 3,
          }}
        >
          <Box sx={{ flex: 1 }} />
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: "64px",
                color: "#721F31",
                minHeight: "50px",
                pb: 2,
              }}
            >
              {award?.nameEn || "Loading..."}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: "right" }}>
            <Button
              sx={{
                color: "white",
                backgroundColor: "#721F31",
                borderRadius: "8px",
                textTransform: "none",

                minWidth: "160px",
                height: { xs: "60px", sm: "40px", md: "35px" },
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  backgroundColor: "#5a1827",
                },
                ":disabled": {
                  backgroundColor: "#D3D3D3",
                  color: "white",
                },
                whiteSpace: "nowrap",
              }}
            >
              <AddIcon />
              Create Award
            </Button>
          </Box>
        </Stack>
        <Box
          sx={{
            width: "100%",
            mb: 0.5,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <TextField
            variant="outlined"
            placeholder="Search Award"
            size="small"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            sx={{
              width: "100%",
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "#fff",
                "& fieldset": {
                  borderColor: "#e0e0e0",
                },
                "&:hover fieldset": {
                  borderColor: "#bdbdbd",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#721F31",
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#721F31" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            width: "100%",
            p: 2,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "36px",
                lineHeight: "111%",
                letterSpacing: "4.5%",
                color: "#721F31",
                pb: 3,
              }}
            >
              Committee Name:
            </Typography>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "20px",
                lineHeight: "111%",
                letterSpacing: "4.5%",
                color: "#721F31",
              }}
            >
              Members : 3
            </Typography>
          </Box>
          <Button
            sx={{
              color: "white",
              backgroundColor: "#721F31",
              borderRadius: "8px",
              minWidth: "100px",
              height: { xs: "60px", sm: "40px", md: "35px" },
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              textTransform: "none",

              "&:hover": {
                backgroundColor: "#5a1827",
              },
              ":disabled": {
                backgroundColor: "#D3D3D3",
                color: "white",
              },
              whiteSpace: "nowrap",
            }}
          >
            <AddIcon />
            Add Judge
          </Button>
        </Box>
        <Box sx={{ width: "100%", overflow: "hidden", m: 5 }}>
          <Table sx={{ width: "100%", tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.dataKey}
                    variant="head"
                    align={column.numeric ? "right" : "left"}
                    sx={{
                      fontSize: "16px",
                      backgroundColor: "background.paper",
                      width: column.width || "auto",
                      whiteSpace: "nowrap",
                      borderBottom: "2px solid",
                      borderColor: "divider",
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {dummyData.map((row) => (
                <TableRow hover key={row.id}>
                  <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                    {row.name}
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                    {new Date(row.approvedDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                    {row.position}
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                    <IconButton
                      aria-controls={`menu-${row.id}`}
                      aria-haspopup="true"
                      onClick={(event) => handleMenuOpen(event, row.id)}
                    >
                      <MoreHorizIcon />
                    </IconButton>
                    <Menu
                      id={`menu-${row.id}`}
                      anchorEl={menuAnchorEl}
                      open={openMenuId === row.id}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={() => handleAction("Active", row)}>
                        Active
                      </MenuItem>
                      <MenuItem onClick={() => handleAction("Remove", row)}>
                        Remove
                      </MenuItem>
                      <MenuItem onClick={() => handleAction("teamLearde", row)}>
                        Team Learder
                      </MenuItem>
                      <MenuItem onClick={() => handleAction("view", row)}>
                        View
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Box>
          <Stack direction="row">
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "30px",
                lineHeight: "111%",
                letterSpacing: "4.5%",
                color: "#721F31",
                pb: 3,
              }}
            >
              Applications(4)
            </Typography>
          </Stack>
          <TableContainer
            sx={{
              maxHeight: 440,
              borderRadius: "10px",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#721F31", // Color of the scrollbar thumb
                borderRadius: "8px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "#f1f1f1", // Background of the scrollbar track
              },
            }}
          >
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: "#721F31",
                  }}
                >
                  {ApplicatinsColumns.map((column) => (
                    <TableCell
                      key={column.applicationName}
                      align={column.align}
                      style={{ minWidth: column.minWidth }}
                      sx={{
                        backgroundColor: "#721F31",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "16px",
                        borderBottom: "none",
                      }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((row) => (
                  <TableRow hover key={row.code}>
                    {ApplicatinsColumns.map((column) => {
                      const value = row[column.id];

                      // Action Button
                      if (column.id === "Action") {
                        return (
                          <TableCell key={column.id} align={column.align}>
                            <Button
                              size="small"
                              onClick={() => {
                                console.log("Action clicked for:", row);
                              }}
                              sx={{
                                color: "#FFB13E",
                                fontSize: "13px",
                                fontWeight: 600,
                                transform: "none",
                                "&:hover": {
                                  backgroundColor: "#f5f5f5",
                                },
                              }}
                            >
                              View
                            </Button>
                          </TableCell>
                        );
                      }

                      // Rate Column – Green
                      if (column.id === "rate") {
                        return (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            sx={{ color: "green", fontWeight: 600 }}
                          >
                            {value}
                          </TableCell>
                        );
                      }

                      // Team Name Column – Blue
                      if (column.id === "teamName") {
                        return (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            sx={{ color: "#1976d2", fontWeight: 600 }}
                          >
                            {value}
                          </TableCell>
                        );
                      }

                      // Default Render
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.format && typeof value === "number"
                            ? column.format(value)
                            : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </AdminLayout>
  );
}
