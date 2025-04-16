import {
  Accordion,
  AccordionDetails,
  accordionDetailsClasses,
  AccordionSummary,
  accordionSummaryClasses,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import React, { useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";
import { useRatingCriteria } from "../../context/RatingCriteriaContext";
import ApiDialog from "../../components/dialog";
import axiosInstance from "../../utils/axios";
import { Weight } from "lucide-react";

export default function FactorAccordion({
  accordion,
  index,
  language,
  expandedPanel,
  handleChange,
  setAccordions,
  accordions,
  setExpandedPanel,
  awardId,
}) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogTitle, setDialogTitle] = useState("");
  const [type, setType] = useState("");

  const getLabelWithLanguage = (label: string) => {
    return language === "Ar" ? `${label} (Arabic)` : `${label} (English)`;
  };

  console.log("accordions", accordion);
  const startEditing = () => {
    const updatedAccordions = [...accordions];
    updatedAccordions[index].isAccordionEditing = true;
    updatedAccordions[index].tempEditData = {
      ...updatedAccordions[index].factorData,
      questioners: JSON.parse(
        JSON.stringify(updatedAccordions[index].questioners || [])
      ),
    };
    setAccordions(updatedAccordions);
  };

  const cancelEditing = () => {
    if (!accordions[index].factorData.id) {
      setAccordions((prev) => prev.filter((_, i) => i !== index));
    } else {
      const updatedAccordions = [...accordions];
      delete updatedAccordions[index].tempEditData;
      updatedAccordions[index].isAccordionEditing = false;
      setAccordions(updatedAccordions);
    }
    handleChange(null)();
  };
  const resetFieldErrors = (index) => {
    setAccordions((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        fieldErrors: {
          factorName: false,
          factorDescription: false,
          relativeweight: false,
          questionerType: false,
          questions: [],
        },
      };
      return updated;
    });
  };

  const validateFields = (data) => {
    console.log("data", data);
    const isEmpty = (value) =>
      value === null || value === undefined || value === "";

    // Improved check for numeric values
    const isInvalidNumber = (value) => {
      if (isEmpty(value)) return true;
      const num = Number(value);
      return isNaN(num) || !isFinite(num);
    };

    const errors = {
      factorName: isEmpty(data.factorName),
      factorDescription: isEmpty(data.factorDescription),
      relativeweight: isInvalidNumber(data.relativeweight),
      questionerType: false,
      questions: [],
    };

    if (data.questioners?.length > 0) {
      errors.questions = data.questioners.map((q) => {
        const questionErrors = {
          question: isEmpty(q.question),
          weight: isInvalidNumber(q.weight),
          answers: [],
        };

        if (q.type === "002" || q.type === "003") {
          const expectedAnswerCount = q.type === "002" ? 3 : 5;

          if (!q.answers || q.answers.length < expectedAnswerCount) {
            questionErrors.answers = Array(expectedAnswerCount).fill({
              answer: true,
              weight: true,
              error: "All answers must be completed",
            });
          } else {
            questionErrors.answers = q.answers.map((a) => {
              // Get the answer from either text or answer field
              const answerText = a.answer || a.text || "";
              return {
                answer: isEmpty(answerText),
                weight: isInvalidNumber(a.weight),
              };
            });
          }
        } else if (q.type === "001") {
          // For Yes/No questions
          questionErrors.answers = [];

          if (!q.answers || q.answers.length < 2) {
            questionErrors.answers = [
              { weight: true, error: "Yes weight is required" },
              { weight: true, error: "No weight is required" },
            ];
          } else {
            questionErrors.answers = [
              {
                weight:
                  q.answers[0]?.weight === undefined ||
                  q.answers[0]?.weight === null ||
                  q.answers[0]?.weight === "" ||
                  isNaN(Number(q.answers[0]?.weight)),
              },
              {
                weight:
                  q.answers[1]?.weight === undefined ||
                  q.answers[1]?.weight === null ||
                  q.answers[1]?.weight === "" ||
                  isNaN(Number(q.answers[1]?.weight)),
              },
            ];
          }
        } else if (q.type === "004") {
          const answerErrors = q.answers.map((answer) => {
            // Convert values to numbers consistently
            const scaleMin =
              answer.scaleMin !== undefined ? Number(answer.scaleMin) : null;
            const scaleMax =
              answer.scaleMax !== undefined ? Number(answer.scaleMax) : null;
            const scaleJump =
              answer.scaleJump !== undefined ? Number(answer.scaleJump) : null;

            return {
              scaleMin:
                isEmpty(answer.scaleMin) || isNaN(scaleMin) || scaleMin < 0,
              scaleMax:
                isEmpty(answer.scaleMax) ||
                isNaN(scaleMax) ||
                (scaleMin !== null &&
                  scaleMax !== null &&
                  scaleMax <= scaleMin),
              scaleJump:
                isEmpty(answer.scaleJump) || isNaN(scaleJump) || scaleJump <= 0,
              scaleNotes: false,
            };
          });

          questionErrors.answers = answerErrors;
        }

        return questionErrors;
      });
    } else {
      errors.questions = [{ error: "At least one question is required" }];
    }

    // Update state
    setAccordions((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        fieldErrors: {
          ...errors,
          hasQuestionErrors: errors.questions.some(
            (q) =>
              q.error ||
              q.question ||
              q.weight ||
              q.answers?.some((a) => Object.values(a).some(Boolean))
          ),
          showErrors: true,
        },
      };
      return updated;
    });

    return (
      !errors.factorName &&
      !errors.factorDescription &&
      !errors.relativeweight &&
      !errors.questions.some(
        (q) =>
          q.error ||
          q.question ||
          q.weight ||
          q.answers?.some((a) => Object.values(a).some(Boolean))
      )
    );
  };
  useEffect(() => {
    if (accordion.isAccordionEditing) {
      const updated = [...accordions];
      const target = updated[index].tempEditData || updated[index];

      target.questioners =
        target.questioners?.map((q) => ({
          ...q,
          answers:
            q.answers?.map((a) => ({
              text: a.text ?? "",
              answer: a.answer ?? "",
              weight: a.weight ?? "",
            })) ||
            (q.type === "002" ? Array(3) : Array(5)).fill().map(() => ({
              text: "",
              answer: "",
              weight: "",
            })),
        })) || [];

      setAccordions(updated);
    }
  }, [accordion.isAccordionEditing]);
  useEffect(() => {
    console.log("Field errors updated:", accordion.fieldErrors);
  }, [accordion.fieldErrors]);
  const handleSave = async () => {
    const updatedAccordions = [...accordions];
    const tempData = updatedAccordions[index].tempEditData;
    updatedAccordions[index] = {
      ...updatedAccordions[index],
      fieldErrors: {
        factorName: false,
        factorDescription: false,
        relativeweight: false,
        questionerType: false,
        questions: [],
        hasQuestionErrors: false,
      },
    };
    setAccordions(updatedAccordions);
    const isValid = validateFields(tempData);

    if (!isValid) {
      showErrorDialog("Please fill all the answers before saving.");
      return;
    }
    try {
      setIsSaving(true);
      const factorPayload = {
        factorId: tempData.id,
        awardId: awardId,
        name: tempData.factorName,
        description: tempData.factorDescription,
        totalWeight: Number(tempData.relativeweight),
      };

      const factorResponse = await axiosInstance.post(
        "awards/saveFactor",
        factorPayload,
        { headers: { lang: language } }
      );
      const factorStatus =
        factorResponse.data?.result?.status || factorResponse.data?.status;
      if (factorStatus === 709) {
        showErrorDialog("You have exceeded the total factors weight limit!");
        return;
      }

      const savedFactorId =
        factorResponse.data?.data?.id || factorPayload.factorId;
      const questions = tempData.questioners || [];
      const updatedQuestions = [];

      for (const q of questions) {
        let currentQuestionId = q.id;
        const questionPayload = {
          factorId: savedFactorId,
          ...(currentQuestionId && { questionId: currentQuestionId }),
          text: q.question,
          weight: Number(q.weight),
          type: q.type,
        };
        if (q.type === "004") {
          questionPayload.answers = [
            {
              scaleMin: Number(q.answers?.[0]?.scaleMin),
              scaleMax: Number(q.answers?.[0]?.scaleMax),
              scaleJump: Number(q.answers?.[0]?.scaleJump),
              scaleNotes: q.answers?.[0]?.scaleNotes,
            },
          ];
        } else if (q.type === "001") {
          questionPayload.answers = [
            {
              text: language === "En" ? "Yes" : "نعم",
              weight: Number(q.answers?.[0]?.weight) || 0,
            },
            {
              text: language === "En" ? "No" : "لا",
              weight: Number(q.answers?.[1]?.weight) || 0,
            },
          ];
        } else {
          // 002, 003
          questionPayload.answers =
            q.answers?.map((a: any) => ({
              // ...(a.id && { answerId: a.id }),
              text: a.text || a.answer || "",
              weight: Number(a.weight ?? a.weight ?? 0),
            })) || [];
        }

        const questionResponse = await axiosInstance.post(
          "factors/saveQuestion",
          questionPayload,
          { headers: { lang: language } }
        );
        console.log("questionResponse", questionResponse);
        const questionStatus =
          questionResponse.data?.result?.status ||
          questionResponse.data?.status;
        if (questionStatus === 708) {
          showSuccessDialog("Maximum factor weight reached!");
        }
        if (questionStatus === 711) {
          showErrorDialog("FACTOR MAXIMUM WEIGHT EXCEDED");
          return;
        }
        const newQuestionId =
          questionResponse.data?.data?.id || currentQuestionId;
        updatedQuestions.push({
          ...q,
          id: newQuestionId,
          answers:
            questionPayload.answers?.map((a, idx) => ({
              ...a,
              id: questionResponse.data?.data?.answers?.[idx]?.id || a.id,
            })) || [],
        });
      }
      updatedAccordions[index] = {
        ...updatedAccordions[index],
        factorData: {
          ...tempData,
          id: savedFactorId,
        },
        questioners: updatedQuestions,
        tempEditData: undefined,
        isAccordionEditing: false,
        fieldErrors: {
          factorName: false,
          factorDescription: false,
          relativeweight: false,
          questionerType: false,
          questions: [],
          hasQuestionErrors: false,
        },
      };

      setAccordions(updatedAccordions);
      handleChange(null)();
      showSuccessDialog("Factor and questions saved successfully!");
    } catch (error: any) {
      console.error("Error saving factor or questions:", error);
      showErrorDialog(
        error.response?.data?.message || "FACTOR MAXIMUM WEIGHT EXCEDED"
      );
    } finally {
      setDialogOpen(true);
      setIsSaving(false);
    }
  };
  if (isSaving) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const updateAccordionData = (index, field, value) => {
    const updatedAccordions = [...accordions];

    if (!updatedAccordions[index]) {
      console.error(`Accordion at index ${index} not found.`);
      return;
    }
    if (updatedAccordions[index].isAccordionEditing) {
      if (!updatedAccordions[index].tempEditData) {
        updatedAccordions[index].tempEditData = {
          ...updatedAccordions[index].factorData,
        };
      }
      updatedAccordions[index].tempEditData[field] = value;
    } else {
      updatedAccordions[index].factorData[field] = value;
    }

    setAccordions(updatedAccordions);
    console.log(
      "Updated field:",
      field,
      "with value:",
      value,
      "for index:",
      index
    );
    console.log(
      "Current accordion state at index",
      index,
      ":",
      updatedAccordions[index]
    );
  };
  const addQuestioner = () => {
    const updatedAccordions = [...accordions];
    const newQuestioner = {
      id: "",
      type: "",
      question: "",
      weight: "",
      answers: [],
    };

    const currentAccordion = updatedAccordions[index];

    if (currentAccordion.isAccordionEditing) {
      if (!currentAccordion.tempEditData) {
        currentAccordion.tempEditData = {
          ...currentAccordion.factorData,
          questioners: [],
        };
      } else if (!Array.isArray(currentAccordion.tempEditData.questioners)) {
        currentAccordion.tempEditData.questioners = [];
      } else {
        // clone existing questioners
        currentAccordion.tempEditData.questioners = [
          ...currentAccordion.tempEditData.questioners,
        ];
      }

      currentAccordion.tempEditData.questioners.push({ ...newQuestioner });
    } else {
      if (!Array.isArray(currentAccordion.questioners)) {
        currentAccordion.questioners = [];
      } else {
        // clone existing questioners
        currentAccordion.questioners = [...currentAccordion.questioners];
      }

      currentAccordion.questioners.push({ ...newQuestioner });
    }

    currentAccordion.addQuestioner = true;
    setAccordions(updatedAccordions);
  };

  const handleChangeSelect = (
    accordionIndex: number,
    event,
    questionerIndex: number
  ) => {
    const newValue = event.target.value;

    setAccordions((prevAccordions) => {
      const updatedAccordions = [...prevAccordions];
      const accordion = updatedAccordions[accordionIndex];

      if (accordion.isAccordionEditing) {
        // Handle editing state
        if (!accordion.tempEditData?.questioners) {
          accordion.tempEditData = {
            ...accordion.tempEditData,
            questioners: [],
          };
        }
        accordion.tempEditData.questioners[questionerIndex] = {
          ...accordion.tempEditData.questioners[questionerIndex],
          type: newValue,
        };
      } else {
        // Handle normal state
        accordion.questioners[questionerIndex] = {
          ...accordion.questioners[questionerIndex],
          type: newValue,
        };
      }

      return updatedAccordions;
    });
  };

  const deleteQuestion = async (
    accordionIndex: number, // Index of the accordion in `accordions`
    factorId: string,
    questionId?: string,
    questionIndex: number // Index of the question in `questioners`
  ) => {
    const updatedAccordions = JSON.parse(JSON.stringify(accordions));
    const isEditing = updatedAccordions[accordionIndex].isAccordionEditing;
    const targetQuestioners = isEditing
      ? updatedAccordions[accordionIndex].tempEditData?.questioners
      : updatedAccordions[accordionIndex].questioners;

    if (!targetQuestioners) return;
    const deletedQuestion = targetQuestioners[questionIndex];
    targetQuestioners.splice(questionIndex, 1);

    if (targetQuestioners.length === 0) {
      updatedAccordions[accordionIndex].addQuestioner = false;
    }

    setAccordions(updatedAccordions);

    if (!questionId) return;

    try {
      await axiosInstance.delete(`factors/question/${factorId}/${questionId}`);
    } catch (error) {
      console.error("Delete error:", error);
      const revertAccordions = JSON.parse(JSON.stringify(accordions));
      const revertTarget = isEditing
        ? revertAccordions[accordionIndex].tempEditData?.questioners
        : revertAccordions[accordionIndex].questioners;

      if (revertTarget) {
        revertTarget.splice(questionIndex, 0, deletedQuestion);
      }

      setAccordions(revertAccordions);
      alert("Failed to delete question. Please try again.");
    }
  };

  const handleDeleteQuestion = (
    questionIndex: number,
    factorId: string,
    questionId?: string
  ) => {
    openConfirmDialog(
      "Confirm Delete",
      "Are you sure you want to delete this Question?",
      () => deleteQuestion(index, factorId, questionId, questionIndex)
    );
  };
  const deleteFactor = async (e, accordionId) => {
    e.preventDefault();
    e.stopPropagation();
    const accordion = accordions.find((acc) => acc.id === accordionId);
    const factorId = accordion?.factorData?.id;

    if (!factorId) {
      setAccordions((prev) => prev.filter((acc) => acc.id !== accordionId));
      return;
    }

    try {
      await axiosInstance.delete(`awards/factor/${awardId}/${factorId}`);
      setAccordions((prev) => prev.filter((acc) => acc.id !== accordionId));
      setExpandedPanel(false);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete factor. Please try again.");
    }
  };
  const handleDeleteFactor = (index, accordionId: string) => {
    openConfirmDialog(
      "Confirm Delete",
      "Are you sure you want to delete this factor?",
      () => deleteFactor(index, accordionId)
    );
  };
  const openConfirmDialog = (
    title: string,
    message: string,
    onConfirm: () => void
  ) => {
    setConfirmDialogConfig({ title, message, onConfirm });
    setConfirmDialogOpen(true);
  };

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false);
  };
  const waitForUserConfirmation = () => {
    return new Promise((resolve) => {});
  };
  const showErrorDialog = (message: string) => {
    setDialogTitle("Error");
    setType("error");
    setDialogMessage(message);
    setDialogOpen(true);
  };

  const showSuccessDialog = (message: string) => {
    setDialogTitle("Success");
    setType("success");
    setDialogMessage(message);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  const handleQuestionTypeChange = (qIndex, newType) => {
    const updated = [...accordions];
    const target = accordion.isAccordionEditing
      ? updated[index].tempEditData.questioners[qIndex]
      : updated[index].questioners[qIndex];

    if (newType === target.type) return; // No change needed

    // Preserve question text and weight
    const preservedData = {
      question: target.question,
      weight: target.weight,
    };

    // Update with new type and reset answers
    updated[index] = {
      ...updated[index],
      [accordion.isAccordionEditing ? "tempEditData" : "questioners"]: {
        ...(accordion.isAccordionEditing
          ? updated[index].tempEditData
          : updated[index].questioners),
        questioners: [
          ...(accordion.isAccordionEditing
            ? updated[index].tempEditData.questioners
            : updated[index].questioners
          ).map((q, idx) =>
            idx === qIndex
              ? {
                  ...q,
                  ...preservedData,
                  type: newType,
                  answers: getDefaultAnswersForType(newType),
                }
              : q
          ),
        ],
      },
      fieldErrors: {
        ...updated[index].fieldErrors,
        questions:
          updated[index].fieldErrors?.questions?.map((q, idx) =>
            idx === qIndex ? { question: false, weight: false, answers: [] } : q
          ) || [],
      },
    };

    setAccordions(updated);
  };
  const getDefaultAnswersForType = (type) => {
    switch (type) {
      case "001": // Yes/No
        return [
          { text: language === "En" ? "Yes" : "نعم", weight: "" },
          { text: language === "En" ? "No" : "لا", weight: "" },
        ];
      case "002": // 3 options
        return Array(3)
          .fill()
          .map(() => ({ text: "", answer: "", weight: "" }));
      case "003": // 5 options
        return Array(5)
          .fill()
          .map(() => ({ text: "", answer: "", weight: "" }));
      case "004": // Scale
        return [{ scaleMin: "", scaleMax: "", scaleJump: "", scaleNotes: "" }];
      default:
        return [];
    }
  };
  return (
    <>
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
      <ApiDialog
        open={dialogOpen}
        title={dialogTitle}
        message={dialogMessage}
        onClose={handleCloseDialog}
        variant={type}
      />
      <Accordion
        key={accordion.id}
        expanded={expandedPanel === accordion.id}
        onChange={handleChange(accordion.id)}
        sx={{
          width: "100%",
          borderRadius: "8px",
          mb: 2,
          [`& .${accordionSummaryClasses.root}`]: {
            minHeight: expandedPanel === accordion.id ? "64px" : "80px",
          },
          [`& .${accordionSummaryClasses.content}`]: {
            margin: 0,
          },
          [`& .${accordionDetailsClasses.root}`]: {
            display: expandedPanel === accordion.id ? "block" : "none",
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`${accordion.id}-content`}
          id={`${accordion.id}-header`}
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
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                component="span"
                sx={{
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                }}
              >
                {accordion.factorData.factorName || `Factor ${index + 1}`}
              </Typography>
            </Box>

            {expandedPanel === accordion.id ? (
              <Box sx={{ marginRight: "40px", display: "flex", gap: "16px" }}>
                {!accordion.isAccordionEditing && (
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      startEditing();
                    }}
                    style={{
                      color: "#5CB4FF",
                      textDecoration: "none",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </a>
                )}

                <a
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteFactor(e, accordion.id);
                  }}
                  style={{
                    color: "#5CB4FF",
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </a>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "300px",
                  marginRight: "80px",
                  color: "#666",
                }}
              >
                <Typography sx={{ fontSize: "1rem", color: "#721F31" }}>
                  {accordion.factorData.relativeweight
                    ? `${accordion.factorData.relativeweight}%`
                    : "0%"}{" "}
                </Typography>
                <Typography sx={{ fontSize: "1rem", color: "#721F31" }}>
                  {accordion.questioners ? accordion.questioners.length : 0}{" "}
                  Question(s)
                </Typography>
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
              opacity: accordion.isAccordionEditing ? 1 : 0.6,
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
            >
              <InputLabel sx={{ color: "black", mb: 2, fontSize: "24px" }}>
                {getLabelWithLanguage("Factor Name")}
              </InputLabel>
              <TextField
                disabled={!accordion.isAccordionEditing}
                placeholder="Factor Name"
                value={
                  accordion.factorData.factorName
                    ? accordion.factorData.factorName
                    : accordion.tempEditData?.factorName
                }
                error={accordion.fieldErrors.factorName}
                helperText={
                  accordion.fieldErrors.factorName
                    ? "Factor name is required"
                    : ""
                }
                onChange={(e) =>
                  updateAccordionData(index, "factorName", e.target.value)
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
              />

              <InputLabel sx={{ color: "black", mb: 2, fontSize: "24px" }}>
                {getLabelWithLanguage("Factor Description")}
              </InputLabel>
              <TextField
                disabled={!accordion.isAccordionEditing}
                error={accordion.fieldErrors.factorDescription}
                helperText={
                  accordion.fieldErrors.factorDescription
                    ? "Factor description is required"
                    : ""
                }
                placeholder="About The Factor"
                value={
                  accordion.tempEditData?.factorDescription ||
                  accordion.factorData.factorDescription
                }
                onChange={(e) =>
                  updateAccordionData(
                    index,
                    "factorDescription",
                    e.target.value
                  )
                }
                multiline
                rows={8}
                sx={{
                  backgroundColor: "white",
                  width: "100%",
                  borderRadius: "12px",
                }}
              />

              <InputLabel
                sx={{ color: "black", mb: 2, mt: 3, fontSize: "24px" }}
              >
                Relative weight
              </InputLabel>
              <TextField
                type="number"
                disabled={!accordion.isAccordionEditing}
                placeholder="0%"
                value={
                  accordion.tempEditData?.relativeweight ||
                  accordion.factorData.relativeweight
                }
                inputProps={{
                  min: 0,
                  max: 100,
                }}
                error={accordion.fieldErrors.relativeweight}
                helperText={
                  accordion.fieldErrors.relativeweight
                    ? "Relative weight is required"
                    : ""
                }
                onChange={(e) => {
                  let newValue = parseInt(e.target.value);
                  if (newValue > 100) {
                    newValue = 100;
                  }
                  if (newValue < 0) {
                    newValue = 0;
                  }
                  if (isNaN(newValue)) {
                    newValue = 0;
                  }
                  updateAccordionData(index, "relativeweight", newValue);
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

              <Stack
                direction="row"
                alignItems="flex-start"
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  mt: 3,
                  mb: 3,
                }}
              >
                {accordion.isAccordionEditing && (
                  <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Button
                      onClick={addQuestioner}
                      sx={{
                        backgroundColor: "#721F31",
                        minWidth: "45px",
                        minHeight: "30px",
                      }}
                    >
                      <AddIcon sx={{ color: "white" }} />
                    </Button>
                    <Typography>Add Questioner</Typography>
                  </Stack>
                )}
              </Stack>

              {accordion.addQuestioner && (
                <Box sx={{ mt: 3 }}>
                  {(accordion.isAccordionEditing
                    ? accordion.tempEditData?.questioners || []
                    : accordion.questioners || []
                  ).map((q, qIndex) => (
                    <Box
                      key={qIndex}
                      sx={{
                        border: "1px solid #ccc",
                        borderRadius: "12px",
                        padding: "16px",
                        marginTop: "16px",
                      }}
                    >
                      <Grid container sx={{ mb: 3, position: "relative" }}>
                        <Grid size={12}>
                          <IconButton
                            onClick={() =>
                              handleDeleteQuestion(
                                qIndex,
                                accordion.factorData.id,
                                q.id
                              )
                            }
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              color: "#721F31",
                              zIndex: 99,
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                          <InputLabel
                            sx={{ color: "black", mb: 2, fontSize: "24px" }}
                          >
                            Type
                          </InputLabel>
                          <FormControl
                            fullWidth
                            sx={{
                              borderRadius: "12px",
                            }}
                          >
                            <Select
                              disabled={!accordion.isAccordionEditing}
                              name="Type"
                              error={accordion.fieldErrors.questionerType}
                              labelId="audience-select"
                              value={q.type}
                              onChange={(e) =>
                                handleQuestionTypeChange(qIndex, e.target.value)
                              }
                              displayEmpty
                              sx={{
                                height: 40,
                                padding: "6px 8px",
                                borderRadius: "12px",
                                backgroundColor: "white",
                              }}
                              inputProps={{ "aria-label": "Without label" }}
                            >
                              <MenuItem disabled value="">
                                <em>
                                  {language === "En"
                                    ? "Select a Type"
                                    : "اختر النوع"}
                                </em>
                              </MenuItem>
                              <MenuItem value="001">
                                {language === "En" ? "Yes / No" : "نعم / لا"}
                              </MenuItem>
                              <MenuItem value="002">
                                {language === "En"
                                  ? "Multiple Choice 3 Levels"
                                  : "اختيارات متعددة 3 مستويات"}
                              </MenuItem>
                              <MenuItem value="003">
                                {language === "En"
                                  ? "Multiple Choice 5 Levels"
                                  : "اختيارات متعددة 5 مستويات"}
                              </MenuItem>
                              <MenuItem value="004">
                                {language === "En" ? "Scale" : "مقياس"}
                              </MenuItem>
                            </Select>

                            {accordion.fieldErrors.questionerType && (
                              <Typography color="error" variant="caption">
                                Type is required
                              </Typography>
                            )}
                          </FormControl>
                        </Grid>
                      </Grid>
                      {q.type !== "" && q.type !== undefined && (
                        <>
                          <Grid container spacing={2} size={12} sx={{ mb: 3 }}>
                            <Grid size={8}>
                              <InputLabel
                                sx={{
                                  color: "black",
                                  mb: 2,
                                  fontSize: "18px",
                                  fontWeight: "bold",
                                }}
                              >
                                {getLabelWithLanguage("Question")}
                              </InputLabel>
                              <TextField
                                disabled={!accordion.isAccordionEditing}
                                placeholder="text"
                                fullWidth
                                error={
                                  accordion.fieldErrors.questions?.[qIndex]
                                    ?.question
                                }
                                helperText={
                                  accordion.fieldErrors.questions?.[qIndex]
                                    ?.question
                                    ? "Question text is required"
                                    : ""
                                }
                                sx={{ backgroundColor: "white" }}
                                value={q.question}
                                onChange={(e) => {
                                  const updated = [...accordions];
                                  const isEditing =
                                    updated[index].isAccordionEditing;

                                  if (isEditing) {
                                    if (
                                      !updated[index].tempEditData?.questioners
                                    ) {
                                      updated[index].tempEditData.questioners =
                                        [];
                                    }
                                    updated[index].tempEditData.questioners[
                                      qIndex
                                    ].question = e.target.value;
                                  } else {
                                    updated[index].questioners[
                                      qIndex
                                    ].question = e.target.value;
                                  }

                                  setAccordions(updated);
                                }}
                              />
                            </Grid>
                            <Grid size={4}>
                              <InputLabel
                                sx={{
                                  color: "black",
                                  mb: 2,
                                  fontSize: "18px",
                                  fontWeight: "bold",
                                }}
                              >
                                Weight
                              </InputLabel>
                              <TextField
                                type="number"
                                inputProps={{ max: 100, min: 0 }}
                                fullWidth
                                error={
                                  accordion.fieldErrors.questions?.[qIndex]
                                    ?.weight
                                }
                                helperText={
                                  accordion.fieldErrors.questions?.[qIndex]
                                    ?.weight
                                    ? "Question weight is required"
                                    : ""
                                }
                                disabled={!accordion.isAccordionEditing}
                                sx={{ backgroundColor: "white" }}
                                value={q.weight}
                                onChange={(e) => {
                                  let newValue = parseInt(e.target.value);

                                  if (newValue > 100) newValue = 100;
                                  if (newValue < 0 || isNaN(newValue))
                                    newValue = 0;

                                  const updated = [...accordions];
                                  const isEditing =
                                    updated[index].isAccordionEditing;

                                  if (isEditing) {
                                    if (
                                      !updated[index].tempEditData?.questioners
                                    ) {
                                      updated[index].tempEditData.questioners =
                                        [];
                                    }
                                    updated[index].tempEditData.questioners[
                                      qIndex
                                    ].weight = newValue;
                                  } else {
                                    updated[index].questioners[qIndex].weight =
                                      newValue;
                                  }

                                  setAccordions(updated);
                                }}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      %
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>
                          </Grid>
                          <Box mt={3}>
                            {q.type === "001" && (
                              <Grid container spacing={2}>
                                {/* Yes Answer */}
                                <Grid size={8} sx={{ mb: 2 }}>
                                  <InputLabel
                                    sx={{
                                      color: "black",
                                      mb: 2,
                                      fontSize: "18px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {getLabelWithLanguage("First Answer")}
                                  </InputLabel>
                                  <TextField
                                    sx={{ backgroundColor: "white" }}
                                    fullWidth
                                    value={language === "En" ? "Yes" : "نعم"}
                                    disabled
                                  />
                                </Grid>
                                <Grid size={4} sx={{ mb: 2 }}>
                                  <InputLabel
                                    sx={{
                                      color: "black",
                                      mb: 2,
                                      fontSize: "18px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Mark
                                  </InputLabel>
                                  <TextField
                                    error={
                                      accordion.fieldErrors.questions?.[qIndex]
                                        ?.answers?.[0]?.weight
                                    }
                                    helperText={
                                      accordion.fieldErrors.questions?.[qIndex]
                                        ?.answers?.[0]?.weight
                                        ? "Mark is required"
                                        : ""
                                    }
                                    disabled={!accordion.isAccordionEditing}
                                    type="number"
                                    sx={{ backgroundColor: "white" }}
                                    fullWidth
                                    inputProps={{ max: 100, min: 0 }}
                                    onBlur={() =>
                                      validateFields(
                                        accordion.isAccordionEditing
                                          ? accordion.tempEditData
                                          : accordion
                                      )
                                    }
                                    value={
                                      accordion.isAccordionEditing
                                        ? (accordion.tempEditData
                                            ?.questioners?.[qIndex]
                                            ?.answers?.[0]?.weight ?? "")
                                        : (accordion.questioners?.[qIndex]
                                            ?.answers?.[0]?.weight ?? "")
                                    }
                                    onChange={(e) => {
                                      let newValue = parseInt(e.target.value);
                                      if (isNaN(newValue)) newValue = "";
                                      else if (newValue > 100) newValue = 100;
                                      else if (newValue < 0) newValue = 0;

                                      const updated = [...accordions];
                                      const target =
                                        accordion.isAccordionEditing
                                          ? updated[index].tempEditData
                                              .questioners[qIndex]
                                          : updated[index].questioners[qIndex];

                                      if (!target.answers)
                                        target.answers = [{}, {}];
                                      target.answers[0].weight = newValue;
                                      setAccordions(updated);
                                    }}
                                  />
                                </Grid>
                                <Grid size={8} sx={{ mb: 2 }}>
                                  <InputLabel
                                    sx={{
                                      color: "black",
                                      mb: 2,
                                      fontSize: "18px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {getLabelWithLanguage("Second Answer")}
                                  </InputLabel>
                                  <TextField
                                    sx={{ backgroundColor: "white" }}
                                    fullWidth
                                    value={language === "En" ? "No" : "لا"}
                                    disabled
                                  />
                                </Grid>
                                <Grid size={4}>
                                  <InputLabel
                                    sx={{
                                      color: "black",
                                      mb: 2,
                                      fontSize: "18px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Mark
                                  </InputLabel>
                                  <TextField
                                    error={
                                      accordion.fieldErrors.questions?.[qIndex]
                                        ?.answers?.[1]?.weight
                                    }
                                    onBlur={() =>
                                      validateFields(
                                        accordion.isAccordionEditing
                                          ? accordion.tempEditData
                                          : accordion
                                      )
                                    }
                                    helperText={
                                      accordion.fieldErrors.questions?.[qIndex]
                                        ?.answers?.[1]?.weight
                                        ? "Mark is required"
                                        : ""
                                    }
                                    disabled={!accordion.isAccordionEditing}
                                    type="number"
                                    sx={{ backgroundColor: "white" }}
                                    fullWidth
                                    inputProps={{ min: 0, max: 100 }}
                                    value={
                                      accordion.isAccordionEditing
                                        ? (accordion.tempEditData
                                            ?.questioners?.[qIndex]
                                            ?.answers?.[1]?.weight ?? "")
                                        : (accordion.questioners?.[qIndex]
                                            ?.answers?.[1]?.weight ?? "")
                                    }
                                    onChange={(e) => {
                                      let newValue = parseInt(e.target.value);
                                      if (isNaN(newValue)) newValue = "";
                                      else if (newValue > 100) newValue = 100;
                                      else if (newValue < 0) newValue = 0;

                                      const updated = [...accordions];
                                      const target =
                                        accordion.isAccordionEditing
                                          ? updated[index].tempEditData
                                              .questioners[qIndex]
                                          : updated[index].questioners[qIndex];

                                      if (!target.answers)
                                        target.answers = [{}, {}];
                                      target.answers[1].weight = newValue;
                                      setAccordions(updated);
                                    }}
                                  />
                                </Grid>
                              </Grid>
                            )}
                            {(q.type === "002" || q.type === "003") &&
                              (() => {
                                const levels =
                                  q.type === "002"
                                    ? [1, 2, 3]
                                    : [1, 2, 3, 4, 5];
                                const source = accordion.isAccordionEditing
                                  ? accordion.tempEditData
                                  : accordion;

                                return (
                                  <Grid container spacing={2}>
                                    {levels.map((level, i) => {
                                      const answer =
                                        source?.questioners?.[qIndex]
                                          ?.answers?.[i] || {};
                                      const answerValue =
                                        answer.answer || answer.text || "";
                                      const markValue = answer.weight || "";

                                      const answerError =
                                        accordion.fieldErrors?.questions?.[
                                          qIndex
                                        ]?.answers?.[i]?.answer || false;
                                      const weightError =
                                        accordion.fieldErrors?.questions?.[
                                          qIndex
                                        ]?.answers?.[i]?.weight || false;

                                      return (
                                        <React.Fragment key={i}>
                                          <Grid size={8} sx={{ mb: 2 }}>
                                            <InputLabel>
                                              {getLabelWithLanguage(
                                                `Answer ${level}`
                                              )}
                                            </InputLabel>
                                            <TextField
                                              value={answerValue}
                                              error={answerError}
                                              helperText={
                                                answerError
                                                  ? "Answer text is required"
                                                  : ""
                                              }
                                              disabled={
                                                !accordion.isAccordionEditing
                                              }
                                              fullWidth
                                              sx={{ backgroundColor: "white" }}
                                              onChange={(e) => {
                                                const updated = [...accordions];
                                                const target =
                                                  accordion.isAccordionEditing
                                                    ? updated[index]
                                                        .tempEditData
                                                        .questioners[qIndex]
                                                    : updated[index]
                                                        .questioners[qIndex];

                                                if (target) {
                                                  if (!target.answers)
                                                    target.answers = [];
                                                  if (!target.answers[i])
                                                    target.answers[i] = {};

                                                  target.answers[i] = {
                                                    ...target.answers[i],
                                                    text: e.target.value,
                                                    answer: e.target.value,
                                                    weight:
                                                      target.answers[i]
                                                        .weight || markValue,
                                                  };

                                                  if (
                                                    updated[index].fieldErrors
                                                      ?.questions?.[qIndex]
                                                      ?.answers?.[i]
                                                  ) {
                                                    updated[
                                                      index
                                                    ].fieldErrors.questions[
                                                      qIndex
                                                    ].answers[i].answer = false;
                                                  }

                                                  setAccordions(updated);
                                                }
                                              }}
                                              onBlur={() =>
                                                validateFields(
                                                  accordion.isAccordionEditing
                                                    ? accordion.tempEditData
                                                    : accordion
                                                )
                                              }
                                            />
                                          </Grid>

                                          <Grid size={4} sx={{ mb: 2 }}>
                                            <InputLabel>Mark</InputLabel>
                                            <TextField
                                              value={markValue}
                                              error={weightError}
                                              helperText={
                                                weightError
                                                  ? "Mark is required"
                                                  : ""
                                              }
                                              disabled={
                                                !accordion.isAccordionEditing
                                              }
                                              type="number"
                                              fullWidth
                                              inputProps={{ min: 0, max: 100 }}
                                              sx={{ backgroundColor: "white" }}
                                              onChange={(e) => {
                                                const newValue = Math.min(
                                                  100,
                                                  Math.max(
                                                    0,
                                                    parseInt(e.target.value) ||
                                                      0
                                                  )
                                                );

                                                const updated = [...accordions];
                                                const target =
                                                  accordion.isAccordionEditing
                                                    ? updated[index]
                                                        .tempEditData
                                                        .questioners[qIndex]
                                                    : updated[index]
                                                        .questioners[qIndex];

                                                if (target) {
                                                  if (!target.answers)
                                                    target.answers = [];
                                                  if (!target.answers[i])
                                                    target.answers[i] = {};

                                                  target.answers[i] = {
                                                    ...target.answers[i],
                                                    weight: newValue,
                                                  };

                                                  if (
                                                    updated[index].fieldErrors
                                                      ?.questions?.[qIndex]
                                                      ?.answers?.[i]
                                                  ) {
                                                    updated[
                                                      index
                                                    ].fieldErrors.questions[
                                                      qIndex
                                                    ].answers[i].weight = false;
                                                  }

                                                  setAccordions(updated);
                                                }
                                              }}
                                              onBlur={() =>
                                                validateFields(
                                                  accordion.isAccordionEditing
                                                    ? accordion.tempEditData
                                                    : accordion
                                                )
                                              }
                                            />
                                          </Grid>
                                        </React.Fragment>
                                      );
                                    })}
                                  </Grid>
                                );
                              })()}

                            {q.type === "004" && (
                              <Grid container spacing={2}>
                                {(() => {
                                  const questioner =
                                    accordion.isAccordionEditing
                                      ? accordion.tempEditData?.questioners?.[
                                          qIndex
                                        ]
                                      : accordion.questioners?.[qIndex];
                                  const answer = questioner?.answers?.[0] ?? {
                                    scaleMin: "",
                                    scaleMax: "",
                                    scaleJump: "",
                                    scaleNotes: "",
                                  };

                                  return (
                                    <>
                                      {[
                                        { field: "scaleMin", label: "Minimum" },
                                        { field: "scaleMax", label: "Maximum" },
                                        {
                                          field: "scaleJump",
                                          label: "Number Of Steps",
                                        },
                                      ].map((item) => {
                                        const error =
                                          accordion.fieldErrors?.questions?.[
                                            qIndex
                                          ]?.answers?.[0]?.[item.field] ||
                                          false;

                                        return (
                                          <Grid
                                            size={4}
                                            key={item.field}
                                            sx={{ mb: 2 }}
                                          >
                                            <InputLabel
                                              sx={{
                                                color: "black",
                                                mb: 2,
                                                fontSize: "18px",
                                                fontWeight: "bold",
                                              }}
                                            >
                                              {item.label}
                                            </InputLabel>
                                            <TextField
                                              disabled={
                                                !accordion.isAccordionEditing
                                              }
                                              fullWidth
                                              type="number"
                                              sx={{
                                                backgroundColor: "white",
                                              }}
                                              value={answer[item.field]}
                                              error={error}
                                              helperText={
                                                error
                                                  ? `${item.label} is required`
                                                  : ""
                                              }
                                              onChange={(e) => {
                                                const updated = [...accordions];
                                                const target =
                                                  accordion.isAccordionEditing
                                                    ? updated[index]
                                                        .tempEditData
                                                        .questioners[qIndex]
                                                    : updated[index]
                                                        .questioners[qIndex];

                                                if (target) {
                                                  if (!target.answers)
                                                    target.answers = [{}];
                                                  if (
                                                    target.answers.length === 0
                                                  )
                                                    target.answers.push({});

                                                  target.answers[0] = {
                                                    ...target.answers[0],
                                                    [item.field]:
                                                      e.target.value,
                                                  };

                                                  if (
                                                    updated[index].fieldErrors
                                                      ?.questions?.[qIndex]
                                                      ?.answers?.[0]
                                                  ) {
                                                    updated[
                                                      index
                                                    ].fieldErrors.questions[
                                                      qIndex
                                                    ].answers[0][item.field] =
                                                      false;
                                                  }

                                                  setAccordions(updated);
                                                }
                                              }}
                                              onBlur={(e) => {
                                                const updated = [...accordions];
                                                const targetAccordion =
                                                  accordion.isAccordionEditing
                                                    ? updated[index]
                                                        .tempEditData
                                                    : updated[index];
                                                const targetQuestioner =
                                                  targetAccordion.questioners?.[
                                                    qIndex
                                                  ];

                                                if (targetQuestioner) {
                                                  if (
                                                    !targetQuestioner.answers ||
                                                    targetQuestioner.answers
                                                      .length === 0
                                                  ) {
                                                    targetQuestioner.answers = [
                                                      {},
                                                    ];
                                                  }

                                                  // Update the specific field with the latest input value from the blur event
                                                  const value = e.target.value;
                                                  const field = item.field;

                                                  targetQuestioner.answers[0] =
                                                    {
                                                      ...targetQuestioner
                                                        .answers[0],
                                                      [field]: value,
                                                    };
                                                }

                                                validateFields(targetAccordion);
                                              }}
                                            />
                                          </Grid>
                                        );
                                      })}

                                      <Grid
                                        size={12}
                                        container
                                        spacing={2}
                                        alignItems="center"
                                      >
                                        <Grid size={12}>
                                          <InputLabel
                                            sx={{
                                              color: "black",
                                              fontSize: "18px",
                                              fontWeight: "bold",
                                              whiteSpace: "nowrap",
                                            }}
                                          >
                                            {getLabelWithLanguage("Note")}
                                          </InputLabel>
                                        </Grid>
                                        <Grid size={4}>
                                          <InputLabel
                                            sx={{
                                              color: "gray",
                                              fontSize: "18px",
                                              whiteSpace: "nowrap",
                                            }}
                                          >
                                            {"text"}
                                          </InputLabel>
                                        </Grid>
                                        <Grid size={8}>
                                          <TextField
                                            multiline
                                            minRows={3}
                                            disabled={
                                              !accordion.isAccordionEditing
                                            }
                                            fullWidth
                                            sx={{ backgroundColor: "white" }}
                                            value={
                                              questioner?.answers?.[0]
                                                ?.scaleNotes || ""
                                            }
                                            error={false}
                                            helperText=""
                                            onChange={(e) => {
                                              const updated = [...accordions];
                                              const target =
                                                accordion.isAccordionEditing
                                                  ? updated[index].tempEditData
                                                      .questioners[qIndex]
                                                  : updated[index].questioners[
                                                      qIndex
                                                    ];

                                              if (target) {
                                                if (!target.answers)
                                                  target.answers = [{}];
                                                if (target.answers.length === 0)
                                                  target.answers.push({});

                                                target.answers[0] = {
                                                  ...target.answers[0],
                                                  scaleNotes: e.target.value,
                                                };

                                                if (
                                                  updated[index].fieldErrors
                                                    ?.questions?.[qIndex]
                                                    ?.answers?.[0]
                                                ) {
                                                  updated[
                                                    index
                                                  ].fieldErrors.questions[
                                                    qIndex
                                                  ].answers[0].scaleNotes =
                                                    false;
                                                }

                                                setAccordions(updated);
                                              }
                                            }}
                                            onBlur={() =>
                                              validateFields(
                                                accordion.isAccordionEditing
                                                  ? accordion.tempEditData
                                                  : accordion
                                              )
                                            }
                                          />
                                        </Grid>
                                      </Grid>
                                    </>
                                  );
                                })()}
                              </Grid>
                            )}
                          </Box>
                        </>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>

          {accordion.isAccordionEditing && (
            <Stack
              direction="row"
              spacing={2}
              sx={{ pt: 2, justifyContent: "center" }}
            >
              <Button
                onClick={cancelEditing}
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
                disabled={
                  !(
                    accordions[index]?.tempEditData?.questioners ||
                    accordions[index]?.questioners
                  )?.length
                }
                onClick={handleSave}
                sx={{
                  backgroundColor: "#721F31",
                  color: "white",
                  textTransform: "none",
                  borderRadius: "8px",
                  width: "300px",
                  "&:hover": {
                    backgroundColor: "#5a1827",
                  },
                  "&:disabled": {
                    backgroundColor: "#D3D3D3",
                    color: "white",
                    cursor: "not-allowed",
                  },
                }}
              >
                Save
              </Button>
            </Stack>
          )}
        </AccordionDetails>
      </Accordion>
    </>
  );
}
