import { Route } from "react-router-dom";

import { AdminRoute } from "../pages/AdminRoute";
import { OrganizationRoute } from "../pages/OrganizationRoute";

export const adminRoutes = (
  <>
    <Route path="/admin" element={<AdminRoute />} />
    <Route path="/admin/organization" element={<OrganizationRoute />} />
  </>
);
