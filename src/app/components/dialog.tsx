import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import CloseIcon from "@mui/icons-material/Close";

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
    width: "200px",
    height: "200px",
  };

  const getIcon = () => {
    switch (variant) {
      case "success":
        return <img src="/assets/weui_done2-outlined.png" style={iconStyle} />;
      case "error":
        return <ErrorIcon color="error" sx={iconStyle} />;
      default:
        return null;
    }
  };

  const getTitleColor = () => {
    switch (variant) {
      case "success":
        return "#999999";
      case "error":
        return "#d32f2f";
      default:
        return "inherit";
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
          width: "600px",
          maxWidth: "90vw",
          textAlign: "center",
          position: "relative",
        },
      }}
    >
      <IconButton
        aria-label="close"
        onClick={onClose}
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
          padding: 3,
        }}
      >
        <DialogTitle
          sx={{
            color: getTitleColor(),
            fontWeight: "300",
            fontSize: "42px",
            fontFamily: "inter",
            padding: 0,
            mt: 2,
          }}
        >
          {getIcon()}
          <Box sx={{ mt: 2 }}>{title}</Box>
        </DialogTitle>

        <DialogContent sx={{ padding: 0, mt: 2 }}>
          <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
            {message}
          </Typography>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default ApiDialog;
