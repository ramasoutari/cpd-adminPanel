"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/app/utils/axios";
import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import ApiDialog from "@/components/dialog";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AdminLayout from "@/sections/adminLayout";
import Judges from "@/sections/judges";

interface Award {
  id: string;
  nameEn: string;
  description: string;
  // Add other award properties
}

export default function AwardPage({ params }: { params: { id: string } }) {
  const [award, setAward] = useState<Award | null>(null);
  const [value, setValue] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogTitle, setDialogTitle] = useState("");
  const [type, setType] = useState("");
  const [language, setLanguage] = useState("En");
  const [expanded, setExpanded] = useState<string | false>(false);

  useEffect(() => {
    const fetchAward = async () => {
      try {
        const res = await axiosInstance.get(`/awards/${params.id}`);
        setAward(res.data.data);
      } catch (err) {
        console.error("Failed to fetch award:", err);
        setError("Failed to load award data");
      } finally {
        setLoading(false);
      }
    };

    fetchAward();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!award) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Award not found</h1>
      </div>
    );
  }
  const renderTabContent = () => {
    switch (value) {
      case 0:
        return (
          <Box sx={{ mt: 4, width: "100%" }}>
            <Typography variant="h6">Award Information</Typography>
            <Typography>{award.description}</Typography>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 4, width: "100%" }}>
            <Typography variant="h6">Rating Criteria</Typography>
          </Box>
        );
      case 2:
        return <Judges award={award} />;
      default:
        return null;
    }
  };
  const handleChangeLanguage = (event: any) => {
    const selectedLanguage = event.target.value;
    setLanguage(selectedLanguage);
    setExpanded(false);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  const handleChangeTabs = (event: any, newValue: any) => {
    setValue(newValue);
  };

  return (
    <AdminLayout>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ApiDialog
          open={dialogOpen}
          title={dialogTitle}
          message={dialogMessage}
          onClose={handleCloseDialog}
          variant={type}
        />
        <Box sx={{ width: "92%" }}>
          <Stack
            direction="row"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 3,
            }}
          >
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: "64px",
                color: " #721F31",
                minHeight: "50px",
              }}
            >
              {award.nameEn}
            </Typography>
          </Stack>
        </Box>
        <Box
          sx={{
            py: 4,
            px: 2,
            width: "92%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            textAlign: "left",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "column", md: "row" }}
            alignItems={{ xs: "flex-start", sm: "flex-start", md: "center" }}
            justifyContent="space-between"
            spacing={2}
            sx={{ width: "100%" }}
          >
            <Tabs
              value={value}
              onChange={handleChangeTabs}
              orientation={{ xs: "vertical", sm: "horizontal" }}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                width: { xs: "100%", md: "auto" },
                "& .MuiTab-root": {
                  color: "#D9D9D9",
                  fontSize: { xs: "18px", sm: "24px", md: "32px" },
                  padding: { xs: "8px 16px", md: "12px 50px" },
                  textTransform: "none",
                },
                "& .Mui-selected": {
                  fontWeight: "bold",
                  color: "#000 !important",
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: " #721F31",
                  height: "4px",
                },
              }}
            >
              <Tab value={0} label="Award Info" />
              <Tab value={1} label="Rating Criteria" />
              <Tab value={2} label="judges" />
            </Tabs>
          </Stack>

          <Box sx={{ mt: 4, mb: 4, width: "100%" }}>
            {/* <InputLabel sx={{ pl: 1 }} id="language-select-label">
              Language
            </InputLabel>
            <FormControl
              sx={{
                maxWidth: 120,
                height: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <Select
                name="languageSelect"
                labelId="language-select-label"
                value={language}
                onChange={handleChangeLanguage}
                displayEmpty
                sx={{
                  height: 40,
                  padding: "6px 8px",
                  borderRadius: "12px",
                }}
                inputProps={{ "aria-label": "Without label" }}
              >
                <MenuItem value={"Ar"}>Arabic</MenuItem>
                <MenuItem value={"En"}>English</MenuItem>
              </Select>
            </FormControl> */}
            {renderTabContent()}
          </Box>
        </Box>
      </LocalizationProvider>
    </AdminLayout>
  );
}
