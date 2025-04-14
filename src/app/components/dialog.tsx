import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  Box,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

type DialogVariant = "success" | "error" | "none";

interface ApiDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  variant?: DialogVariant;
}

const ApiDialog: React.FC<ApiDialogProps> = ({
  open,
  title,
  message,
  onClose,
  variant = "none",
}) => {
  const iconStyle = {
    fontSize: 60,
    mb: 2,
  };

  const getIcon = () => {
    switch (variant) {
      case "success":
        return <CheckCircleIcon color="success" sx={iconStyle} />;
      case "error":
        return <ErrorIcon color="error" sx={iconStyle} />;
      default:
        return null;
    }
  };

  const getTitleColor = () => {
    switch (variant) {
      case "success":
        return "#2e7d32";
      case "error":
        return "#d32f2f";
      default:
        return "inherit";
    }
  };

  const getButtonColor = () => {
    switch (variant) {
      case "success":
        return "#2e7d32";
      case "error":
        return "#d32f2f";
      default:
        return "#1976d2"; // Default MUI primary color
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiPaper-root": {
          borderRadius: "12px",
          padding: "16px",
          minWidth: "500px",
          textAlign: "center",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: getTitleColor(),
          fontWeight: "bold",
          fontSize: "1.5rem",
        }}
      >
        {getIcon()}
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
      >
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            borderRadius: "8px",
            fontWeight: "bold",
            textTransform: "none",
            backgroundColor: getButtonColor(),
            "&:hover": {
              backgroundColor: getButtonColor(),
              opacity: 0.9,
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApiDialog;
