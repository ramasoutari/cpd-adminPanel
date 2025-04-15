import {
  Accordion,
  AccordionDetails,
  accordionDetailsClasses,
  AccordionSummary,
  accordionSummaryClasses,
  Box,
  Button,
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
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import React, { useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";
import { useRatingCriteria } from "../context/RatingCriteriaContext";
import ApiDialog from "../components/dialog";
import axiosInstance from "../utils/axios";

export default function FactorAccordion({
  accordion,
  index,
  language,
  expandedPanel,
  handleChange,
  setAccordions,
  accordions,
  awardId,
}) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    title: "Confirm",
    message: "",
    onConfirm: () => {},
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
    handleChange(null)(); // Collapse the accordion
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
    const errors = {
      factorName: !data.factorName,
      factorDescription: !data.factorDescription,
      relativeweight:
        !data.relativeweight || isNaN(Number(data.relativeweight)),
      questionerType: false,
      questions: [],
    };

    // Validate each question
    if (data.questioners && data.questioners.length > 0) {
      errors.questions = data.questioners.map((q, qIndex) => {
        const questionErrors = {
          question: !q.question,
          weight: !q.weight || isNaN(Number(q.weight)),
          answers: [],
        };

        if (q.answers && q.answers.length > 0) {
          questionErrors.answers = q.answers.map((a, aIndex) => {
            if (q.type === "001") {
              return {
                mark: !a.mark || isNaN(Number(a.mark)),
              };
            } else if (q.type === "002" || q.type === "003") {
              return {
                answer: !(a.answer || a.text), // True if both are empty
                mark: !(a.mark || a.weight), // True if both are empty
              };
            } else if (q.type === "004") {
              // Scale question
              return {
                scaleMin:
                  !a.scaleMin ||
                  isNaN(Number(a.scaleMin)) ||
                  Number(a.scaleMin) < 0,
                scaleMax:
                  !a.scaleMax ||
                  isNaN(Number(a.scaleMax)) ||
                  Number(a.scaleMax) <= Number(a.scaleMin),
                scaleJump:
                  !a.scaleJump ||
                  isNaN(Number(a.scaleJump)) ||
                  Number(a.scaleJump) <= 0,
                scaleNotes: false,
              };
            }
            return {};
          });
        } else {
          questionErrors.answers = [
            { error: "At least one answer is required" },
          ];
        }

        return questionErrors;
      });
    } else {
      errors.questions = [{ error: "At least one question is required" }];
    }    const updatedAccordions = [...accordions];
    updatedAccordions[index] = {
      ...updatedAccordions[index],
      fieldErrors: {
        ...errors,
        hasQuestionErrors: errors.questions.some(
          (q) =>
            q.error ||
            q.question ||
            q.weight ||
            q.answers?.some((a) => Object.values(a).some((e) => e))
        ),
      },
    };

    setAccordions(updatedAccordions);
    const hasErrors =
      errors.factorName ||
      errors.factorDescription ||
      errors.relativeweight ||
      errors.questions.some(
        (q) =>
          q.error ||
          q.question ||
          q.weight ||
          q.answers?.some((a) => Object.values(a).some((v) => v === true))
      );

    return !hasErrors;
  };
  useEffect(() => {
    console.log("Field errors updated:", accordion.fieldErrors);
  }, [accordion.fieldErrors]);
  const handleSave = async () => {

    const updatedAccordions = [...accordions];
    const tempData = updatedAccordions[index].tempEditData;
    const isValid = validateFields(tempData);

    
    console.log("isValid",isValid)

    if (!isValid) {
      showErrorDialog("Please fill all the answers before saving.");
   return;
 }
    try {
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
      console.log("factorResponse", factorResponse);
      if (factorResponse.data?.status === 709) {
        showErrorDialog("You have exceeded the total factors weight limit!");
        return;
      }
      // if (factorResponse.data?.status === 708) {
      //   setDialogOpen(true);
      //   setDialogTitle("");
      //   setType("success");
      //   setDialogMessage("Maximum factor weight reached successfully!");
      //   return;
      // }

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
              weight: Number(q.answers?.[0]?.mark) || 0,
            },
            {
              text: language === "En" ? "No" : "لا",
              weight: Number(q.answers?.[1]?.mark) || 0,
            },
          ];
        } else {
          // 002, 003
          questionPayload.answers =
            q.answers?.map((a: any) => ({
              // ...(a.id && { answerId: a.id }),
              text: a.text || a.answer || "",
              weight: Number(a.weight ?? a.mark ?? 0),
            })) || [];
        }

        const questionResponse = await axiosInstance.post(
          "factors/saveQuestion",
          questionPayload,
          { headers: { lang: language } }
        );

        if (questionResponse.data?.status === 708) {
          showErrorDialog("Maximum factor weight reached!");
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
        q.id = newQuestionId;
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
        error.response?.data?.message || "An error occurred while saving."
      );
    } finally {
      setDialogOpen(true);
    }
  };

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

      // Revert: Put the question back in the correct position
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
    questionIndex: number, // Index of the question in `questioners`
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
      await axiosInstance.delete(`factors/${factorId}`);
      setAccordions((prev) => prev.filter((acc) => acc.id !== accordionId));
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
  return (
    <>
      <Dialog open={confirmDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>{confirmDialogConfig.title}</DialogTitle>
        <DialogContent>{confirmDialogConfig.message}</DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              confirmDialogConfig.onConfirm();
              setConfirmDialogOpen(false);
            }}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
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
                                handleChangeSelect(index, e, qIndex)
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
                              <Grid container spacing={2} size={12}>
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
                                        ?.mark
                                    }
                                    helperText={
                                      accordion.fieldErrors.questions?.[qIndex]
                                        ?.mrak
                                        ? "Question mark is required"
                                        : ""
                                    }
                                    disabled={!accordion.isAccordionEditing}
                                    type="number"
                                    sx={{ backgroundColor: "white" }}
                                    fullWidth
                                    inputProps={{ max: 100, min: 0 }}
                                    value={
                                      accordion.isAccordionEditing
                                        ? (accordion.tempEditData
                                            ?.questioners?.[qIndex]
                                            ?.answers?.[0]?.mark ?? 0)
                                        : (accordion.questioners?.[qIndex]
                                            ?.answers?.[0]?.mark ?? 0)
                                    }
                                    onChange={(e) => {
                                      let newValue = parseInt(e.target.value);
                                      if (newValue > 100) {
                                        newValue = 100;
                                      }
                                      if (isNaN(newValue)) {
                                        newValue = 0;
                                      }
                                      const updated = [...accordions];
                                      const target =
                                        accordion.isAccordionEditing
                                          ? updated[index].tempEditData
                                              .questioners[qIndex]
                                          : updated[index].questioners[qIndex];

                                      if (!target.answers)
                                        target.answers = [{}, {}];
                                      if (!target.answers[0])
                                        target.answers[0] = {};

                                      target.answers[0].mark = newValue;
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
                                    disabled={!accordion.isAccordionEditing}
                                    type="number"
                                    sx={{ backgroundColor: "white" }}
                                    fullWidth
                                    inputProps={{
                                      min: 0,
                                      max: 100,
                                    }}
                                    value={
                                      accordion.isAccordionEditing
                                        ? (accordion.tempEditData
                                            ?.questioners?.[qIndex]
                                            ?.answers?.[1]?.mark ?? 0)
                                        : (accordion.questioners?.[qIndex]
                                            ?.answers?.[1]?.mark ?? 0)
                                    }
                                    onChange={(e) => {
                                      let newValue = parseInt(e.target.value);
                                      if (newValue > 100) {
                                        newValue = 100;
                                      }
                                      if (isNaN(newValue)) {
                                        newValue = 0;
                                      }
                                      const updated = [...accordions];
                                      const target =
                                        accordion.isAccordionEditing
                                          ? updated[index].tempEditData
                                              .questioners[qIndex]
                                          : updated[index].questioners[qIndex];

                                      if (!target.answers)
                                        target.answers = [{}, {}];
                                      if (!target.answers[1])
                                        target.answers[1] = {};

                                      target.answers[1].mark = newValue;
                                      setAccordions(updated);
                                    }}
                                  />
                                </Grid>
                              </Grid>
                            )}
                            {(q.type === "002" || q.type === "003") && (
                              <Grid container spacing={2}>
                                {(q.type === "002"
                                  ? [1, 2, 3]
                                  : [1, 2, 3, 4, 5]
                                ).map((level, i) => {
                                  const currentQuestioner =
                                    accordion.isAccordionEditing
                                      ? accordion.tempEditData?.questioners?.[
                                          qIndex
                                        ]
                                      : accordion.questioners?.[qIndex];

                                  const currentAnswer =
                                    currentQuestioner?.answers?.[i] || {};

                                  const answerValue =
                                    currentAnswer.answer ||
                                    currentAnswer.text ||
                                    "";
                                  const markValue =
                                    currentAnswer.weight ||
                                    currentAnswer.mark ||
                                    "";

                                  const answerErrors =
                                    accordion.fieldErrors.questions?.[qIndex]
                                      ?.answers?.[i] || {};
                                  const answerTextError = answerErrors.answer;
                                  const markError =
                                    answerErrors.mark || answerErrors.weight;

                                  return (
                                    <React.Fragment key={i}>
                                      <Grid size={8} sx={{ mb: 2 }}>
                                        <InputLabel>
                                          {getLabelWithLanguage(
                                            `Answer ${level}`
                                          )}
                                        </InputLabel>
                                        <TextField
                                          error={answerTextError}
                                          helperText={
                                            answerTextError
                                              ? "Answer text is required"
                                              : ""
                                          }
                                          disabled={
                                            !accordion.isAccordionEditing
                                          }
                                          fullWidth
                                          sx={{ backgroundColor: "white" }}
                                          value={answerValue}
                                          onChange={(e) => {
                                            const updated = [...accordions];
                                            const isEditing =
                                              updated[index].isAccordionEditing;
                                            const questioner = isEditing
                                              ? updated[index].tempEditData
                                                  ?.questioners?.[qIndex]
                                              : updated[index].questioners[
                                                  qIndex
                                                ];

                                            if (questioner) {
                                              if (!questioner.answers)
                                                questioner.answers = [];
                                              if (!questioner.answers[i])
                                                questioner.answers[i] = {};
                                              questioner.answers[i].answer =
                                                e.target.value;
                                              questioner.answers[i].text =
                                                e.target.value;
                                              setAccordions(updated);
                                            }
                                          }}
                                        />
                                      </Grid>

                                      <Grid size={4} sx={{ mb: 2 }}>
                                        <InputLabel>Mark</InputLabel>
                                        <TextField
                                          error={markError}
                                          helperText={
                                            markError
                                              ? "Mark is required and must be between 0-100"
                                              : ""
                                          }
                                          disabled={
                                            !accordion.isAccordionEditing
                                          }
                                          type="number"
                                          fullWidth
                                          inputProps={{ min: 0, max: 100 }}
                                          sx={{ backgroundColor: "white" }}
                                          value={markValue}
                                          onChange={(e) => {
                                            let newValue = parseInt(
                                              e.target.value
                                            );
                                            if (newValue > 100) newValue = 100;
                                            if (isNaN(newValue)) newValue = 0;

                                            const updated = [...accordions];
                                            const isEditing =
                                              updated[index].isAccordionEditing;
                                            const questioner = isEditing
                                              ? updated[index].tempEditData
                                                  ?.questioners?.[qIndex]
                                              : updated[index].questioners[
                                                  qIndex
                                                ];

                                            if (questioner) {
                                              if (!questioner.answers)
                                                questioner.answers = [];
                                              if (!questioner.answers[i])
                                                questioner.answers[i] = {};
                                              questioner.answers[i].mark =
                                                newValue;
                                              questioner.answers[i].weight =
                                                newValue;
                                              setAccordions(updated);
                                            }
                                          }}
                                        />
                                      </Grid>
                                    </React.Fragment>
                                  );
                                })}
                              </Grid>
                            )}
                            {q.type === "004" && (
                              <Grid container spacing={2}>
                                {[
                                  { field: "scaleMin", label: "Minimum" },
                                  { field: "scaleMax", label: "Maximum" },
                                  {
                                    field: "scaleJump",
                                    label: "Number Of Steps",
                                  },
                                ].map((item) => (
                                  <Grid
                                    size={4}
                                    sm={4}
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
                                      disabled={!accordion.isAccordionEditing}
                                      fullWidth
                                      type="number"
                                      sx={{ backgroundColor: "white" }}
                                      value={
                                        (accordion.isAccordionEditing
                                          ? accordion.tempEditData
                                              ?.questioners?.[qIndex]
                                              ?.answers?.[0]?.[item.field]
                                          : accordion.questioners?.[qIndex]
                                              ?.answers?.[0]?.[item.field]) ||
                                        ""
                                      }
                                      error={Boolean(
                                        accordion.fieldErrors?.questions?.[
                                          qIndex
                                        ]?.answers?.[0]?.[item.field]
                                      )}
                                      helperText={
                                        accordion.fieldErrors?.questions?.[
                                          qIndex
                                        ]?.answers?.[0]?.[item.field]
                                          ? `${item.label} is required`
                                          : ""
                                      }
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
                                            [item.field]: e.target.value,
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
                                            ].answers[0][item.field] = false;
                                          }

                                          setAccordions(updated);
                                        }
                                      }}
                                    />
                                  </Grid>
                                ))}

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
                                      disabled={!accordion.isAccordionEditing}
                                      fullWidth
                                      sx={{ backgroundColor: "white" }}
                                      value={
                                        (accordion.isAccordionEditing
                                          ? accordion.tempEditData
                                              ?.questioners?.[qIndex]
                                              ?.answers?.[0]?.scaleNotes
                                          : accordion.questioners?.[qIndex]
                                              ?.answers?.[0]?.scaleNotes) || ""
                                      }
                                      error={Boolean(
                                        accordion.fieldErrors?.questions?.[
                                          qIndex
                                        ]?.answers?.[0]?.scaleNotes
                                      )}
                                      helperText={
                                        accordion.fieldErrors?.questions?.[
                                          qIndex
                                        ]?.answers?.[0]?.scaleNotes
                                          ? "Note is required"
                                          : ""
                                      }
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
                                            ].answers[0].scaleNotes = false;
                                          }

                                          setAccordions(updated);
                                        }
                                      }}
                                    />
                                  </Grid>
                                </Grid>
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
