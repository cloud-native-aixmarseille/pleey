import { Route } from "react-router-dom";

import { LoginRoute } from "./LoginRoute";
import { RegisterRoute } from "./RegisterRoute";

export const authRoutes = (
  <>
    <Route path="/auth/login" element={<LoginRoute />} />
    <Route path="/auth/register" element={<RegisterRoute />} />
  </>
);
