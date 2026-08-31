import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppLayout } from "../components/layout/AppLayout";
import BatchDetailPage from "../pages/academics/batches/BatchDetailPage";
import SectionDetailPage from "../pages/academics/sections/SectionDetailPage";
import SubjectsPage from "../pages/academics/subjects/SubjectsPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import SchoolAttendancePage from "../pages/dashboard/attendance/SchoolAttendancePage";
import TuitionAttendancePage from "../pages/dashboard/attendance/TuitionAttendancePage";
import GuardiansPage from "../pages/dashboard/guardians/GuardiansPage";
import StaffPage from "../pages/dashboard/staff/StaffPage";
import StudentsPage from "../pages/dashboard/students/StudentsPage";
import StudentDetailPage from "../pages/dashboard/students/StudentDetailPage";
import { CreateOrganizationPage } from "../pages/onboarding/CreateOrganizationPage";
import StaffDetailPage from "../pages/people/staff/StaffDetailPage";
import FeeHeadsList from "../features/finance/fee-heads/FeeHeadsList";
import FeePlansList from "../features/finance/fee-plans/FeePlansList";
import PaymentsList from "../features/finance/payments/PaymentsList";

import { ProtectedRoute } from "./ProtectedRoute";
import { PublicOnlyRoute } from "./PublicOnlyRoute";

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
      { path: "/dashboard/students/:id", element: <StudentDetailPage /> },
      {
        path: "/dashboard/attendance/school",
        element: <SchoolAttendancePage />,
      },
      {
        path: "/dashboard/attendance/tuition",
        element: <TuitionAttendancePage />,
      },
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
      { path: "/dashboard/finance/fee-heads", element: <FeeHeadsList /> },
      { path: "/dashboard/finance/fee-plans", element: <FeePlansList /> },
      { path: "/dashboard/finance/payments", element: <PaymentsList /> },
      { path: "subjects", element: <SubjectsPage /> },
    ],
  },
]);
