import { Alert } from "@mui/material";
import useNotificationMessageStore from "../../stores/useNotificationMessageStore.js";
import Conditional from "./Conditional.js";

const NotificationMessage = () => {
  const open = useNotificationMessageStore((state) => state.open);
  const message = useNotificationMessageStore((state) => state.message);

  return (
    <Conditional condition={open}>
      <Alert severity="error">{message}</Alert>
    </Conditional>
  );
};

export default NotificationMessage;
