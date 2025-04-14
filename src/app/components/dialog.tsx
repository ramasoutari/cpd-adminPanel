import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
} from "@mui/material";

interface ApiDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

const ApiDialog: React.FC<ApiDialogProps> = ({
  open,
  title,
  message,
  onClose,
}) => {
  return (
    <Dialog open={open} onClose={onClose} sx={{ borderRadius: "8px" }}>
      <DialogTitle
        sx={{
          display: "center",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions
        sx={{
          display: "center",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Button
          sx={{ borderRadius: "8px", color: "#721F31", fontWeight: "bold" }}
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApiDialog;
