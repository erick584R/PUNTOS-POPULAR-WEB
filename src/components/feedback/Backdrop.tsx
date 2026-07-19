"use client";

import { Backdrop, CircularProgress } from "@mui/material";

const PopularBackdrop: React.FC<{ open: boolean }> = ({ open }) => {
  return (
    <Backdrop open={open} sx={{ color: "#fff", zIndex: 9999 }}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default PopularBackdrop;