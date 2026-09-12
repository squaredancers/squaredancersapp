import CampaignIcon from "@mui/icons-material/CampaignRounded";
import CelebrationIcon from "@mui/icons-material/CelebrationRounded";
import ChecklistRtlIcon from "@mui/icons-material/ChecklistRtl";
import RegistrantIcon from "@mui/icons-material/Groups";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import LocationIcon from "@mui/icons-material/LocationPin";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import SchoolIcon from "@mui/icons-material/SchoolRounded";
import SummarizeIcon from "@mui/icons-material/Summarize";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import usePageStore, { Pages } from "../../stores/usePageStore.js";

const mainListItems = [
  { text: Pages.Home, icon: <HomeRoundedIcon /> },
  { text: Pages.Users, icon: <PeopleRoundedIcon /> },
  { text: Pages.Events, icon: <CelebrationIcon /> },
  { text: Pages.Callers, icon: <CampaignIcon /> },
  { text: Pages.Locations, icon: <LocationIcon /> },
  { text: Pages.ClassInfo, icon: <SchoolIcon /> },
  { text: Pages.Classes, icon: <SchoolIcon /> },
  { text: Pages.Registrants, icon: <RegistrantIcon /> },
  { text: Pages.ClassLists, icon: <ChecklistRtlIcon /> },
  { text: Pages.Reports, icon: <SummarizeIcon /> },
];

const secondaryListItems = [
  //{ text: "Settings", icon: <SettingsRoundedIcon /> },
  { text: "About", icon: <InfoRoundedIcon /> },
];

export default function MenuContent() {
  const page = usePageStore((state) => state.page);

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              selected={item.text === page}
              onClick={() => {
                usePageStore.getState().setPage(item.text);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
