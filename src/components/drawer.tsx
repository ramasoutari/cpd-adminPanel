import React, { useState, useEffect } from "react";
import {
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import axios from "axios"; // Make sure to install axios: npm install axios
import axiosInstance from "@/app/utils/axios";

const drawer = (handleNavigation: any) => {
  const [openAwards, setOpenAwards] = useState(false);
  const [awardsData, setAwardsData] = useState([]);
  const awardsApiPath = "/api/awards"; // Your API endpoint

  const handleClickAwards = () => {
    setOpenAwards(!openAwards);
  };

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const response = await axiosInstance.get(awardsApiPath);
        setAwardsData(response.data); // Assuming the API returns an array of award objects
      } catch (error) {
        console.error("Error fetching awards:", error);
        // Optionally set an error state to display a message to the user
      }
    };

    if (openAwards && awardsData.length === 0) {
      fetchAwards();
    }
  }, [openAwards, awardsApiPath]);

  return (
    <div>
      <Toolbar />
      <List>
        <ListItem key="Dashboard" disablePadding>
          <ListItemButton
            onClick={() => handleNavigation("Dashboard")}
            sx={{
              display: "flex",
              justifyContent: "center",
              pl: 3,
            }}
          >
            <ListItemText
              primary="Dashboard"
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

        {/* Expandable Award Section */}
        <ListItemButton onClick={handleClickAwards}>
          <ListItemText
            primary="Award"
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
          {openAwards ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openAwards} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {awardsData.map((award) => (
              <ListItem key={award.id} disablePadding>
                <ListItemButton
                  sx={{ pl: 4 }} // Indent the sub-items
                  onClick={() => handleNavigation(`award/${award.id}`)} // Example navigation
                >
                  <ListItemText
                    primary={award.name || award.title || `Award ${award.id}`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            {awardsData.length === 0 && openAwards && (
              <ListItem disablePadding>
                <ListItemText
                  sx={{ pl: 4, fontStyle: "italic" }}
                  primary="Loading awards..."
                />
              </ListItem>
            )}
          </List>
        </Collapse>

        <ListItem key="Judges" disablePadding>
          <ListItemButton
            onClick={() => handleNavigation("Judges")}
            sx={{
              display: "flex",
              justifyContent: "center",
              pl: 3,
            }}
          >
            <ListItemText
              primary="Judges"
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

        <ListItem key="Website" disablePadding>
          <ListItemButton
            onClick={() => handleNavigation("Website")}
            sx={{
              display: "flex",
              justifyContent: "center",
              pl: 3,
            }}
          >
            <ListItemText
              primary="Website"
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
      </List>
    </div>
  );
};

export default drawer;
