import StudentsPage from "../pages/dashboard/students/StudentsPage";
import GuardiansPage from "../pages/dashboard/guardians/GuardiansPage";
import StaffPage from "../pages/dashboard/staff/StaffPage";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";
import { CreateOrganizationPage } from "../pages/onboarding/CreateOrganizationPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { AppLayout } from "../components/layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicOnlyRoute } from "./PublicOnlyRoute";
import SubjectsPage from "../pages/academics/subjects/SubjectsPage";
import SectionDetailPage from "../pages/academics/sections/SectionDetailPage";
import BatchDetailPage from "../pages/academics/batches/BatchDetailPage";
import StaffDetailPage from "../pages/people/staff/StaffDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/login",
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicOnlyRoute>
        <RegisterPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <PublicOnlyRoute>
        <ForgotPasswordPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <PublicOnlyRoute>
        <ResetPasswordPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/onboarding/create-organization",
    element: (
      <ProtectedRoute>
        <CreateOrganizationPage />
      </ProtectedRoute>
    ),
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/dashboard/students", element: <StudentsPage /> },
      { path: "/dashboard/guardians", element: <GuardiansPage /> },
      { path: "/dashboard/staff", element: <StaffPage /> },
      { path: "/dashboard/academics/subjects", element: <SubjectsPage /> },
      {
        path: "/dashboard/academics/sections/:id",
        element: <SectionDetailPage />,
      },
      {
        path: "/dashboard/academics/batches/:id",
        element: <BatchDetailPage />,
      },
      { path: "/dashboard/staff/:id", element: <StaffDetailPage /> },
      { path: "subjects", element: <SubjectsPage /> },
    ],
  },
]);
