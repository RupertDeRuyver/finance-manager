import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useLocation, useNavigate } from "react-router-dom";

const pages = [
  {
    name: "Home",
    icon: <RestoreIcon />,
    location: "/home",
  },
  {
    name: "Groceries",
    icon: <FavoriteIcon />,
    location: "/groceries",
  },
  {
    name: "Analytics",
    icon: <LocationOnIcon />,
    location: "/analytics",
  },
];

function BottomBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentIndex = pages.findIndex(
    (page) => page.location === location.pathname
  );
  return (
    <>
      <Paper
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={currentIndex}
          onChange={(_event, newValue) => {
            navigate(pages[newValue].location);
          }}
        >
          {pages.map((page) => {
            return (
              <BottomNavigationAction label={page.name} icon={page.icon} />
            );
          })}
        </BottomNavigation>
      </Paper>
    </>
  );
}

export default BottomBar;
