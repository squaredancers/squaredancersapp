import { useEffect } from "react";
import Conditional from "./components/common/Conditional.js";
import Dashboard from "./components/main/Dashboard.js";
import SignIn from "./components/signin/SignIn.js";
import useFlagStore from "./stores/useFlagStore.js";
import useRolesStore from "./stores/useRolesStore.js";
import useUserStore from "./stores/useUserStore.js";

export const App = () => {
  const setFlags = useFlagStore((state) => state.setFlags);
  const token = useUserStore((state) => state.token);

  useEffect(() => {
    setFlags();
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
