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
import { useRatingCriteria } from "../context/RatingCriteriaContext";
import axios from "axios";

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

  useEffect(() => {
    setAccordions([]);
    const fetchFactors = async () => {
      if (!awardId) return;

      setLoading(true);
      try {
        const response = await axios.get(
          `http://98.83.87.183:3001/api/awards/factors/${awardId}`,
          { headers: { lang: language } }
        );

        if (response.data.data?.length > 0) {
          const factors = response.data.data.map((factor, index) => ({
            id: `panel${index + 1}`,
            factorData: {
              id: factor.id,
              factorName: language === "Ar" ? factor.nameAr : factor.nameEn,
              factorDescription:
                language === "Ar" ? factor.descriptionAr : factor.descriptionEn,
              relativeweight: factor.totalWeight ? `${factor.totalWeight}` : "",
            },
            isAccordionEditing: false,
            addQuestioner: true,
            questioners:
              factor.questions?.map((q) => ({
                id: q.id,
                question: language === "Ar" ? q.textAr : q.textEn,
                type: q.type,
                weight: q.weight,
                answeredWeight: q.answeredWeight,
                answers:
                  q.answers?.map((a) => ({
                    id: a.id,
                    answer: language === "Ar" ? a.textAr : a.textEn,
                    mark: a.weight,
                    numericScale: a.numericScale,
                    scaleMin: a.scaleMin,
                    scaleMax: a.scaleMax,
                    scaleJump: a.scaleJump,
                    scaleNotesAr: a.scaleNotesAr,
                    scaleNotesEn: a.scaleNotesEn,
                  })) || [],
              })) || [],
            fieldErrors: {
              factorName: false,
              factorDescription: false,
              relativeweight: false,
              questionerType: false,
            },
          }));

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

  const addAccordion = () => {
    const newId = `panel${accordions.length + 1}`;
    const newAccordion = {
      id: newId,
      factorData: {
        factorName: "",
        factorDescription: "",
        relativeweight: "",
      },
      isAccordionEditing: true,
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
    setExpandedPanel(newId);
  };

  // if (loading) {
  //   return (
  //     <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
  //       <CircularProgress />
  //     </Box>
  //   );
  // }

  return (
    <Box sx={{ width: "100%" }}>
      <Stack
        sx={{ width: "100%", pb: 5 }}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography sx={{ color: "#721F31" }} variant="h6" component="h2">
          {totalWeight} Out of 100%
        </Typography>
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
            accordions={accordions}
            awardId={awardId}
          />
        ))}
      </Box>
    </Box>
  );
}
