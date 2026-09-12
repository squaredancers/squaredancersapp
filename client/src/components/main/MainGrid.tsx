import styled from "@emotion/styled";
import Box from "@mui/material/Box";
import { useEffect } from "react";
import usePageStore, { Pages } from "../../stores/usePageStore.js";
import useSettingsStore from "../../stores/useSettingsStore.js";
import Conditional from "../common/Conditional.js";
import CallerTable from "./pages/caller/CallerTable.js";
import ClassesTable from "./pages/classes/ClassesTable.js";
import ClassInfoTable from "./pages/classinfo/ClassinfoTable.js";
import ClassListsTable from "./pages/classLists/ClassListsTable.js";
import EventTable from "./pages/event/EventTable.js";
import { HomePage } from "./pages/home.js";
import LocationTable from "./pages/location/LocationTable.js";
import RegistrantTable from "./pages/registrants/registrantsTable.js";
import { ReportTabs } from "./pages/reports/ReportTabs.js";
import UserTable from "./pages/user/UsersTable.js";

const CenteredText = styled.div`
  display: flex;
  justify-content: center; /* Centers content horizontally */
  align-items: center; /* Centers content vertically */
  height: 40px;
  font-size: 25px;
  font-weight: bold;
  background: linear-gradient(
    to right,
    #e40303 0% 16.66%,
    /* Red */ #ff8c00 16.66% 33.33%,
    /* Orange */ #ffed00 33.33% 50%,
    /* Yellow */ #008026 50% 66.66%,
    /* Green */ #004cff 66.66% 83.33%,
    /* Blue */ #732982 83.33% 100% /* Violet */
  );
`;

const MainGrid = () => {
  const page = usePageStore((state) => state.page);
  const UserPage = UserTable.MainUserTableComponent;
  const CallerPage = CallerTable.MainCallerTableComponent;
  const LocationPage = LocationTable.MainLocationTableComponent;
  const ClassInfoPage = ClassInfoTable.MainClassInfoTableComponent;
  const ClassesPage = ClassesTable.MainClassTableComponent;
  const EventPage = EventTable.MainEventTableComponent;
  const RegistrantPage = RegistrantTable.MainRegistrantTableComponent;
  const ClassListsPage = ClassListsTable.MainClassListsTableComponent;

  useEffect(() => {
    // Load settings
    useSettingsStore.getState().loadSettings();
  }, []);

  return (
    <Box sx={{ width: "100%" }}>
      <CenteredText>
        <span>Triangle Squares</span>
      </CenteredText>
      <Conditional condition={page === Pages.Home}>
        <HomePage />
      </Conditional>

      <Conditional condition={page === Pages.Users}>
        <UserPage />
      </Conditional>

      <Conditional condition={page === Pages.Callers}>
        <CallerPage />
      </Conditional>

      <Conditional condition={page === Pages.ClassInfo}>
        <ClassInfoPage />
      </Conditional>

      <Conditional condition={page === Pages.Classes}>
        <ClassesPage />
      </Conditional>

      <Conditional condition={page === Pages.Locations}>
        <LocationPage />
      </Conditional>

      <Conditional condition={page === Pages.Events}>
        <EventPage />
      </Conditional>

      <Conditional condition={page === Pages.Registrants}>
        <RegistrantPage />
      </Conditional>

      <Conditional condition={page === Pages.ClassLists}>
        <ClassListsPage />
      </Conditional>

      <Conditional condition={page === Pages.Reports}>
        <ReportTabs />
      </Conditional>
    </Box>
  );
};

export default MainGrid;
