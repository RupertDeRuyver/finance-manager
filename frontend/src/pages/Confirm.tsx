import { Box, CircularProgress, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

const BACKEND_URL = "http://localhost:3000";

function Confirm() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const requisition_id = params.get("ref");
  fetch(
    `${BACKEND_URL}/confirm-requisition?requisition_id=${requisition_id}`
  ).then((response) => {
    if (response.ok) {
      navigate("/?link-success=true");
    } else {
      navigate("/?link-success=false");
    }
  });
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh" // full screen
    >
      <CircularProgress size={80}/>
      <Typography variant="h5" sx={{ mt: 2 }}>Connecting account...</Typography>
    </Box>
  );
}

export default Confirm;
