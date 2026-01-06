import { Route } from "react-router-dom";

import { ManageQuestionsRoute } from "../pages/ManageQuestionsRoute";
import { ManageQuizSessionsRoute } from "../pages/ManageQuizSessionsRoute";

export const quizRoutes = (
  <>
    <Route path="/admin/quizzes/:quizId" element={<ManageQuestionsRoute />} />
    <Route
      path="/admin/quizzes/:quizId/sessions"
      element={<ManageQuizSessionsRoute />}
    />
  </>
);
