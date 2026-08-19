import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import { useState } from "react";
import { CallerPayments } from "./CallerPayments.js";

const reportIDs = ["CALLERS"];

export const ReportTabs = () => {
  const [selectedTab, setSelectedTab] = useState(reportIDs[0]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
  };

  return (
    <TabContext value={selectedTab}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <TabList onChange={handleChange}>
          <Tab label="Caller payments" value={reportIDs[0]} />
        </TabList>
      </Box>
      <TabPanel value={reportIDs[0]}>
        <CallerPayments />
      </TabPanel>
    </TabContext>
  );
};
