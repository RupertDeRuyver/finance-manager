import { Typography } from "@mui/material";
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
    <>
      <Typography>Connecting account...</Typography>
    </>
  );
}

export default Confirm;
