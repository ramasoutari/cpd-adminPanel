"use client";
import axiosInstance from "@/app/utils/axios";
import {
  Button,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  IconButton,
  CircularProgress,
  Box,
  InputAdornment,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Menu,
  MenuItem,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { visuallyHidden } from "@mui/utils";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import Link from "next/link";

interface Judge {
  id: string;
  name: string;
  acceptedDate: string;
  committee: string;
  status: "Active" | "Inactive" | "Pending";
}

function Judges({ award }) {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof Judge>("name");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  useEffect(() => {
    const fetchAwardJudges = async () => {
      try {
        const res = await axiosInstance.get(`/awards/judges/${award.id}`);
        setJudges(res.data.data);
      } catch (err) {
        console.error("Failed to fetch judges:", err);
        setError("Failed to load judges data");
      } finally {
        setLoading(false);
      }
    };

    fetchAwardJudges();
  }, [award.id]);
  const dummyJudgesData = [
    {
      id: "1",
      name: "Judge John Doe",
      acceptedDate: "2025-04-01T10:00:00Z",
      committee: "Criminal Justice",
      status: "Active",
    },
    {
      id: "2",
      name: "Judge Jane Smith",
      acceptedDate: "2025-03-28T09:30:00Z",
      committee: "Family Court",
      status: "Pending",
    },
    {
      id: "3",
      name: "Judge Michael Lee",
      acceptedDate: "2025-04-02T11:15:00Z",
      committee: "Civil Law",
      status: "Active",
    },
    {
      id: "4",
      name: "Judge Emma Johnson",
      acceptedDate: "2025-03-25T14:00:00Z",
      committee: "Appeals",
      status: "Inactive",
    },
    {
      id: "5",
      name: "Judge William Brown",
      acceptedDate: "2025-03-29T16:30:00Z",
      committee: "Criminal Justice",
      status: "Active",
    },
  ];

  const committees = [
    { id: "1", name: "Design Committee" },
    { id: "2", name: "Evaluation Team" },
    { id: "3", name: "Final Review Board" },
    { id: "3", name: "Final Review Board" },
    { id: "3", name: "Final Review Board" },
    { id: "3", name: "Final Review Board" },
    { id: "3", name: "Final Review Board" },
    { id: "3", name: "Final Review Board" },
    { id: "3", name: "Final Review Board" },
    { id: "3", name: "Final Review Board" },
    { id: "3", name: "Final Review Board" },
    { id: "3", name: "Final Review Board" },
    { id: "3", name: "Final Review Board" },
    { id: "3", name: "Final Review Board" },
    { id: "3", name: "Final Review Board" },
  ];
  const shouldShowViewAll = committees.length > 14;

  const handleRequestSort = (property: keyof Judge) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const sortedJudges = dummyJudgesData.sort((a, b) => {
    if (a[orderBy] < b[orderBy]) {
      return order === "asc" ? -1 : 1;
    }
    if (a[orderBy] > b[orderBy]) {
      return order === "asc" ? 1 : -1;
    }
    return 0;
  });
  const filteredJudges = sortedJudges.filter(
    (judge) =>
      judge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      judge.committee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      judge.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedJudges = filteredJudges.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          pt: 4,
          pb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: { xs: "18px", sm: "20px", md: "24px" },
            fontWeight: "bold",
          }}
        >
          {`${award.nameEn} Award judges (${judges.length})`}
        </Typography>

        <Button
          sx={{
            color: "white",
            backgroundColor: "#721F31",
            borderRadius: "8px",
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
          Assign Judges
        </Button>
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
          placeholder="Search"
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
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: "none",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
        }}
      >
        <Table
          sx={{
            minWidth: 650,
            "& .MuiTableCell-root": {
              border: "none",
              py: 1.5,
              color: "#999999",
            },
            "& .MuiTableHead-root .MuiTableCell-root": {
              color: "#999999",
            },
            "& .MuiTableSortLabel-root": {
              color: "inherit !important",
            },
            "& .MuiTableSortLabel-icon": {
              color: "inherit !important",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "name"}
                  direction={orderBy === "name" ? order : "asc"}
                  onClick={() => handleRequestSort("name")}
                  sx={{ color: "#fafafa" }}
                >
                  Name
                  {orderBy === "name" ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === "desc"
                        ? "sorted descending"
                        : "sorted ascending"}
                    </Box>
                  ) : null}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "acceptedDate"}
                  direction={orderBy === "acceptedDate" ? order : "asc"}
                  onClick={() => handleRequestSort("acceptedDate")}
                >
                  Accepted Date
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "committee"}
                  direction={orderBy === "committee" ? order : "asc"}
                  onClick={() => handleRequestSort("committee")}
                >
                  Committee
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "status"}
                  direction={orderBy === "status" ? order : "asc"}
                  onClick={() => handleRequestSort("status")}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ color: "error.main" }}
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : paginatedJudges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ pt: 3 }}>
                  No judges assigned yet
                </TableCell>
              </TableRow>
            ) : (
              paginatedJudges.map((judge) => (
                <TableRow key={judge.id} hover>
                  <TableCell>{judge.name}</TableCell>
                  <TableCell>
                    {new Date(judge.acceptedDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{judge.committee}</TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        color:
                          judge.status === "Active"
                            ? "success.main"
                            : judge.status === "Pending"
                              ? "warning.main"
                              : "error.main",
                        fontWeight: "bold",
                      }}
                    >
                      {judge.status}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      aria-label="more"
                      aria-controls={open ? "actions-menu" : undefined}
                      aria-haspopup="true"
                      onClick={handleClick}
                      size="small"
                    >
                      <MoreHorizIcon />
                    </IconButton>
                    <Menu
                      id="actions-menu"
                      anchorEl={anchorEl}
                      open={open}
                      onClose={handleClose}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                    >
                      <MenuItem
                        onClick={() => {
                          //   onEdit?.();
                          handleClose();
                        }}
                      >
                        Activete
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          //   onDelete?.();
                          handleClose();
                        }}
                      >
                        Remove
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          //   onDelete?.();
                          handleClose();
                        }}
                      >
                        View
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={judges.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: "1px solid #f5f5f5",
            display: "flex",
            justifyContent: "center",
            "& .MuiTablePagination-toolbar": {
              minHeight: "52px",
              padding: "0 16px",
              color: "#616161",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
              justifyContent: "center",
            },
            "& .MuiTablePagination-selectLabel": {
              fontSize: "0.875rem",
              margin: 0,
              fontWeight: 400,
              order: 1,
            },
            "& .MuiTablePagination-select": {
              padding: "6px 24px 6px 8px",
              margin: "0 8px",
              order: 2,
              "&:focus": {
                borderRadius: "4px",
              },
            },
            "& .MuiTablePagination-displayedRows": {
              fontSize: "0.875rem",
              margin: 0,
              fontWeight: 400,
              order: 4,
              flexBasis: "100%",
              textAlign: "center",
              "@media (min-width: 600px)": {
                flexBasis: "auto",
                order: 3,
              },
            },
            "& .MuiTablePagination-actions": {
              marginLeft: 0,
              order: 5,
              "& .MuiIconButton-root": {
                color: "#616161",
                padding: "8px",
                margin: "0 4px",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
                "&.Mui-disabled": {
                  borderColor: "#eeeeee",
                  color: "#bdbdbd",
                },
              },
            },
            "& .MuiInputBase-root": {
              "& .MuiSelect-select": {
                paddingRight: "32px !important",
              },
              "& .MuiSvgIcon-root": {
                color: "#616161",
                right: "8px",
              },
            },
          }}
          labelRowsPerPage="Rows:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
          }
        />
      </TableContainer>
      <Box sx={{ mt: 3, width: "100%", display: "flex", gap: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontSize: "20px",
              mb: 1,
              fontWeight: "bold",
              color: "#616161",
            }}
          >
            Judges Settings
          </Typography>
          <Box
            sx={{
              p: 3,
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              width: "100%",
              minHeight: "200px",
            }}
          >
            {/* Judge Type Radio */}
            <FormControl component="fieldset" sx={{ mb: 2, width: "100%" }}>
              <FormLabel
                component="legend"
                sx={{ mb: 1, color: "#000", fontWeight: "bold" }}
              >
                Type
              </FormLabel>
              <RadioGroup row name="judge-type" defaultValue="individual">
                <FormControlLabel
                  value="individual"
                  control={
                    <Radio
                      sx={{
                        "&.Mui-checked": { color: "#000" },
                      }}
                    />
                  }
                  label="Individual"
                />
                <FormControlLabel
                  value="committee"
                  control={
                    <Radio
                      sx={{
                        "&.Mui-checked": { color: "#000" },
                      }}
                    />
                  }
                  label="Committee"
                />
              </RadioGroup>
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  sx={{
                    "&.Mui-checked": { color: "#721F31" },
                  }}
                />
              }
              label="Team Leader"
              sx={{ mb: 2, display: "block" }}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body1"
                  sx={{ minWidth: "40px", color: "#999999" }}
                >
                  Min
                </Typography>
                <TextField
                  type="number"
                  size="small"
                  sx={{
                    width: "100px",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      "& fieldset": {
                        borderColor: "#e0e0e0",
                      },
                    },
                  }}
                  InputProps={{
                    inputProps: {
                      min: 0,
                      style: {
                        color: "#999999",
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body1"
                  sx={{ minWidth: "40px", color: "#999999" }}
                >
                  Max
                </Typography>
                <TextField
                  type="number"
                  size="small"
                  sx={{
                    width: "100px",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      "& fieldset": {
                        borderColor: "#e0e0e0",
                      },
                    },
                  }}
                  InputProps={{
                    inputProps: {
                      min: 0,
                      style: {
                        color: "#999999",
                      },
                    },
                  }}
                />
              </Box>
            </Box>
            <FormControl component="fieldset" sx={{ mb: 2, width: "100%" }}>
              <FormLabel
                component="legend"
                sx={{ mb: 1, color: "#000", fontWeight: "bold" }}
              >
                Sorting by
              </FormLabel>
              <RadioGroup row name="sorting-method" defaultValue="min">
                <FormControlLabel
                  value="min"
                  control={
                    <Radio
                      sx={{
                        "&.Mui-checked": { color: "#000" },
                      }}
                    />
                  }
                  label="Min"
                />
                <FormControlLabel
                  value="max"
                  control={
                    <Radio
                      sx={{
                        "&.Mui-checked": { color: "#000" },
                      }}
                    />
                  }
                  label="Max"
                />
              </RadioGroup>
            </FormControl>
            <FormControl component="fieldset" sx={{ width: "100%" }}>
              <FormLabel
                component="legend"
                sx={{ mb: 1, color: "#000", fontWeight: "bold" }}
              >
                Distribution
              </FormLabel>
              <RadioGroup row name="distribution-method" defaultValue="random">
                <FormControlLabel
                  value="random"
                  control={
                    <Radio
                      sx={{
                        "&.Mui-checked": { color: "#000" },
                      }}
                    />
                  }
                  label="Random"
                />
                <FormControlLabel
                  value="manual"
                  control={
                    <Radio
                      sx={{
                        "&.Mui-checked": { color: "#000" },
                      }}
                    />
                  }
                  label="Manual"
                />
              </RadioGroup>
            </FormControl>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mt: 3,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Button
                sx={{
                  backgroundColor: "#D9D9D9",
                  color: "white",
                  textTransform: "none",
                  borderRadius: "10px",
                  width: "150px",
                  height: "30px",
                }}
              >
                Edit
              </Button>
              <Button
                sx={{
                  backgroundColor: "#721F31",
                  color: "white",
                  textTransform: "none",
                  borderRadius: "10px",
                  width: "150px",
                  height: "30px",
                }}
              >
                Save
              </Button>
            </Box>
          </Box>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 1,
              fontSize: "20px",
            }}
          >
            Judges Committees
          </Typography>
          <Box
            sx={{
              p: 2,
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              width: "100%",
              minHeight: "150px",
              display: "flex",
              justifyContent: "center",
              flexDirection: "column", // to allow stacking View All at bottom
              alignItems: "center", // center content horizontally
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                maxWidth: "400px",
                width: "100%",
              }}
            >
              {(committees.length > 14
                ? committees.slice(0, 14)
                : committees
              ).map((committee) => (
                <Box
                  key={committee.id}
                  sx={{ width: "50%", padding: "16px 0" }}
                >
                  <Link
                    href={`committees/${committee.id}`}
                    style={{
                      color: "#1976d2",
                      textDecoration: "none",
                      fontSize: "16px",
                    }}
                    className="hover:underline hover:text-blue-700"
                    onClick={() => {
                      try {
                        sessionStorage.setItem(
                          "currentAward",
                          JSON.stringify(award)
                        );
                      } catch (error) {
                        console.error("Failed to store award data:", error);
                      }
                    }}
                  >
                    {committee.name}
                  </Link>
                </Box>
              ))}
            </Box>

            {committees.length > 14 && (
              <Box sx={{ mt: 2 }}>
                <Link
                  href="award/committees"
                  style={{
                    color: "#000",
                    textDecoration: "none",
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                  className="hover:underline"
                >
                  View All
                </Link>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default Judges;
