import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import Header from "./Header.js";
import MainGrid from "./MainGrid.js";
import SideMenu from "./SideMenu.js";

export default function Dashboard(props: {}) {
  return (
    <>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: "auto",
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
              height: "calc( 100vh - 5px )",
            }}
          >
            <Header />
            <MainGrid />
          </Stack>
        </Box>
      </Box>
    </>
  );
}
