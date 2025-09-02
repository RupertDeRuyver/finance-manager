import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";

function NavBar() {
    return (
      <>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography
                align="center"
                variant="h6"
                component="div"
                sx={{ flexGrow: 1 }}
              >
                Finance Manager
              </Typography>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                color="inherit"
              >
                <SettingsIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
        </Box>
      </>
    );
}

export default NavBar;