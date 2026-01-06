import { Route } from "react-router-dom";

import { ProfileRoute } from "../pages/ProfileRoute";

export const profileRoutes = (
  <Route path="/profile" element={<ProfileRoute />} />
);
