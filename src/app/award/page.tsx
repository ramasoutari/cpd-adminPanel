"use client";
import {
  Accordion,
  accordionClasses,
  AccordionDetails,
  accordionDetailsClasses,
  AccordionSummary,
  accordionSummaryClasses,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fade,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import DeleteIcon from "@mui/icons-material/Delete";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React, { use, useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import AdminLayout from "../adminLayout";
import RatingCriteria from "./rating-criteria";
import axios from "axios";
import ApiDialog from "../components/dialog";
import dayjs from "dayjs";
import { RatingCriteriaProvider } from "../context/RatingCriteriaContext";
export default function Award() {
  const [value, setValue] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState([]);
  const [prizeToDelete, setPrizeToDelete] = useState<string | null>(null);

  const [milestones, setMilestones] = useState([]);
  const [awardMilestones, setAwardMilestones] = useState([]);
  const [awardEvents, setAwardEvents] = useState([]);
  const [hasLoadedJudgeTerms, setHasLoadedJudgeTerms] = useState(false);
  const [sponsors, setSponsors] = useState([]);
  const [award, setAward] = useState<any>(null);
  const [applicantSettings, setApplicantSettings] = useState({
    applicantSettingsId: "",
    teamType: "001",
    teamMin: 0,
    teamMax: 0,
    applicantRules: [],
  });
  const [audience, setAudience] = useState([]);
  const [isAccordionOneEditing, setIsAccordionOneEditing] = useState(true);
  const [isAccordiontwoEditing, setIsAccordionTwoEditing] = useState(true);
  const [isAccordionThreeEditing, setIsAccordionThreeEditing] = useState(true);
  const [isAccordionFourEditing, setIsAccordionFourEditing] = useState(true);
  const [isAccordionFiveEditing, setIsAccordionFiveEditing] = useState(true);
  const [applicantType, setApplicantType] = useState("001");
  const [language, setLanguage] = useState("En");
  const [prizeErrors, setPrizeErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState({
    awardName: false,
    organizingHost: false,
    categoriesIds: false,
    targetedAudience: false,
    aboutAward: false,
  });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState<{
    title: string;
    message: string;
    type: string;
    onConfirm: () => void;
    onCancel: () => void;
  }>({
    title: "Confirm",
    message: "",
    type: "",
    onConfirm: () => {},
    onCancel: () => {},
  });
  const [expanded, setExpanded] = useState<string | false>(false);
  const [timelineEntries, setTimelineEntries] = useState([]);
  const [timelineErrors, setTimelineErrors] = useState<{
    [key: number]: { title?: string; date?: string; note?: string };
  }>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogTitle, setDialogTitle] = useState("");
  const [type, setType] = useState("");

  const [judgeTermseErrors, setJudgeTermsErrors] = useState<string[]>([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [awardData, setAwardData] = useState({
    awardName: "",
    organizingHost: "",
    targetedAudience: "",
    categoriesIds: [],
    aboutAward: "",
    logo: null,
  });
  const [prizes, setPrizes] = useState([{ rankEn: "Prize 1", value: 0 }]);
  const [Judgeterms, setJudgeTerms] = useState<string[]>([""]);
  const [applicantTerms, setApplicantTerms] = useState<string[]>([""]);
  const [applicantTermseErrors, setApplicantTermsErrors] = useState<string[]>(
    []
  );
  const handleAddApplicantField = () => {
    setApplicantSettings((prevSettings) => ({
      ...prevSettings,
      applicantRules: [
        ...(Array.isArray(prevSettings.applicantRules)
          ? prevSettings.applicantRules
          : []),
        { rule: "" },
      ],
    }));

    setApplicantTermsErrors((prevErrors) =>
      Array.isArray(prevErrors) ? [...prevErrors, ""] : [""]
    );
  };

  const handleApplicantTermChange = (index: number, value: string) => {
    setApplicantSettings((prev) => {
      const newRules = [...prev.applicantRules];
      newRules[index] = {
        ...newRules[index],
        [language === "Ar" ? "ruleAr" : "ruleEn"]: value,
      };
      return {
        ...prev,
        applicantRules: newRules,
      };
    });

    // Clear error for this field
    setApplicantTermsErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = "";
      return newErrors;
    });
  };
  const handleSaveApplicantTerms = async () => {
    const termErrors: string[] = applicantSettings.applicantRules.map(
      (term) => {
        const termValue = language === "Ar" ? term.ruleAr : term.ruleEn;
        return !termValue || termValue.trim() === ""
          ? "Terms and conditions cannot be empty"
          : "";
      }
    );

    // Check if at least one term exists and is non-empty
    const hasEmptyTerms = termErrors.some((e) => e !== "");
    const noTerms = applicantSettings.applicantRules.length === 0;

    // Validate team settings if team type is selected
    let teamValidationErrors: string[] = [];
    if (applicantSettings.teamType === "002") {
      const min = Number(applicantSettings.teamMin);
      const max = Number(applicantSettings.teamMax);

      if (!applicantSettings.teamMin || isNaN(min) || min < 1) {
        teamValidationErrors.push("Minimum team members must be at least 1");
      }

      if (!applicantSettings.teamMax || isNaN(max) || max < 1) {
        teamValidationErrors.push("Maximum team members must be at least 1");
      }

      if (min > max) {
        teamValidationErrors.push("Minimum cannot be greater than maximum");
      }
    }

    // Set all errors
    setApplicantTermsErrors(termErrors);

    // Check if we should abort saving
    if (hasEmptyTerms || noTerms || teamValidationErrors.length > 0) {
      if (noTerms) {
        setDialogOpen(true);
        setDialogTitle("Error");
        setType("error");
        setDialogMessage("At least one applicant term is required");
      } else if (teamValidationErrors.length > 0) {
        setDialogOpen(true);
        setDialogTitle("Error");
        setType("error");

        setDialogMessage(teamValidationErrors.join("\n"));
      }
      return;
    }
    const requestData = {
      awardId: award.id,
      teamType: applicantSettings.teamType || "001",
      applicantRules: applicantSettings.applicantRules.map((term) => ({
        rule: language === "Ar" ? term.ruleAr : term.ruleEn, // Set rule as per language
      })),
      ...(applicantSettings.teamType === "002" && {
        teamMin: Number(applicantSettings.teamMin),
        teamMax: Number(applicantSettings.teamMax),
      }),
      ...(applicantSettings.id && {
        applicantSettingsId: applicantSettings.id,
      }),
    };

    try {
      const response = await axios.post(
        "http://98.83.87.183:3001/api/awards/saveApplicantRules",
        requestData,
        {
          headers: {
            lang: language,
          },
        }
      );

      setDialogOpen(true);
      setDialogTitle("Successfully");
      setType("success");
      setDialogMessage("");
      setApplicantSettings(response.data.data);
      setIsAccordionFiveEditing(false);
      setExpanded(false);
    } catch (error: any) {
      setDialogOpen(true);
      setDialogTitle("");
      setType("Error");
      setDialogMessage(
        error.response?.data?.message ||
          "An error occurred while saving applicant terms."
      );
    }
  };

  const handleAddField = () => {
    setJudgeTerms((prev) => [
      ...prev,
      { id: undefined, ruleEn: "", ruleAr: null },
    ]);
    setJudgeTermsErrors((prev) => [...prev, ""]);
  };

  const handleTermChange = (index: number, value: string) => {
    setJudgeTerms((prev) => {
      const newTerms = [...prev];
      if (language === "Ar") {
        newTerms[index] = { ...newTerms[index], ruleAr: value };
      } else {
        newTerms[index] = { ...newTerms[index], ruleEn: value };
      }
      return newTerms;
    });

    // Clear error for this field
    setJudgeTermsErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = "";
      return newErrors;
    });
  };
  const handleSave = async () => {
    try {
      const dataToSend = {
        logo: language === "Ar" ? awardData.logoAr : awardData.logoEn,
        name: language === "Ar" ? awardData.nameAr : awardData.nameEn,
        objective:
          language === "Ar" ? awardData.objectiveAr : awardData.objectiveEn,
        audienceIds: Array.isArray(awardData.targetedAudience)
          ? awardData.targetedAudience.map((audience) => audience.id)
          : [awardData.targetedAudience?.id], // Ensure it's an array of IDs
        sponsorsIds: Array.isArray(awardData.organizingHost)
          ? awardData.organizingHost.map((sponsor) => sponsor.id)
          : [awardData.organizingHost?.id], // Ensure it's an array of IDs
        categoriesIds: awardData.categoriesIds,
        ...(award?.id && { id: award.id }),
      };

      const response = await axios.post(
        "http://98.83.87.183:3001/api/awards/saveBasicAward",
        dataToSend,
        {
          headers: {
            lang: language,
          },
        }
      );

      if (response.data.status === 500) {
        showErrorDialog("award name is used before");
        setIsAccordionOneEditing(true);
        return;
      }

      setAward(response.data.data);
      setDialogTitle("Successfully");
      setType("success");
      setDialogMessage("");
      setExpanded(false);
    } catch (error: any) {
      console.error("Error while saving award:", error);
      setDialogTitle("Error");
      setType("error");
      setDialogMessage(
        error.response?.data?.message ||
          "An error occurred while saving the award."
      );
      setIsAccordionOneEditing(true);
    } finally {
      setDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  const validateTimeline = () => {
    const errors = {};
    let isValid = true;

    timelineEntries.forEach((entry, index) => {
      errors[index] = {};

      if (entry.type === "001") {
        // Event
        const title =
          language === "En"
            ? (entry.titleEn || "").trim()
            : (entry.titleAr || "").trim();
        const note =
          language === "En"
            ? (entry.NoteEn || "").trim()
            : (entry.NoteAr || "").trim();

        if (!title) {
          errors[index].title = "Event name is required";
          isValid = false;
        }

        if (!note) {
          errors[index].note = "Note is required";
          isValid = false;
        }

        if (!dayjs(entry.date).isValid()) {
          errors[index].date = "Valid date is required";
          isValid = false;
        }
      } else if (entry.type === "002") {
        // Milestone
        if (!entry.milestoneId) {
          errors[index].milestoneId = "Milestone title is required";
          isValid = false;
        }

        if (!dayjs(entry.date).isValid()) {
          errors[index].date = "Valid date is required";
          isValid = false;
        }
      }
    });

    setTimelineErrors(errors);
    return isValid;
  };

  const savePrizes = async () => {
    console.log("award", award);
    if (!award || !award.id) {
      return;
    }
    try {
      const requestBody = {
        id: award.id,
        prizes: prizes.map((prize) => ({
          rank: prize.rankEn,
          value: Number(prize.value),
        })),
      };
      const response = await axios.post(
        "http://98.83.87.183:3001/api/awards/savePrizes",
        requestBody,
        {
          headers: {
            lang: language,
          },
        }
      );
      setDialogOpen(true);
      setDialogTitle("Successfully");
      setType("success");
      setDialogMessage("");
      setPrizeErrors([]);
      setIsAccordionTwoEditing(false);
      setExpanded(false);
    } catch (error: any) {
      console.error("Error saving award:", error);
      setDialogOpen(true);
      setDialogTitle("");
      setType("error");
      setDialogMessage(
        error.response?.data?.message ||
          "An error occurred while saving the prizes."
      );
    }
  };
  const handleSaveTimeline = async () => {
    if (validateTimeline()) {
      const formatDate = (date: string) => {
        return new Date(date).toISOString().split("T")[0];
      };
      try {
        const milestonesData = timelineEntries
          .filter((entry) => entry.type === "002")
          .map((entry) => {
            const data = {
              milestoneId: entry.milestoneId,
              date: formatDate(entry.date),
            };
            if (entry.id) {
              data.awardMilestoneId = entry.id;
            }
            return data;
          });
        // const milestonesData = timelineEntries
        //   .filter((entry) => entry.type === "002")
        //   .map((entry) => ({
        //     id: entry.id,
        //     milestoneId: entry.milestoneId,
        //     date: formatDate(entry.date),
        //   }));
        // const eventsData = timelineEntries
        //   .filter((entry) => entry.type === "001")
        //   .map((entry) => ({
        //     id: entry.id,
        //     title: entry.title,
        //     date: formatDate(entry.date),
        //     note: entry.note,
        //   }));
        const eventsData = timelineEntries
          .filter((entry) => entry.type === "001")
          .map((entry) => {
            const data = {
              title: entry.title || entry.titleEn || entry.titleAr || "",
              date: formatDate(entry.date),
              note: entry.note || entry.NoteEn || entry.NoteAr || "",
            };
            if (entry.id) {
              data.id = entry.id;
            }
            return data;
          });
        const milestonesResponse = await axios.post(
          `http://98.83.87.183:3001/api/awards/saveAwardMilestone`,
          {
            awardId: award.id,
            milestone: milestonesData,
          }
        );
        const eventsResponse = await axios.post(
          `http://98.83.87.183:3001/api/awards/saveEvent`,
          { awardId: award.id, events: eventsData },
          {
            headers: {
              lang: language,
            },
          }
        );
        setDialogOpen(true);
        setDialogTitle("Successfully");
        setType("success");
        setDialogMessage("");
        fetchAwardMilestones();
        fetchAwardEvents();
        setIsAccordionThreeEditing(false);
        setExpanded(false);
      } catch (error: any) {
        setDialogOpen(true);
        setDialogTitle("Error");
        setDialogTitle("");
        setType("error");
        setDialogMessage(
          error.response?.data?.message ||
            "An error occurred while saving the timeline."
        );
      }
    }
  };

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const response = await axios.get(
          "http://98.83.87.183:3001/api/timeline/milestones"
        );
        setMilestones(response.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchMilestones();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, sponsorsRes, audienceRes] = await Promise.all([
          axios.get("http://98.83.87.183:3001/api/categories"),
          axios.get("http://98.83.87.183:3001/api/sponsors"),
          axios.get("http://98.83.87.183:3001/api/audience"),
        ]);
        setCategories(categoriesRes.data.data);
        setSponsors(sponsorsRes.data.data);
        setAudience(audienceRes.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  const showErrorDialog = (message: string) => {
    setDialogOpen(true);
    setDialogTitle("Error");
    setType("error");
    setDialogMessage(message);
  };
  const handleSaveJudgeTerms = async () => {
    const isValid = validateJudgeTerms();

    if (!isValid) {
      console.warn("Validation failed. Cannot save.");
      return;
    }
    if (award && award.id) {
      const judgeRulesData = {
        id: award.id,
        judgeRules: Judgeterms.map((term) => ({
          rule: language === "En" ? term.ruleEn : term.ruleAr,
        })),
      };

      try {
        const response = await axios.post(
          "http://98.83.87.183:3001/api/awards/saveJudgeRules",
          judgeRulesData,
          {
            headers: {
              lang: language,
            },
          }
        );
        setIsAccordionFourEditing(false);
        setDialogOpen(true);
        setDialogTitle("Successfully");
        setType("success");
        setDialogMessage("");
        setExpanded(false);
      } catch (error: any) {
        setDialogOpen(true);
        setDialogTitle("");
        setType("error");
        setDialogMessage(
          error.response?.data?.message ||
            "An error occurred whilesaving judge terms"
        );
      }
    }
  };
  const handleChange =
    (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      if (panel !== "panel1" && !award?.id) return;
      setExpanded(isExpanded ? panel : false);
    };
  const handleChangeTabs = (event: any, newValue: any) => {
    setValue(newValue);
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/bmp",
      "image/heic",
    ];
    const maxSize = 8 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setDialogOpen(true);
      setType("error");
      setDialogMessage(
        "Unsupported file type. Please upload png, jpg, jpeg, bmp, or heic."
      );
      return;
    }
    if (file.size > maxSize) {
      setDialogOpen(true);
      setType("error");
      setDialogTitle("Error");
      setDialogMessage("File is too large. Maximum allowed size is 8 MB.");
      return;
    }
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    console.log("previewUrl", previewUrl);

    const formDataToSend = new FormData();
    formDataToSend.append("file", file);

    try {
      const response = await axios.post(
        "http://98.83.87.183:3001/api/attachments/upload",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const filePath = response.data.filePath;
      const fullPath = filePath.startsWith("http")
        ? filePath
        : `http://98.83.87.183:3001/${filePath}`;
      console.log("full path", fullPath);

      setAwardData((prev) => ({
        ...prev,
        [language === "Ar" ? "logoAr" : "logoEn"]: filePath,
      }));
    } catch (error: any) {
      setDialogOpen(true);
      setDialogTitle("Error");
      setType("error");
      setDialogMessage(
        error.response?.data?.message ||
          "An error occurred while uploading the logo."
      );
    }
  };
  // const handleChangeSelect = (event) => {
  //   const { name, value } = event.target;
  //   setAwardData((prev) => ({
  //     ...prev,
  //     [name]: typeof value === "string" ? value.split(",") : value,
  //   }));
  // };
  const handleChangeSelect = (e) => {
    const { name, value } = e.target;
    console.log("Selected categories:", value);

    if (name === "organizingHost") {
      const selectedSponsor = sponsors.find((s) => s.id === value);
      setAwardData((prev) => ({
        ...prev,
        organizingHost: selectedSponsor || { id: "" }, // Keep the entire object
      }));
    } else if (name === "targetedAudience") {
      const selectedAudience = audience.find((a) => a.id === value);
      setAwardData((prev) => ({
        ...prev,
        targetedAudience: selectedAudience || { id: "" }, // Keep the entire object
      }));
    } else if (name === "categoriesIds") {
      setAwardData((prev) => ({
        ...prev,
        categoriesIds: value,
      }));
    }
  };
  const handleAddEntry = (type) => {
    const newEntry = {
      type,
      date: new Date().toISOString(),
    };

    if (type === "001") {
      // For events
      newEntry.title = "";
      newEntry.titleEn = "";
      newEntry.titleAr = "";
      newEntry.note = "";
      newEntry.NoteEn = "";
      newEntry.NoteAr = "";
    } else if (type === "002") {
      newEntry.milestoneId = "";
    }

    setTimelineEntries([...timelineEntries, newEntry]);
  };

  const deleteEntry = async (index: number) => {
    try {
      const entry = timelineEntries[index];

      // Early return if index is invalid
      if (index < 0 || index >= timelineEntries.length) return;

      if (entry.id) {
        let url = "";
        if (entry.type === "001") {
          url = `http://98.83.87.183:3001/api/awards/event/${entry.id}`;
        } else if (entry.type === "002") {
          url = `http://98.83.87.183:3001/api/awards/milestone/${entry.id}`;
        }

        if (url) {
          await axios.delete(url);
        }
      }

      // Update state immutably
      setTimelineEntries((prev) => prev.filter((_, i) => i !== index));

      // Clean up any errors for this index
      setTimelineErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
    } catch (error) {
      console.error("Error removing entry:", error);
      // Consider adding user feedback here
    }
  };
  const handleDeleteEntry = (index: number) => {
    openConfirmDialog("Are you sure you want to delete this entry?", () =>
      deleteEntry(index)
    );
  };

  const handleChangeEntry = (
    originalIndex: number,
    type: string,
    key: string,
    value: any
  ) => {
    setTimelineEntries((prevEntries) =>
      prevEntries.map((entry, index) => {
        if (index === originalIndex) {
          const updatedEntry = { ...entry };

          // Handle special cases
          if (key === "titleEn" || key === "titleAr") {
            updatedEntry[key] = value;
            updatedEntry.title = value; // Update generic title field
          } else if (key === "NoteEn" || key === "NoteAr") {
            updatedEntry[key] = value;
            updatedEntry.note = value; // Update generic note field
          } else {
            updatedEntry[key] = value;
          }

          return updatedEntry;
        }
        return entry;
      })
    );

    setTimelineErrors((prev) => ({
      ...prev,
      [originalIndex]: {
        ...prev[originalIndex],
        [key.replace(/En|Ar$/, "")]: undefined,
      },
    }));
  };

  const deleteJudgeTerm = async (index: number, id: string) => {
    if (!id) {
      const updatedTerms = [...Judgeterms];
      updatedTerms.splice(index, 1);
      setJudgeTerms(updatedTerms);
      return;
    }
    try {
      const response = await axios.delete(
        `http://98.83.87.183:3001/api/awards/judge-rules/${id}`
      );

      if (response.status === 200) {
        const updatedTerms = [...Judgeterms];
        updatedTerms.splice(index, 1);
        setJudgeTerms(updatedTerms);
      } else {
        console.error("Error deleting judge rule:", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting judge rule:", error);
    }
  };

  const handleDeleteTerm = (index: number, id: string) => {
    openConfirmDialog("Are you sure you want to delete this judge term?", () =>
      deleteJudgeTerm(index, id)
    );
  };

  const deleteApplicantTerm = async (index: number, id: string) => {
    if (applicantSettings.applicantRules.length === 1) return;
    try {
      const response = await axios.delete(
        `http://98.83.87.183:3001/api/awards/applicant-rules/${id}`
      );
      if (response.status === 200) {
        const updatedSettings = { ...applicantSettings };
        updatedSettings.applicantRules = updatedSettings.applicantRules.filter(
          (_, i) => i !== index
        );
        setApplicantSettings(updatedSettings);
        const updatedTerms = [...applicantTerms];
        const updatedErrors = [...applicantTermseErrors];
        updatedTerms.splice(index, 1);
        updatedErrors.splice(index, 1);
        setApplicantTerms(updatedTerms);
        setApplicantTermsErrors(updatedErrors);
      } else {
        console.error("Error deleting applicant rule:", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting applicant rule:", error);
    }
  };
  const handleDeleteApplicantTerm = (index: number, id: string) => {
    openConfirmDialog(
      "Are you sure you want to delete this applicant term?",
      () => deleteApplicantTerm(index, id)
    );
  };
  const handleChangeLanguage = (event: any) => {
    const selectedLanguage = event.target.value;
    setLanguage(selectedLanguage);
    setExpanded(false);
    setAwardData({
      awardName: "",
      organizingHost: "",
      targetedAudience: "",
      categoriesIds: [],
      aboutAward: "",
      logo: null,
    });
    setPreviewUrl(null);
    setTimelineErrors({});
    setJudgeTermsErrors([]);
    setPrizeErrors([]);
    setApplicantTermsErrors([]);
    setFieldErrors({
      awardName: false,
      organizingHost: false,
      targetedAudience: false,
      categoriesIds: false,
      aboutAward: false,
    });
    setTimelineEntries([
      { type: "002", title: "", date: null },
      { type: "001", title: "", date: null, note: "" },
    ]);
    setPrizes([{ rankEn: "Prize 1", value: 0 }]);
    setJudgeTerms([""]);
    setApplicantTerms([""]);
    setIsAccordionOneEditing(true);
    setIsAccordionTwoEditing(true);
    setIsAccordionThreeEditing(true);
    setIsAccordionFourEditing(true);
    setIsAccordionFiveEditing(true);
  };
  const getLabelWithLanguage = (label: string) => {
    const languageLabel = language === "Ar" ? " (Arabic)" : " (English)";
    return (
      <>
        {label}
        <span style={{ fontSize: "18px", color: "#FF4242" }}>
          {languageLabel}
        </span>
      </>
    );
  };

  const validateFields = (data: any) => {
    const errors: any = {};
    if (
      (language === "En" && (!data.nameEn || data.nameEn.trim() === "")) ||
      (language === "Ar" && (!data.nameAr || data.nameAr.trim() === ""))
    ) {
      errors.awardName = "Award name is required";
    }
    if (!data.organizingHost?.id) {
      errors.organizingHost = "Organizing Host is required";
    }
    if (!data.targetedAudience?.id) {
      errors.targetedAudience = "Targeted Audience is required";
    }
    if (
      !Array.isArray(data.categoriesIds) ||
      data.categoriesIds.length === 0 ||
      data.categoriesIds.every((val) => val === "")
    ) {
      errors.categoriesIds = "Please select at least one category.";
    }
    if (
      (language === "En" &&
        (!data.objectiveEn || data.objectiveEn.trim() === "")) ||
      (language === "Ar" &&
        (!data.objectiveAr || data.objectiveAr.trim() === ""))
    ) {
      errors.aboutAward = "about award is required";
    }
    setFieldErrors(errors);

    return errors;
  };
  const checkForErrors = () => {
    const fieldErrorsExist =
      fieldErrors && Object.values(fieldErrors).some((error) => error);
    const otherErrorsExist =
      (applicantTermseErrors && applicantTermseErrors.length > 0) ||
      (timelineErrors && Object.keys(timelineErrors).length > 0) ||
      (judgeTermseErrors && judgeTermseErrors.length > 0) ||
      (prizeErrors && prizeErrors.length > 0);

    return fieldErrorsExist || otherErrorsExist;
  };
  const areMandatoryFieldsFilled = () => {
    const isAwardDataComplete =
      awardData.awardName?.trim() !== "" &&
      awardData.organizingHost !== "" &&
      awardData.targetedAudience !== "" &&
      awardData.aboutAward?.trim() !== "";

    const isTimelineComplete = timelineEntries.some(
      (entry) => entry.title?.trim() !== "" && entry.date !== null
    );
    const areJudgeTermsComplete = Judgeterms.some((term) => {
      if (language === "Ar") {
        return typeof term.ruleAr === "string" && term.ruleAr.trim() !== "";
      }
      return typeof term.ruleEn === "string" && term.ruleEn.trim() !== "";
    });
    const areApplicantTermsComplete = applicantTerms.some(
      (term) => term?.trim() !== ""
    );
    const arePrizesComplete =
      Array.isArray(prizes) &&
      prizes.some(
        (prize) => typeof prize.value === "number" && prize.value > 0
      );
    const isApplicantTypeSelected = applicantType?.trim() !== "";
    return (
      isAwardDataComplete &&
      isTimelineComplete &&
      areJudgeTermsComplete &&
      areApplicantTermsComplete &&
      arePrizesComplete &&
      isApplicantTypeSelected
    );
  };
  const isPublishDisabled = () => {
    const hasApplicantTermsError = applicantTermseErrors.some(
      (error) => error !== ""
    );
    const hasTimelineError =
      timelineErrors && Object.keys(timelineErrors).length > 0;
    const hasJudgeTermsError = judgeTermseErrors.some((error) => error !== "");
    const hasPrizeError = prizeErrors && prizeErrors.length > 0;
    const hasFieldError =
      fieldErrors && Object.values(fieldErrors).some((error) => error);

    const hasAnyError =
      hasApplicantTermsError ||
      hasTimelineError ||
      hasJudgeTermsError ||
      hasPrizeError ||
      hasFieldError;
    const areMandatoryComplete = areMandatoryFieldsFilled();
    return hasAnyError || !areMandatoryComplete;
  };

  useEffect(() => {
    const disabled = isPublishDisabled();
    setIsButtonDisabled(disabled);
  }, [
    awardData,
    timelineEntries,
    Judgeterms,
    applicantTerms,
    prizes,
    applicantType,
    fieldErrors,
    timelineErrors,
    judgeTermseErrors,
    prizeErrors,
    applicantTermseErrors,
  ]);
  const fetchApplicantTerms = async () => {
    if (!award?.id) return;

    try {
      const response = await axios.get(
        `http://98.83.87.183:3001/api/awards/applicantRules/${award.id}`
      );

      if (response.data.data?.length > 0) {
        const apiData = response.data.data[0];
        setApplicantSettings({
          id: apiData.id || undefined,
          teamType: apiData.teamType || "001",
          teamMin: apiData.teamMin || 1,
          teamMax: apiData.teamMax || 1,
          applicantRules:
            apiData.applicantRules?.map((rule: any) => ({
              id: rule.id,
              ruleEn: rule.ruleEn || "",
              ruleAr: rule.ruleAr || "",
            })) || [],
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setApplicantSettings({
        id: undefined,
        teamType: "001",
        teamMin: 1,
        teamMax: 1,
        applicantRules: [],
      });
    }
  };
  useEffect(() => {
    if (
      expanded === "panel5"
      // &&award.id
      // !hasLoadedApplicantTerms
    ) {
      fetchApplicantTerms();
      // setHasLoadedApplicantTerms(true);
    }
  }, [expanded]);
  const fetchAwardBasicInfo = async () => {
    if (!award?.id) return;

    try {
      const response = await axios.get(
        `http://98.83.87.183:3001/api/awards/${award.id}`
      );
      const apiData = response.data.data;

      console.log("API Response:", apiData); // Debug log

      setAwardData((prev) => ({
        ...prev,
        nameEn: apiData.nameEn || "",
        nameAr: apiData.nameAr || "",
        objectiveEn: apiData.objectiveEn || "",
        objectiveAr: apiData.objectiveAr || "",
        logoEn: apiData.logoEn || "",
        logoAr: apiData.logoAr || "",
        organizingHost: apiData.sponsors?.[0] || { id: "" },
        targetedAudience: apiData.audience?.[0] || { id: "" },
        categoriesIds: apiData.categories?.map((c) => c.id) || [],
      }));
    } catch (error) {
      console.error("Error fetching award basic info:", error);
    }
  };
  useEffect(() => {
    if (expanded === "panel1") {
      fetchAwardBasicInfo();
    }
  }, [language, expanded]);
  useEffect(() => {
    console.log("Timeline entries:", timelineEntries);
    console.log("Milestones:", milestones);
  }, [timelineEntries, milestones]);
  const fetchAwardMilestones = async () => {
    if (!award || !award.id) return;
    try {
      const response = await axios.get(
        `http://98.83.87.183:3001/api/awards/awardMilestones/${award.id}`
      );

      const milestonesData = response.data.data.map((milestone) => {
        console.log("Processing milestone:", milestone);
        return {
          id: milestone.id,
          type: "002",
          milestoneId: milestone.milestone?.id || "",
          date: milestone.dateOfMilestone || null,
        };
      });
      setTimelineEntries((prevEntries) => {
        const filteredEntries = prevEntries.filter(
          (entry) => entry.type !== "002"
        );
        return [...filteredEntries, ...milestonesData];
      });
      setAwardMilestones(response.data.data);
    } catch (error) {
      console.error("Failed to fetch award Milestones", error);
    }
  };
  const fetchAwardEvents = async () => {
    if (!award || !award.id) return;
    try {
      const response = await axios.get(
        `http://98.83.87.183:3001/api/awards/events/${award.id}`
      );

      const eventsData = response.data.data.map((event) => ({
        type: "001",
        id: event.id || null,
        date: event.date || new Date().toISOString(),
        title: event.title || "",
        titleEn: event.titleEn || event.title || "",
        titleAr: event.titleAr || event.title || "",
        note: event.note || "",
        NoteEn: event.NoteEn || event.note || "",
        NoteAr: event.NoteAr || event.note || "",
      }));

      setTimelineEntries((prevEntries) => {
        const filteredEntries = prevEntries.filter(
          (entry) => entry.type !== "001"
        );
        return [...filteredEntries, ...eventsData];
      });
      setAwardEvents(response.data.data);
    } catch (error) {
      console.error("Failed to fetch award Events", error);
    }
  };
  useEffect(() => {
    if (expanded === "panel3") {
      fetchAwardMilestones();
      fetchAwardEvents();
    }
  }, [expanded]);

  const fetchPrizes = async () => {
    if (!award || !award.id) return;
    try {
      const response = await axios.get(
        `http://98.83.87.183:3001/api/awards/prizes/${award.id}`
      );
      const fetchedPrizes = response.data.data;

      const updatedPrizes =
        fetchedPrizes.length > 0
          ? fetchedPrizes
          : [{ rankEn: "Prize 1", value: 0 }];

      setPrizes(updatedPrizes);
    } catch (error) {
      console.error("Failed to fetch judge terms", error);
    }
  };

  useEffect(() => {
    console.log("expanded", expanded);
    if (expanded === "panel2") {
      fetchPrizes();
      // setHasLoadedPrizes(true);
    }
  }, [expanded]);
  const fetchJudgeTerms = async () => {
    if (!award || !award.id) return;
    try {
      const response = await axios.get(
        `http://98.83.87.183:3001/api/awards/judgeRules/${award.id}`
      );
      setJudgeTerms(response.data.data);
    } catch (error) {
      console.error("Failed to fetch judge terms", error);
    }
  };
  useEffect(() => {
    if (
      expanded === "panel4"
      // &&award.id
      // !hasLoadedJudgeTerms
    ) {
      fetchJudgeTerms();
      // setHasLoadedJudgeTerms(true);
    }
  }, [expanded]);
  const validateJudgeTerms = () => {
    const errors: string[] = [];
    let isValid = true;

    // Check if at least one term exists
    if (Judgeterms.length === 0) {
      showErrorDialog("At least one judge term is required");
      return;
      isValid = false;
    } else {
      // Validate each term
      Judgeterms.forEach((term, index) => {
        const termValue = language === "Ar" ? term.ruleAr : term.ruleEn;
        if (!termValue || termValue.trim() === "") {
          errors[index] = "This field cannot be empty";
          isValid = false;
        } else {
          errors[index] = "";
        }
      });
      if (
        isValid &&
        !Judgeterms.some((term) =>
          (language === "Ar" ? term.ruleAr : term.ruleEn)?.trim()
        )
      ) {
        errors[0] = "At least one judge term must be filled";
        isValid = false;
      }
    }

    setJudgeTermsErrors(errors);
    return isValid;
  };

  const deletePrize = async (index, prizeId) => {
    if (!prizeId) {
      setPrizes((prevPrizes) => {
        const updated = [...prevPrizes];
        updated.splice(index, 1);
        return updated;
      });
      return;
    }
    try {
      const response = await axios.delete(
        `http://98.83.87.183:3001/api/awards/prizes/${prizeId}`
      );
      if (response.status === 200) {
        setPrizes((prevPrizes) =>
          prevPrizes.filter((prize) => prize.id !== prizeId)
        );
        setDialogOpen(true);
        setDialogTitle("Success");
        setType("success");
        setDialogMessage("prize deleted successfully!");
      } else {
        console.error("Failed to delete prize");
      }
    } catch (error) {
      console.error("Error deleting prize:", error);
    }
  };

  const handleDeletePrize = (index, prizeId: string) => {
    openConfirmDialog(
      "Are you sure you want to delete this prize?",
      () => deletePrize(index, prizeId),
      () => handleCancelDelete()
    );
  };
  const openConfirmDialog = (
    message: string,
    onConfirm: () => void,
    onCancel: () => void
  ) => {
    setConfirmDialogConfig({ message, onConfirm, onCancel });
    setConfirmDialogOpen(true);
  };

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false);
  };
  return (
    <AdminLayout>
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelDelete}
        sx={{
          "& .MuiPaper-root": {
            width: "600px",
            maxWidth: "90vw",
            padding: "24px",
            borderRadius: "12px",
          },
        }}
      >
        <IconButton
          aria-label="close"
          onClick={() => {
            setConfirmDialogOpen(false);
          }}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 2,
          }}
        >
          <img src="/assets/clarity_remove-line.png" />

          <DialogContent
            sx={{
              padding: 0,
              fontSize: "18px",
              color: "text.primary",
            }}
          >
            {confirmDialogConfig.message}
          </DialogContent>

          <DialogActions
            sx={{
              justifyContent: "center",
              width: "100%",
              padding: 0,
              mt: 3,
              gap: 2,
            }}
          >
            <Button
              onClick={() => {
                confirmDialogConfig.onCancel();
                setConfirmDialogOpen(false);
              }}
              variant="contained"
              sx={{
                minWidth: "150px",
                padding: "8px 16px",
                fontSize: "16px",
                bgcolor: "#999999",
                color: "white",
              }}
            >
              No
            </Button>
            <Button
              onClick={() => {
                confirmDialogConfig.onConfirm();
                setConfirmDialogOpen(false);
              }}
              color="error"
              variant="contained"
              sx={{
                minWidth: "150px",
                padding: "8px 16px",
                fontSize: "16px",
              }}
            >
              Yes
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

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
              Create New Award
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
                  padding: { xs: "8px 16px", md: "12px 24px" },
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
            </Tabs>
          </Stack>

          <Box sx={{ mt: 4, mb: 4, width: "100%" }}>
            <InputLabel sx={{ pl: 1 }} id="language-select-label">
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
            </FormControl>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: "100%",
            }}
          >
            {value === 0 ? (
              <>
                <Accordion
                  expanded={expanded === "panel1"}
                  onChange={handleChange("panel1")}
                  sx={{
                    width: "100%",
                    borderRadius: "8px",
                    [`& .${accordionSummaryClasses.root}`]: {
                      minHeight: expanded === "panel1" ? "64px" : "80px",
                    },
                    [`& .${accordionSummaryClasses.content}`]: {
                      margin: 0,
                    },
                    [`& .${accordionDetailsClasses.root}`]: {
                      display: expanded === "panel1" ? "block" : "none",
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                    sx={{
                      width: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "1.2rem",
                        }}
                      >
                        Information
                      </Typography>
                      {expanded === "panel1" && !isAccordionOneEditing && (
                        <Box sx={{ marginRight: "40px" }}>
                          <a
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsAccordionOneEditing(true);
                            }}
                            style={{
                              color: "#5CB4FF",
                              textDecoration: "none",
                            }}
                          >
                            Edit
                          </a>
                        </Box>
                      )}
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Box
                      sx={{
                        mb: 2,
                        pointerEvents: isAccordionOneEditing ? "auto" : "none",
                        opacity: isAccordionOneEditing ? 1 : 0.6,
                      }}
                    >
                      <label
                        htmlFor="upload-logo"
                        style={{ cursor: "pointer" }}
                      >
                        <Box>
                          <img
                            src={
                              previewUrl ||
                              (language === "Ar"
                                ? awardData.logoAr
                                  ? `http://98.83.87.183:3001/${awardData.logoAr}`
                                  : null
                                : awardData.logoEn
                                  ? `http://98.83.87.183:3001/${awardData.logoEn}`
                                  : null) ||
                              "/assets/add-logo.png"
                            }
                            alt="Logo"
                            style={{
                              width: "100px",
                              height: "auto",
                              borderRadius: "8px",
                              objectFit: "contain",
                            }}
                          />
                        </Box>
                        <div
                          style={{
                            color: "#5CB4FF",
                            paddingTop: 10,
                            fontSize: "14px",
                            marginRight: 8,
                          }}
                        >
                          {language === "Ar"
                            ? awardData.logoAr
                              ? "Change Logo"
                              : "Add Logo"
                            : awardData.logoEn
                              ? "Change Logo"
                              : "Add Logo"}
                        </div>
                      </label>
                      <input
                        type="file"
                        accept=".png, .jpg, .jpeg, .bmp, .heic"
                        onChange={handleLogoChange}
                        id="upload-logo"
                        hidden={true}
                      />
                    </Box>

                    <Grid
                      container
                      direction="column"
                      rowSpacing={2}
                      sx={{
                        justifyContent: "center",
                        alignItems: "stretch",
                        borderRadius: "12px",
                        pt: 2,
                      }}
                    >
                      <Grid
                        sx={{
                          backgroundColor: "#FBFBFB",
                          p: 3,
                          borderRadius: "12px",
                          border: "1px solid #D5D8DD",
                        }}
                        size={12}
                      >
                        <InputLabel
                          sx={{ color: "black", mb: 2, fontSize: "24px" }}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mb: 2 }}
                          >
                            <span style={{ fontSize: "24px", color: "black" }}>
                              {getLabelWithLanguage("Award Name")}
                            </span>
                            <Tooltip title="Enter the official name of the award in the selected language.">
                              <InfoOutlinedIcon
                                sx={{
                                  fontSize: 20,
                                  color: "#888",
                                  cursor: "pointer",
                                }}
                              />
                            </Tooltip>
                          </Stack>
                        </InputLabel>
                        <TextField
                          disabled={!isAccordionOneEditing}
                          placeholder="Award Name"
                          value={
                            language === "Ar"
                              ? awardData.nameAr
                              : awardData.nameEn
                          }
                          error={fieldErrors.awardName}
                          helperText={
                            fieldErrors.awardName
                              ? "Award name is required"
                              : ""
                          }
                          onChange={(e) => {
                            const fieldName =
                              language === "Ar" ? "nameAr" : "nameEn";
                            setAwardData((prev) => ({
                              ...prev,
                              [fieldName]: e.target.value,
                            }));
                          }}
                          sx={{
                            backgroundColor: "white",
                            width: "100%",
                            borderRadius: "12px",
                          }}
                        />
                      </Grid>
                      <Grid
                        sx={{
                          backgroundColor: "#FBFBFB",
                          p: 3,
                          borderRadius: "12px",
                          border: "1px solid #D5D8DD",
                        }}
                        size={12}
                      >
                        <InputLabel
                          sx={{ color: "black", mb: 2, fontSize: "24px" }}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <span>
                              {getLabelWithLanguage("Organizing Host/Sponsor")}
                            </span>
                            <Tooltip title="Enter the name of the organization or sponsor hosting the award.">
                              <InfoOutlinedIcon
                                sx={{
                                  fontSize: 20,
                                  color: "#888",
                                  cursor: "pointer",
                                }}
                              />
                            </Tooltip>
                          </Stack>
                        </InputLabel>

                        <FormControl
                          sx={{
                            width: "100%",
                            borderRadius: "12px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <Select
                            disabled={!isAccordionOneEditing}
                            name="organizingHost"
                            labelId="organizing-host-select"
                            value={awardData.organizingHost.id || ""}
                            onChange={handleChangeSelect}
                            error={fieldErrors.organizingHost}
                            displayEmpty
                            sx={{
                              height: 40,
                              padding: "6px 8px",
                              borderRadius: "12px",
                              backgroundColor: "white",
                              width: "100%",
                            }}
                            inputProps={{ "aria-label": "Without label" }}
                          >
                            <MenuItem disabled value="">
                              <em>Select Sponsor</em>
                            </MenuItem>
                            {sponsors.map((item) => (
                              <MenuItem key={item.id} value={item.id}>
                                {language === "En" ? item.nameEn : item.nameAr}
                              </MenuItem>
                            ))}
                          </Select>
                          {fieldErrors.organizingHost && (
                            <Typography color="error" variant="caption">
                              Organizing Host is required
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid
                        sx={{
                          backgroundColor: "#FBFBFB",
                          p: 3,
                          borderRadius: "12px",
                          border: "1px solid #D5D8DD",
                        }}
                        size={12}
                      >
                        <InputLabel
                          sx={{ color: "black", mb: 2, fontSize: "24px" }}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <span>
                              {getLabelWithLanguage("Targeted Audience")}
                            </span>
                            <Tooltip title="Specify who this award is intended for (e.g., students, professionals, etc.)">
                              <InfoOutlinedIcon
                                sx={{
                                  fontSize: 20,
                                  color: "#888",
                                  cursor: "pointer",
                                }}
                              />
                            </Tooltip>
                          </Stack>
                        </InputLabel>

                        <FormControl
                          sx={{
                            width: "100%",
                            borderRadius: "12px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <Select
                            disabled={!isAccordionOneEditing}
                            name="targetedAudience"
                            error={fieldErrors.targetedAudience}
                            labelId="audience-select"
                            value={awardData.targetedAudience?.id || ""}
                            onChange={handleChangeSelect}
                            displayEmpty
                            sx={{
                              height: 40,
                              padding: "6px 8px",
                              borderRadius: "12px",
                              backgroundColor: "white",
                              width: "100%",
                            }}
                            inputProps={{ "aria-label": "Without label" }}
                          >
                            <MenuItem disabled value="">
                              <em>Select Targeted Audience</em>
                            </MenuItem>
                            {audience.map((item) => (
                              <MenuItem key={item.id} value={item.id}>
                                {language === "En"
                                  ? item.targetEn
                                  : item.targetAr}
                              </MenuItem>
                            ))}
                          </Select>
                          {fieldErrors.targetedAudience && (
                            <Typography color="error" variant="caption">
                              Targeted Audience is required
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid
                        sx={{
                          backgroundColor: "#FBFBFB",
                          p: 3,
                          borderRadius: "12px",
                          border: "1px solid #D5D8DD",
                        }}
                        size={12}
                      >
                        <InputLabel
                          sx={{ color: "black", mb: 2, fontSize: "24px" }}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <span>
                              {getLabelWithLanguage("Award Categories")}
                            </span>
                            <Tooltip title="Define the different types or groups this award will be categorized into.">
                              <InfoOutlinedIcon
                                sx={{
                                  fontSize: 20,
                                  color: "#888",
                                  cursor: "pointer",
                                }}
                              />
                            </Tooltip>
                          </Stack>
                        </InputLabel>

                        <FormControl
                          sx={{
                            width: "100%",
                            borderRadius: "12px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <Select
                            multiple
                            disabled={!isAccordionOneEditing}
                            name="categoriesIds"
                            labelId="categories-select"
                            onChange={handleChangeSelect}
                            error={fieldErrors.categoriesIds}
                            displayEmpty
                            value={awardData.categoriesIds || []} // ✅ FIXED
                            sx={{
                              height: 40,
                              padding: "6px 8px",
                              borderRadius: "12px",
                              backgroundColor: "white",
                              width: "100%",
                            }}
                            inputProps={{ "aria-label": "Without label" }}
                            renderValue={(selected) => {
                              if (selected.length === 0)
                                return <em>Select Categories</em>;
                              return categories
                                .filter((c) => selected.includes(c.id))
                                .map((c) =>
                                  language === "En" ? c.nameEn : c.nameAr
                                )
                                .join(", ");
                            }}
                          >
                            <MenuItem disabled value="">
                              <em>Select Categories</em>
                            </MenuItem>
                            {categories.map((category) => (
                              <MenuItem key={category.id} value={category.id}>
                                <Checkbox
                                  checked={(
                                    awardData.categoriesIds || []
                                  ).includes(category.id)}
                                />
                                <ListItemText
                                  primary={
                                    language === "En"
                                      ? category.nameEn
                                      : category.nameAr
                                  }
                                />
                              </MenuItem>
                            ))}
                          </Select>

                          {fieldErrors.categoriesIds && (
                            <Typography color="error" variant="caption">
                              Categories are required
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid
                        sx={{
                          backgroundColor: "#FBFBFB",
                          p: 3,
                          borderRadius: "12px",
                          border: "1px solid #D5D8DD",
                        }}
                        size={12}
                      >
                        <InputLabel
                          sx={{ color: "black", mb: 2, fontSize: "24px" }}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <span>
                              {getLabelWithLanguage("About The Award")}
                            </span>
                            <Tooltip title="Provide a description or background about the award.">
                              <InfoOutlinedIcon
                                sx={{
                                  fontSize: 20,
                                  color: "#888",
                                  cursor: "pointer",
                                }}
                              />
                            </Tooltip>
                          </Stack>
                        </InputLabel>

                        <TextField
                          disabled={!isAccordionOneEditing}
                          error={fieldErrors.aboutAward}
                          helperText={
                            fieldErrors.aboutAward
                              ? "About the award is required"
                              : ""
                          }
                          placeholder="About The Award"
                          value={
                            language === "En"
                              ? awardData.objectiveEn
                              : awardData.objectiveAr
                          }
                          onChange={(e) => {
                            const fieldName =
                              language === "Ar" ? "objectiveAr" : "objectiveEn";
                            setAwardData((prev) => ({
                              ...prev,
                              [fieldName]: e.target.value,
                            }));
                          }}
                          multiline
                          rows={8}
                          sx={{
                            backgroundColor: "white",
                            width: "100%",
                            borderRadius: "12px",
                          }}
                        />
                      </Grid>
                    </Grid>
                    {isAccordionOneEditing && (
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{ pt: 2, justifyContent: "center" }}
                      >
                        <Button
                          onClick={() => {
                            setIsAccordionOneEditing(false);
                            setFieldErrors({
                              awardName: false,
                              organizingHost: false,
                              targetedAudience: false,
                              categoriesIds: false,
                              aboutAward: false,
                            });
                            setAwardData({
                              nameEn: "",
                              nameAr: "",
                              objectiveEn: "",
                              objectiveAr: "",
                              logoEn: "",
                              logoAr: "",
                              organizingHost: "",
                              targetedAudience: "",
                              categoriesIds: [],
                              aboutAward: "",
                              logo: null,
                            });
                            setPreviewUrl(null);
                            setExpanded(false);
                          }}
                          sx={{
                            backgroundColor: "#D9D9D9",
                            color: "black",
                            textTransform: "none",
                            borderRadius: "8px",
                            width: "150px",
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            const currentFieldErrors =
                              validateFields(awardData);
                            console.log(
                              "currentFieldErrors",
                              currentFieldErrors
                            );

                            const hasErrors = Object.values(
                              currentFieldErrors
                            ).some((error) => error);

                            if (!hasErrors) {
                              console.log("Calling handleSave");

                              handleSave();
                              setIsAccordionOneEditing(false);
                            } else {
                              return;
                            }
                          }}
                          sx={{
                            backgroundColor: " #721F31",
                            color: "white",
                            textTransform: "none",
                            borderRadius: "8px",
                            width: "300px",
                          }}
                        >
                          Save
                        </Button>
                      </Stack>
                    )}
                  </AccordionDetails>
                </Accordion>
                <Accordion
                  expanded={expanded === "panel2"}
                  onChange={handleChange("panel2")}
                  sx={{
                    width: "100%",
                    borderRadius: "8px",
                    [`& .${accordionSummaryClasses.root}`]: {
                      minHeight: expanded === "panel2" ? "64px" : "80px",
                    },
                    [`& .${accordionSummaryClasses.content}`]: {
                      margin: 0,
                    },
                    [`& .${accordionDetailsClasses.root}`]: {
                      display: expanded === "panel2" ? "block" : "none",
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                    sx={{ width: "100%" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "1.2rem",
                        }}
                      >
                        Prize
                      </Typography>

                      {expanded === "panel2" && (
                        <Box sx={{ marginRight: "40px" }}>
                          {!isAccordiontwoEditing ? (
                            <a
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsAccordionTwoEditing(true);
                              }}
                              style={{
                                color: "#5CB4FF",
                                textDecoration: "none",
                              }}
                            >
                              Edit
                            </a>
                          ) : (
                            <Tooltip title="Details about the prize structure">
                              <InfoOutlinedIcon
                                sx={{
                                  fontSize: 20,
                                  color: "#888",
                                  cursor: "default",
                                }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      )}
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Grid
                      container
                      direction="column"
                      rowSpacing={2}
                      sx={{
                        width: "100%",
                        justifyContent: "center",
                        alignItems: "stretch",
                        borderRadius: "12px",
                        pt: 2,
                        pointerEvents: isAccordiontwoEditing ? "auto" : "none",
                        opacity: isAccordiontwoEditing ? 1 : 0.6,
                      }}
                    >
                      <Grid
                        sx={{
                          width: "100%",
                          backgroundColor: "#FBFBFB",
                          p: 3,
                          borderRadius: "12px",
                          border: "1px solid #D5D8DD",
                        }}
                        size={12}
                      >
                        {Array.isArray(prizes) && prizes.length > 0
                          ? prizes.map((prize, index) => (
                              <Box key={index}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    mb: 2,
                                  }}
                                >
                                  <InputLabel
                                    sx={{ color: "black", fontSize: "24px" }}
                                  >
                                    {language === "En"
                                      ? prize.rankEn
                                      : prize.rankAr}
                                  </InputLabel>
                                  {index >= 1 && (
                                    <DeleteIcon
                                      onClick={() =>
                                        handleDeletePrize(index, prize.id)
                                      }
                                      sx={{
                                        cursor: "pointer",
                                        color: "#721F31",
                                      }}
                                    />
                                  )}
                                </Box>
                                <TextField
                                  disabled={!isAccordiontwoEditing}
                                  required
                                  placeholder="Enter value"
                                  value={prize.value}
                                  onChange={(e) => {
                                    const newValue = parseFloat(e.target.value); // Ensure it's a number

                                    setPrizes((prevPrizes) => {
                                      const updatedPrizes = [...prevPrizes];
                                      if (updatedPrizes[index]) {
                                        updatedPrizes[index].value = isNaN(
                                          newValue
                                        )
                                          ? 0
                                          : newValue; // Fallback to 0 if invalid input
                                      }
                                      return updatedPrizes;
                                    });
                                  }}
                                  error={prizeErrors.includes(prize.rankEn)}
                                  helperText={
                                    prizeErrors.includes(prize.rankEn)
                                      ? `${prize.rankEn} is required`
                                      : ""
                                  }
                                  InputProps={{
                                    sx: {
                                      height: "40px",
                                      "& input": {
                                        height: "40px",
                                        padding: "0 14px",
                                      },
                                    },
                                  }}
                                  sx={{
                                    width: "100%",
                                    borderRadius: "12px",
                                    mb: 3,
                                    backgroundColor: "white",
                                  }}
                                  inputProps={{
                                    onKeyPress: (e) => {
                                      if (!/[0-9]/.test(e.key)) {
                                        e.preventDefault();
                                      }
                                    },
                                  }}
                                />
                              </Box>
                            ))
                          : [
                              {
                                label:
                                  language === "En" ? "Prize 1" : "الجوائز 1",
                                value: "",
                              },
                            ].map((prize, index) => (
                              <Box key={index}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    mb: 2,
                                  }}
                                >
                                  <InputLabel
                                    sx={{ color: "black", fontSize: "24px" }}
                                  >
                                    {prize.label}
                                  </InputLabel>
                                </Box>
                                <TextField
                                  disabled={!isAccordiontwoEditing}
                                  required
                                  placeholder="Enter value"
                                  value={prize.value}
                                  onChange={(e) => {
                                    setPrizes((prevPrizes) => {
                                      // Create a new array copy to maintain immutability
                                      const updatedPrizes = [...prevPrizes];
                                      // Update the value at the current index
                                      updatedPrizes[index].value =
                                        e.target.value;
                                      return updatedPrizes;
                                    });
                                  }}
                                  error={prizeErrors.includes(prize.label)}
                                  helperText={
                                    prizeErrors.includes(prize.label)
                                      ? `${prize.label} is required`
                                      : ""
                                  }
                                  InputProps={{
                                    sx: {
                                      height: "40px",
                                      "& input": {
                                        height: "40px",
                                        padding: "0 14px",
                                      },
                                    },
                                  }}
                                  sx={{
                                    width: "100%",
                                    borderRadius: "12px",
                                    mb: 3,
                                    backgroundColor: "white",
                                  }}
                                  inputProps={{
                                    onKeyPress: (e) => {
                                      if (!/[0-9]/.test(e.key)) {
                                        e.preventDefault();
                                      }
                                    },
                                  }}
                                />
                              </Box>
                            ))}

                        <Stack
                          direction="row"
                          alignItems="flex-end"
                          sx={{
                            display: "flex",
                            alignItems: "flex-end",
                            justifyContent: "flex-end",
                            m: 3,
                          }}
                        >
                          {isAccordiontwoEditing && (
                            <Button
                              onClick={() => {
                                const newLabel = `Prize ${prizes.length - 2 + 2}`;
                                setPrizes((prevPrizes) => {
                                  const currentPrizes = Array.isArray(
                                    prevPrizes
                                  )
                                    ? prevPrizes
                                    : [];
                                  return [
                                    ...currentPrizes,
                                    {
                                      rankEn: `Prize ${currentPrizes.length + 1}`,
                                      value: "",
                                    },
                                  ];
                                });
                              }}
                              sx={{
                                backgroundColor: "#721F31",
                                minWidth: "45px",
                                minHeight: "30px",
                              }}
                            >
                              <AddIcon sx={{ color: "white" }} />
                            </Button>
                          )}
                        </Stack>
                      </Grid>
                      {isAccordiontwoEditing && (
                        <Stack
                          direction="row"
                          spacing={2}
                          sx={{
                            pt: 2,
                            justifyContent: "center",
                            width: "100%",
                          }}
                        >
                          <Button
                            onClick={() => {
                              setIsAccordionTwoEditing(false);
                              setPrizeErrors([]);
                              setExpanded(false);
                            }}
                            sx={{
                              backgroundColor: "#D9D9D9",
                              color: "black",
                              textTransform: "none",
                              borderRadius: "8px",
                              width: "150px",
                            }}
                          >
                            cancel
                          </Button>
                          <Button
                            onClick={() => {
                              console.log("Save button clicked");
                              console.log("Current prizes state:", prizes);

                              const missingFields = prizes
                                .map((prize) => {
                                  const isMissing = prize.value === 0;
                                  if (isMissing) {
                                    console.log(
                                      `Prize with rank "${prize.rankEn}" has a value of 0`
                                    );
                                  }
                                  return isMissing ? prize.rankEn : null;
                                })
                                .filter((rankEn) => rankEn !== null);

                              if (missingFields.length > 0) {
                                console.log(
                                  "Missing fields detected:",
                                  missingFields
                                );
                                setPrizeErrors(missingFields);
                                return;
                              }

                              console.log(
                                "No missing fields, proceeding to save prizes..."
                              );
                              savePrizes();
                            }}
                            sx={{
                              backgroundColor: " #721F31",
                              color: "white",
                              textTransform: "none",
                              borderRadius: "8px",
                              width: "300px",
                            }}
                          >
                            Save
                          </Button>
                        </Stack>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
                <Accordion
                  expanded={expanded === "panel3"}
                  onChange={handleChange("panel3")}
                  sx={{
                    width: "100%",
                    borderRadius: "8px",
                    [`& .${accordionSummaryClasses.root}`]: {
                      minHeight: expanded === "panel3" ? "64px" : "80px",
                    },
                    [`& .${accordionSummaryClasses.content}`]: {
                      margin: 0,
                    },
                    [`& .${accordionDetailsClasses.root}`]: {
                      display: expanded === "panel3" ? "block" : "none",
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                    sx={{
                      width: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "1.2rem",
                        }}
                      >
                        TimeLine
                      </Typography>
                      {expanded === "panel3" && !isAccordionThreeEditing && (
                        <Box sx={{ marginRight: "40px" }}>
                          <a
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsAccordionThreeEditing(true);
                            }}
                            style={{
                              color: "#5CB4FF",
                              textDecoration: "none",
                            }}
                          >
                            Edit
                          </a>
                        </Box>
                      )}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid
                      container
                      direction="column"
                      columnSpacing={5}
                      spacing={5}
                      sx={{
                        justifyContent: "center",
                        alignItems: "stretch",
                        borderRadius: "12px",
                        pt: 2,
                      }}
                    >
                      <Grid
                        size={12}
                        sx={{
                          backgroundColor: "#FBFBFB",
                          pt: 5,
                          pb: 5,
                          pl: 3,
                          pr: 3,
                          borderRadius: "12px",
                          border: "1px solid #D5D8DD",
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            variant="h6"
                            sx={{ mb: 2, fontWeight: "bold" }}
                          >
                            Milestones
                          </Typography>
                          <Tooltip title="Add important Milestones or steps related to this award.">
                            <InfoOutlinedIcon
                              sx={{
                                fontSize: 20,
                                color: "#888",
                                cursor: "default",
                              }}
                            />
                          </Tooltip>
                        </Stack>
                        {timelineEntries.filter((entry) => entry.type === "002")
                          .length === 0 ? (
                          <Typography
                            variant="body2"
                            sx={{
                              backgroundColor: "#FBFBFB",
                              padding: 3,
                              borderRadius: "12px",
                              border: "1px solid #D5D8DD",
                              textAlign: "center",
                              mb: 3,
                              color: "#888",
                            }}
                          >
                            Please press the add button to add an entry.
                          </Typography>
                        ) : (
                          timelineEntries
                            .map((entry, originalIndex) => ({
                              entry,
                              originalIndex,
                            }))
                            .filter(({ entry }) => entry.type === "002")
                            .map(({ entry, originalIndex }) => (
                              <React.Fragment key={originalIndex}>
                                <Grid
                                  container
                                  direction="column"
                                  spacing={3}
                                  size={12}
                                  sx={{
                                    backgroundColor: "#FBFBFB",
                                    padding: 3,
                                    borderRadius: "12px",
                                    border: "1px solid #D5D8DD",
                                    position: "relative",
                                    mb: 3,
                                  }}
                                >
                                  <Grid size={4} sx={{ mb: 3 }}>
                                    <IconButton
                                      onClick={() =>
                                        handleDeleteEntry(originalIndex)
                                      }
                                      sx={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                        color: "#721F31",
                                      }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>

                                    <InputLabel sx={{ pl: 1 }}>
                                      {getLabelWithLanguage("Title")}
                                    </InputLabel>
                                    <FormControl
                                      fullWidth
                                      error={
                                        !!timelineErrors[originalIndex]
                                          ?.milestoneId
                                      }
                                    >
                                      <Select
                                        disabled={!isAccordionThreeEditing}
                                        value={entry.milestoneId}
                                        onChange={(e) =>
                                          handleChangeEntry(
                                            originalIndex,
                                            "002",
                                            "milestoneId",
                                            e.target.value
                                          )
                                        }
                                        displayEmpty
                                        sx={{
                                          height: 40,
                                          borderRadius: "10px",
                                          backgroundColor: "white",
                                        }}
                                      >
                                        <MenuItem value="" disabled>
                                          Select milestone
                                        </MenuItem>

                                        {milestones.map((milestone) => (
                                          <MenuItem
                                            key={milestone.id}
                                            value={milestone.id}
                                          >
                                            {language === "Ar"
                                              ? milestone.nameAr
                                              : milestone.nameEn}
                                          </MenuItem>
                                        ))}
                                      </Select>

                                      {timelineErrors[originalIndex]
                                        ?.milestoneId && (
                                        <Typography
                                          variant="caption"
                                          color="error"
                                          sx={{ ml: 1 }}
                                        >
                                          {
                                            timelineErrors[originalIndex]
                                              ?.milestoneId
                                          }
                                        </Typography>
                                      )}
                                    </FormControl>
                                  </Grid>
                                  <Grid size={4} sx={{ mb: 3 }}>
                                    <InputLabel sx={{ pl: 1 }}>Date</InputLabel>
                                    <DesktopDatePicker
                                      minDate={dayjs()}
                                      disabled={!isAccordionThreeEditing}
                                      value={
                                        dayjs(entry.date).isValid()
                                          ? dayjs(entry.date)
                                          : null
                                      }
                                      onChange={(newDate) =>
                                        handleChangeEntry(
                                          originalIndex,
                                          "002",
                                          "date",
                                          newDate
                                        )
                                      }
                                      slotProps={{
                                        textField: {
                                          fullWidth: true,
                                          error:
                                            !!timelineErrors[originalIndex]
                                              ?.date,
                                          helperText:
                                            timelineErrors[originalIndex]?.date,
                                          sx: {
                                            borderRadius: "12px",
                                            backgroundColor: "white",
                                          },
                                        },
                                      }}
                                    />
                                  </Grid>
                                </Grid>
                              </React.Fragment>
                            ))
                        )}
                        {isAccordionThreeEditing && (
                          <Stack
                            direction="row"
                            alignItems="flex-end"
                            sx={{
                              display: "flex",
                              alignItems: "flex-end",
                              justifyContent: "flex-end",
                              m: 3,
                            }}
                          >
                            <Button
                              onClick={() => handleAddEntry("002")}
                              sx={{
                                backgroundColor: "#721F31",
                                minWidth: "45px",
                                minHeight: "30px",
                              }}
                            >
                              <AddIcon sx={{ color: "white" }} />
                            </Button>
                          </Stack>
                        )}
                      </Grid>
                      <Grid
                        size={12}
                        sx={{
                          backgroundColor: "#FBFBFB",
                          pt: 5,
                          pb: 5,
                          pl: 3,
                          pr: 3,
                          borderRadius: "12px",
                          border: "1px solid #D5D8DD",
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            variant="h6"
                            sx={{ mb: 2, fontWeight: "bold" }}
                          >
                            Events
                          </Typography>
                          <Tooltip title="Add important Events or steps related to this award.">
                            <InfoOutlinedIcon
                              sx={{
                                fontSize: 20,
                                color: "#888",
                                cursor: "default",
                              }}
                            />
                          </Tooltip>
                        </Stack>
                        {timelineEntries.filter((entry) => entry.type === "001")
                          .length === 0 ? (
                          <Typography
                            variant="body2"
                            sx={{
                              backgroundColor: "#FBFBFB",
                              padding: 3,
                              borderRadius: "12px",
                              border: "1px solid #D5D8DD",
                              textAlign: "center",
                              mb: 3,
                              color: "#888",
                            }}
                          >
                            Please press the add button to add an entry.
                          </Typography>
                        ) : (
                          timelineEntries
                            .map((entry, originalIndex) => ({
                              entry,
                              originalIndex,
                            }))
                            .filter(({ entry }) => entry.type === "001")
                            .map(({ entry, originalIndex }) => (
                              <React.Fragment key={originalIndex}>
                                <Grid
                                  container
                                  direction="column"
                                  spacing={3}
                                  size={12}
                                  sx={{
                                    backgroundColor: "#FBFBFB",
                                    padding: 3,
                                    borderRadius: "12px",
                                    border: "1px solid #D5D8DD",
                                    position: "relative",
                                    mb: 3,
                                  }}
                                >
                                  <Grid size={4} sx={{ mb: 3 }}>
                                    <IconButton
                                      onClick={() =>
                                        handleDeleteEntry(originalIndex)
                                      }
                                      sx={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                        color: "#721F31",
                                      }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                    <InputLabel sx={{ pl: 1 }}>
                                      {getLabelWithLanguage("Event Name")}
                                    </InputLabel>
                                    <TextField
                                      disabled={!isAccordionThreeEditing}
                                      error={
                                        !!timelineErrors[originalIndex]?.title
                                      }
                                      helperText={
                                        timelineErrors[originalIndex]?.title
                                      }
                                      value={
                                        language === "En"
                                          ? entry.titleEn
                                          : entry.titleAr
                                      }
                                      onChange={(e) =>
                                        handleChangeEntry(
                                          originalIndex,
                                          "001",
                                          language === "En"
                                            ? "titleEn"
                                            : "titleAr", // Pass correct field name
                                          e.target.value
                                        )
                                      }
                                      fullWidth
                                      placeholder="Enter event name"
                                      sx={{
                                        backgroundColor: "white",
                                        borderRadius: "10px",
                                      }}
                                    />
                                  </Grid>
                                  <Grid size={4} sx={{ mb: 3 }}>
                                    <InputLabel sx={{ pl: 1 }}>Date</InputLabel>
                                    <DesktopDatePicker
                                      minDate={dayjs()}
                                      disabled={!isAccordionThreeEditing}
                                      value={
                                        dayjs(entry.date).isValid()
                                          ? dayjs(entry.date)
                                          : null
                                      }
                                      onChange={(newDate) =>
                                        handleChangeEntry(
                                          originalIndex,
                                          "001",
                                          "date",
                                          newDate
                                        )
                                      }
                                      slotProps={{
                                        textField: {
                                          fullWidth: true,
                                          error:
                                            !!timelineErrors[originalIndex]
                                              ?.date,
                                          helperText:
                                            timelineErrors[originalIndex]?.date,
                                          sx: {
                                            borderRadius: "12px",
                                            backgroundColor: "white",
                                          },
                                        },
                                      }}
                                    />
                                  </Grid>
                                  <Grid>
                                    <InputLabel sx={{ pl: 1 }}>Note</InputLabel>
                                    <TextField
                                      disabled={!isAccordionThreeEditing}
                                      error={
                                        !!timelineErrors[originalIndex]?.note
                                      }
                                      helperText={
                                        timelineErrors[originalIndex]?.note
                                      }
                                      value={
                                        language === "En"
                                          ? entry.NoteEn
                                          : entry.NoteAr
                                      }
                                      onChange={(e) =>
                                        handleChangeEntry(
                                          originalIndex,
                                          "001",
                                          language === "En"
                                            ? "NoteEn"
                                            : "NoteAr", // Pass correct field name
                                          e.target.value
                                        )
                                      }
                                      placeholder="note"
                                      multiline
                                      rows={3}
                                      sx={{
                                        backgroundColor: "white",
                                        width: "100%",
                                        borderRadius: "12px",
                                      }}
                                    />
                                  </Grid>
                                </Grid>
                              </React.Fragment>
                            ))
                        )}
                        {isAccordionThreeEditing && (
                          <Stack
                            direction="row"
                            alignItems="flex-end"
                            sx={{
                              display: "flex",
                              alignItems: "flex-end",
                              justifyContent: "flex-end",
                              m: 3,
                            }}
                          >
                            <Button
                              onClick={() => handleAddEntry("001")}
                              sx={{
                                backgroundColor: "#721F31",
                                minWidth: "45px",
                                minHeight: "30px",
                              }}
                            >
                              <AddIcon sx={{ color: "white" }} />
                            </Button>
                          </Stack>
                        )}
                      </Grid>
                    </Grid>
                    {isAccordionThreeEditing && (
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          pt: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                        }}
                      >
                        <Button
                          onClick={() => {
                            setIsAccordionThreeEditing(false);
                            setTimelineErrors({});
                            setExpanded(false);
                          }}
                          sx={{
                            backgroundColor: "#D9D9D9",
                            color: "black",
                            textTransform: "none",
                            borderRadius: "8px",
                            width: "150px",
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveTimeline}
                          sx={{
                            backgroundColor: " #721F31",
                            color: "white",
                            textTransform: "none",
                            borderRadius: "8px",
                            width: "300px",
                          }}
                        >
                          Save
                        </Button>
                      </Stack>
                    )}
                  </AccordionDetails>
                </Accordion>
                <Accordion
                  expanded={expanded === "panel4"}
                  onChange={handleChange("panel4")}
                  sx={{
                    width: "100%",
                    borderRadius: "8px",
                    [`& .${accordionSummaryClasses.root}`]: {
                      minHeight: expanded === "panel4" ? "64px" : "80px",
                    },
                    [`& .${accordionSummaryClasses.content}`]: {
                      margin: 0,
                    },
                    [`& .${accordionDetailsClasses.root}`]: {
                      display: expanded === "panel4" ? "block" : "none",
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                    sx={{
                      width: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "1.2rem",
                        }}
                      >
                        Judges Terms and conditions
                      </Typography>
                      {expanded === "panel4" && (
                        <Box sx={{ marginRight: "40px" }}>
                          {!isAccordionFourEditing ? (
                            <a
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsAccordionFourEditing(true);
                              }}
                              style={{
                                color: "#5CB4FF",
                                textDecoration: "none",
                              }}
                            >
                              Edit
                            </a>
                          ) : (
                            <Tooltip title="Edit Judges Terms and Conditions">
                              <InfoOutlinedIcon
                                sx={{
                                  fontSize: 20,
                                  color: "#888",
                                  cursor: "default",
                                }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      )}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid
                      container
                      direction="column"
                      rowSpacing={2}
                      sx={{
                        justifyContent: "center",
                        alignItems: "stretch",
                        borderRadius: "12px",
                        pt: 2,
                        opacity: isAccordionFourEditing ? 1 : 0.6,
                      }}
                    >
                      <Grid
                        sx={{
                          backgroundColor: "#FBFBFB",
                          p: 5,
                          borderRadius: "12px",
                          border: "1px solid #D5D8DD",
                        }}
                        size={12}
                      >
                        <Box
                          sx={{
                            pb: 2,
                            display: "center",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "red",
                          }}
                        ></Box>
                        {Judgeterms?.map((term, index) => {
                          const termValue =
                            language === "Ar" ? term.ruleAr : term.ruleEn;

                          return (
                            <Box
                              key={index}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 2,
                              }}
                            >
                              <InputLabel
                                sx={{
                                  color: "black",
                                  fontSize: "24px",
                                  minWidth: "30px",
                                }}
                              >
                                {index + 1}
                              </InputLabel>
                              <TextField
                                disabled={!isAccordionFourEditing}
                                error={!!judgeTermseErrors[index]}
                                helperText={judgeTermseErrors[index]}
                                value={termValue || ""}
                                onChange={(e) =>
                                  handleTermChange(index, e.target.value)
                                }
                                placeholder="Terms And Conditions"
                                fullWidth
                                sx={{
                                  backgroundColor: "white",
                                  borderRadius: "12px",
                                }}
                                InputProps={{
                                  sx: {
                                    height: "40px",
                                    "& input": {
                                      height: "40px",
                                      padding: "0 14px",
                                    },
                                  },
                                }}
                              />
                              {index !== 0 && (
                                <IconButton
                                  aria-label="delete"
                                  onClick={() =>
                                    handleDeleteTerm(index, term.id)
                                  }
                                  sx={{ marginLeft: 1, color: "#721F31" }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              )}
                            </Box>
                          );
                        })}

                        <Stack
                          direction="row"
                          alignItems="flex-end"
                          sx={{
                            display: "flex",
                            alignItems: "flex-end",
                            justifyContent: "flex-end",
                            m: 3,
                          }}
                        >
                          {isAccordionFourEditing && (
                            <Button
                              onClick={handleAddField}
                              sx={{
                                backgroundColor: "#721F31",
                                minWidth: "45px",
                                minHeight: "30px",
                              }}
                            >
                              <AddIcon sx={{ color: "white" }} />
                            </Button>
                          )}
                        </Stack>
                      </Grid>
                      {isAccordionFourEditing && (
                        <Stack
                          direction="row"
                          spacing={2}
                          sx={{
                            pt: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                          }}
                        >
                          <Button
                            onClick={() => {
                              setIsAccordionFourEditing(false);
                              setJudgeTermsErrors([]);
                              setExpanded(false);
                            }}
                            sx={{
                              backgroundColor: "#D9D9D9",
                              color: "black",
                              textTransform: "none",
                              borderRadius: "8px",
                              width: "150px",
                            }}
                          >
                            cancel
                          </Button>
                          <Button
                            onClick={handleSaveJudgeTerms}
                            sx={{
                              backgroundColor: " #721F31",
                              color: "white",
                              textTransform: "none",
                              borderRadius: "8px",
                              width: "300px",
                            }}
                          >
                            Save
                          </Button>
                        </Stack>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
                <Accordion
                  expanded={expanded === "panel5"}
                  onChange={handleChange("panel5")}
                  sx={{
                    width: "100%",
                    borderRadius: "8px",
                    [`& .${accordionSummaryClasses.root}`]: {
                      minHeight: expanded === "panel5" ? "64px" : "80px",
                    },
                    [`& .${accordionSummaryClasses.content}`]: {
                      margin: 0,
                    },
                    [`& .${accordionDetailsClasses.root}`]: {
                      display: expanded === "panel5" ? "block" : "none",
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                    sx={{
                      width: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "1.2rem",
                        }}
                      >
                        Applicant Terms and conditions{" "}
                      </Typography>
                      {expanded === "panel5" && (
                        <Box sx={{ marginRight: "40px" }}>
                          {!isAccordionFiveEditing ? (
                            <a
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsAccordionFiveEditing(true);
                              }}
                              style={{
                                color: "#5CB4FF",
                                textDecoration: "none",
                              }}
                            >
                              Edit
                            </a>
                          ) : (
                            <Tooltip title="Edit applicant Terms and Conditions">
                              <InfoOutlinedIcon
                                sx={{
                                  fontSize: 20,
                                  color: "#888",
                                  cursor: "default",
                                }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      )}
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Grid
                      container
                      direction="column"
                      rowSpacing={2}
                      sx={{
                        justifyContent: "center",
                        alignItems: "stretch",
                        borderRadius: "12px",
                        pt: 2,
                      }}
                    >
                      <Grid
                        sx={{
                          backgroundColor: "#FBFBFB",
                          p: 3,
                          borderRadius: "12px",
                          border: "1px solid #D5D8DD",
                        }}
                        size={12}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ width: "100%", mb: 5, mt: 4 }}
                        >
                          <Box sx={{ width: "100%", ml: 3 }}>
                            <InputLabel
                              sx={{
                                pl: 1,
                                fontWeight: 700,
                                fontSize: "24px",
                                lineHeight: "111%",
                                letterSpacing: "4.5%",
                                color: " #721F31",
                                mb: 2,
                              }}
                            >
                              Applicant Type{" "}
                            </InputLabel>
                            <FormControl
                              sx={{
                                maxWidth: 390,
                                height: "auto",
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                              }}
                            >
                              <Select
                                disabled={!isAccordionFiveEditing}
                                labelId="applicant-type-select-label"
                                value={applicantSettings.teamType || "001"}
                                onChange={(e) =>
                                  setApplicantSettings({
                                    ...applicantSettings,
                                    teamType: e.target.value,
                                  })
                                }
                                displayEmpty
                                sx={{
                                  height: 40,
                                  padding: "6px 8px",
                                  borderRadius: "8px",
                                  backgroundColor: "white",
                                }}
                                inputProps={{ "aria-label": "Without label" }}
                              >
                                <MenuItem value="001">Individual</MenuItem>
                                <MenuItem value="002">Team</MenuItem>
                              </Select>
                            </FormControl>
                          </Box>
                          {applicantSettings.teamType === "002" && (
                            <Box>
                              <InputLabel
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "24px",
                                  lineHeight: "111%",
                                  color: "#721F31",
                                  mb: 2,
                                }}
                                id="team-size-label"
                              >
                                Number of Team
                              </InputLabel>

                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 4,
                                  alignItems: "center",
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <InputLabel id="min-team-label">
                                    Min
                                  </InputLabel>
                                  <FormControl sx={{ minWidth: 90 }}>
                                    <TextField
                                      disabled={!isAccordionFiveEditing}
                                      id="standard-number"
                                      type="number"
                                      value={applicantSettings.teamMin || ""}
                                      onChange={(e) =>
                                        setApplicantSettings((prev) => ({
                                          ...prev,
                                          teamMin: Number(e.target.value) || 0,
                                        }))
                                      }
                                      slotProps={{
                                        inputLabel: {
                                          shrink: true,
                                        },
                                      }}
                                      sx={{
                                        backgroundColor: "white",
                                        borderRadius: "12px",
                                      }}
                                      InputProps={{
                                        sx: {
                                          width: "90px",
                                          height: "40px",
                                          "& input": {
                                            height: "40px",
                                            padding: "0 14px",
                                          },
                                        },
                                      }}
                                    />
                                  </FormControl>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <InputLabel id="max-team-label">
                                    Max
                                  </InputLabel>
                                  <FormControl sx={{ minWidth: 90 }}>
                                    <TextField
                                      disabled={!isAccordionFiveEditing}
                                      id="standard-number"
                                      type="number"
                                      value={applicantSettings.teamMax || ""}
                                      onChange={(e) =>
                                        setApplicantSettings((prev) => ({
                                          ...prev,
                                          teamMax: Number(e.target.value) || 0,
                                        }))
                                      }
                                      sx={{
                                        backgroundColor: "white",
                                        borderRadius: "12px",
                                      }}
                                      InputProps={{
                                        sx: {
                                          width: "90px",
                                          height: "40px",
                                          "& input": {
                                            height: "40px",
                                            padding: "0 14px",
                                          },
                                        },
                                      }}
                                    />
                                  </FormControl>
                                </Box>
                              </Box>
                            </Box>
                          )}
                        </Stack>
                        <Box sx={{ pb: 2 }}> {getLabelWithLanguage("")}</Box>

                        {applicantSettings.applicantRules?.map(
                          (term, index) => {
                            return (
                              <Box
                                key={index}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mb: 2,
                                }}
                              >
                                <InputLabel
                                  sx={{
                                    color: "black",
                                    fontSize: "24px",
                                    minWidth: "30px",
                                  }}
                                >
                                  {index + 1}
                                </InputLabel>
                                <TextField
                                  disabled={!isAccordionFiveEditing}
                                  error={!!applicantTermseErrors[index]}
                                  helperText={applicantTermseErrors[index]}
                                  value={
                                    language === "En"
                                      ? term.ruleEn
                                      : term.ruleAr
                                  }
                                  onChange={(e) =>
                                    handleApplicantTermChange(
                                      index,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Terms And Conditions"
                                  fullWidth
                                  sx={{
                                    backgroundColor: "white",
                                    borderRadius: "12px",
                                  }}
                                  InputProps={{
                                    sx: {
                                      height: "40px",
                                      "& input": {
                                        height: "40px",
                                        padding: "0 14px",
                                      },
                                    },
                                  }}
                                />
                                {index !== 0 && (
                                  <IconButton
                                    aria-label="delete"
                                    onClick={() =>
                                      handleDeleteApplicantTerm(index, term.id)
                                    }
                                    sx={{ marginLeft: 1, color: "#721F31" }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                )}
                              </Box>
                            );
                          }
                        )}

                        <Stack
                          direction="row"
                          alignItems="flex-end"
                          sx={{
                            display: "flex",
                            alignItems: "flex-end",
                            justifyContent: "flex-end",
                            m: 3,
                          }}
                        >
                          {isAccordionFiveEditing && (
                            <Button
                              onClick={handleAddApplicantField}
                              sx={{
                                backgroundColor: "#721F31",
                                minWidth: "45px",
                                minHeight: "30px",
                              }}
                            >
                              <AddIcon sx={{ color: "white" }} />
                            </Button>
                          )}
                        </Stack>
                      </Grid>
                      {isAccordionFiveEditing && (
                        <Stack
                          direction="row"
                          spacing={2}
                          sx={{
                            pt: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                          }}
                        >
                          <Button
                            onClick={() => {
                              setIsAccordionFiveEditing(false);
                              setApplicantTermsErrors([]);
                              setExpanded(false);
                            }}
                            sx={{
                              backgroundColor: "#D9D9D9",
                              color: "black",
                              textTransform: "none",
                              borderRadius: "8px",
                              width: "150px",
                            }}
                          >
                            cancel
                          </Button>
                          <Button
                            onClick={handleSaveApplicantTerms}
                            sx={{
                              backgroundColor: " #721F31",
                              color: "white",
                              textTransform: "none",
                              borderRadius: "8px",
                              width: "300px",
                            }}
                          >
                            Save
                          </Button>
                        </Stack>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </>
            ) : (
              <RatingCriteriaProvider>
                <RatingCriteria language={language} awardId={award?.id} />
              </RatingCriteriaProvider>
            )}
          </Box>
        </Box>
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            display: "flex",
            justifyContent: "right",
            zIndex: 100,
            paddingBottom: 3,
          }}
        >
          <Button
            sx={{
              color: "white",
              backgroundColor: isButtonDisabled ? "#D3D3D3" : "#3DAF75",
              borderRadius: "12px",
              width: { xs: "50%", sm: "200px", md: "160px" },
              height: "50px",
              pointerEvents: isButtonDisabled ? "none" : "auto",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            }}
            disabled={isButtonDisabled}
          >
            <Typography
              sx={{
                fontWeight: "600",
                fontSize: { xs: "16px", md: "18px" },
                textTransform: "none",
              }}
            >
              Publish
            </Typography>
          </Button>
        </Box>
      </LocalizationProvider>
    </AdminLayout>
  );
}
