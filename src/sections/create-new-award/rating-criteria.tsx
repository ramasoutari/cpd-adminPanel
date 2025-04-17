import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import React, { useEffect, useState } from "react";
import FactorAccordion from "./factor-accordion";
import { useRatingCriteria } from "../../app/context/RatingCriteriaContext";
import axios from "axios";
import axiosInstance from "../../app/utils/axios";
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ApiDialog from "../../components/dialog";

export default function RatingCriteria({ language, awardId }) {
  const {
    accordions,
    setAccordions,
    expandedPanel,
    setExpandedPanel,
    totalWeight,
    setTotalWeight,
  } = useRatingCriteria();
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogTitle, setDialogTitle] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    setAccordions([]);

    const fetchFactors = async () => {
      if (!awardId) return;

      setLoading(true);
      try {
        const response = await axiosInstance.get(`awards/factors/${awardId}`, {
          headers: { lang: language },
        });

        if (response.data.data?.length > 0) {
          const factors = response.data.data.map((factor, index) => {
            const questioners =
              factor.questions?.map((q) => {
                const baseQuestion = {
                  id: q.id,
                  question: language === "Ar" ? q.textAr : q.textEn,
                  type: q.type,
                  weight: q.weight,
                  answeredWeight: q.answeredWeight,
                };
                if (q.type === "004") {
                  return {
                    ...baseQuestion,
                    answers:
                      q.answers?.length > 0
                        ? [
                            {
                              id: q.answers[0].id,
                              scaleMin: q.answers[0].scaleMin || "",
                              scaleMax: q.answers[0].scaleMax || "",
                              scaleJump: q.answers[0].scaleJump || "",
                              scaleNotes:
                                language === "Ar"
                                  ? q.answers[0].scaleNotesAr
                                  : q.answers[0].scaleNotesEn,
                            },
                          ]
                        : [
                            {
                              scaleMin: "",
                              scaleMax: "",
                              scaleJump: "",
                              scaleNotes: "",
                            },
                          ],
                  };
                } else {
                  return {
                    ...baseQuestion,
                    answers:
                      q.answers?.map((a) => ({
                        id: a.id,
                        text: language === "Ar" ? a.textAr : a.textEn,
                        answer: language === "Ar" ? a.textAr : a.textEn,
                        weight: a.weight,
                      })) || [],
                  };
                }
              }) || [];

            return {
              id: `panel${index + 1}`,
              factorData: {
                id: factor.id,
                factorName: language === "Ar" ? factor.nameAr : factor.nameEn,
                factorDescription:
                  language === "Ar"
                    ? factor.descriptionAr
                    : factor.descriptionEn,
                relativeweight: factor.totalWeight
                  ? `${factor.totalWeight}`
                  : "",
              },
              isAccordionEditing: false,
              addQuestioner: true,
              questioners,
              fieldErrors: {
                factorName: false,
                factorDescription: false,
                relativeweight: false,
                questionerType: false,
                questions: questioners.map((q) => ({
                  question: false,
                  weight: false,
                  answers: q.answers.map((a) =>
                    q.type === "004"
                      ? {
                          scaleMin: false,
                          scaleMax: false,
                          scaleJump: false,
                          scaleNotes: false,
                        }
                      : {
                          answer: false,
                          weight: false,
                        }
                  ),
                })),
              },
            };
          });

          setAccordions(factors);
        }
      } catch (error) {
        console.error("Error fetching factors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFactors();
  }, [awardId, language]);

  const handleChange = (panel) => (event, isExpanded) => {
    console.log("expanded panel", panel);
    setExpandedPanel(isExpanded ? panel : null);
  };

  useEffect(() => {
    const sum = accordions.reduce((total, accordion) => {
      const weight = accordion.factorData.relativeweight;
      const numWeight = parseInt(weight?.toString().replace("%", ""), 10);
      return isNaN(numWeight) ? total : total + numWeight;
    }, 0);
    setTotalWeight(sum);
  }, [accordions]);
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

  const addAccordion = () => {
    // Check if any accordion is currently being edited
    const isAnyAccordionEditing = accordions.some(
      (accordion) => accordion.isAccordionEditing
    );

    if (isAnyAccordionEditing) {
      showErrorDialog(
        "Please save or cancel the current factor before adding a new one"
      );
      return;
    }

    const newId = `panel${accordions.length + 1}`;
    const newAccordion = {
      id: newId,
      factorData: {
        factorName: "",
        factorDescription: "",
        relativeweight: "",
      },
      isAccordionEditing: true, // Set this new accordion to editing mode
      addQuestioner: false,
      questioners: [],
      fieldErrors: {
        factorName: false,
        factorDescription: false,
        relativeweight: false,
        questionerType: false,
      },
    };

    setAccordions([...accordions, newAccordion]);
    setExpandedPanel(newId); // Optionally keep this if you still want to expand the new accordion
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <ApiDialog
        open={dialogOpen}
        title={dialogTitle}
        message={dialogMessage}
        onClose={handleCloseDialog}
        variant={type}
      />
      <Stack
        sx={{ width: "100%", pb: 5 }}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography sx={{ color: "#721F31" }} variant="h6" component="h2">
          {totalWeight} Out of 100%
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Tooltip title="Add a new evaluation factor to the form">
            <InfoOutlinedIcon
              sx={{
                fontSize: 20,
                color: "#888",
                cursor: "pointer",
                mr: 1,
              }}
            />
          </Tooltip>
          <Button
            onClick={addAccordion}
            disabled={!awardId}
            sx={{
              color: "white",
              backgroundColor: "#721F31",
              borderRadius: "8px",
              width: { xs: "50%", sm: "200px", md: "160px" },
              height: { xs: "60px", sm: "40px", md: "35px" },
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              "&:hover": {
                backgroundColor: "#5a1827",
              },
              ":disabled": {
                backgroundColor: "#D3D3D3",
                color: "white",
              },
            }}
          >
            Add New Factor
          </Button>
        </Box>
      </Stack>
      <Box>
        {accordions.map((accordion, index) => (
          <FactorAccordion
            key={accordion.id || index}
            accordion={accordion}
            index={index}
            language={language}
            expandedPanel={expandedPanel}
            handleChange={handleChange}
            setAccordions={setAccordions}
            setExpandedPanel={setExpandedPanel}
            accordions={accordions}
            awardId={awardId}
          />
        ))}
      </Box>
    </Box>
  );
}
