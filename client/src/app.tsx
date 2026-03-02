import Dashboard from "./components/main/Dashboard.js";
import SignIn from "./components/signin/SignIn.js";
import Conditional from "./components/common/Conditional.js";
import useUserStore from "./stores/useUserStore.js";
import { useEffect } from "react";
import useRolesStore from "./stores/useRolesStore.js";

export const App = () => {
  let token = useUserStore((state) => state.token);

  token = "sometoken";

  useEffect(() => {
    useRolesStore.getState().loadRoles();
  }, []);

  return (
    <>
      <Conditional condition={token.length === 0}>
        <SignIn />;
      </Conditional>
      <Conditional condition={token.length > 0}>
        <Dashboard />
      </Conditional>
    </>
  );
};
