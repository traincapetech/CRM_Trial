// src/routes/AllRoutes.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import LoadingSpinner from "../components/ui/LoadingSpinner";

// Lazy load heavy components to reduce initial bundle size
const SalesTrackingPage = lazy(() => import("../pages/SalesTrackingPage"));
const AdminUsersPage = lazy(() => import("../pages/AdminUsersPage"));
const AdminReportsPage = lazy(() => import("../pages/AdminReportsPage"));
const ProspectsPage = lazy(() => import("../pages/ProspectsPage"));
const InvoiceManagementPage = lazy(() => import("../pages/InvoiceManagementPage"));
const LeadSalesSheet = lazy(() => import("../pages/LeadSalesSheet"));
const DocumentManagementPage = lazy(() => import("../pages/DocumentManagementPage"));
const AdminActivityLogsPage = lazy(() => import("../pages/AdminActivityLogsPage"));

// Keep frequently used components as regular imports
import HomePage from "../pages/HomePage";
import ITHomePage from "../pages/ITHomePage";
import Login from "../components/Auth/Login";
import SignUp from "../components/Auth/SignUp";
import CustomerSignUp from "../components/Auth/CustomerSignUp";
import LeadsPage from "../pages/LeadsPage";
import SalesPage from "../pages/SalesPage";
import SalesCreatePage from "../pages/SalesCreatePage";
import ProfilePage from "../pages/ProfilePage";
import TokenDebugPage from "../pages/TokenDebugPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import AdminLeadsPage from "../pages/AdminLeadsPage";
import AdminImportPage from "../pages/AdminImportPage";
import AdminActivityPage from "../pages/AdminActivityPage";
import ProtectedRoute from "./ProtectedRoute";
import ForgotPassword from "../components/Auth/ForgotPassword";
import LeadSalesUpdatePage from "../pages/LeadSalesUpdatePage";
import TutorialsPage from "../pages/TutorialsPage";
import TaskManagementPage from "../pages/TaskManagementPage";
import RepeatCustomersPage from "../pages/RepeatCustomersPage";
import CountriesPage from "../pages/Countries";
import ManagementContactsPage from "../pages/ManagementContactsPage";
import TestNotificationsPage from "../pages/TestNotificationsPage";
import CustomerDashboard from "../pages/CustomerDashboard";
import EmployeeManagementPage from "../pages/EmployeeManagementPage";
import ManagerDashboard from "../pages/ManagerDashboard";
import StripeInvoicePage from "../pages/StripeInvoicePage";
import ITDashboardPage from "../pages/ITDashboardPage";
import { useAuth } from "../context/AuthContext";

const RootRoute = () => {
  const { user } = useAuth();
  if (user && ["IT Manager", "IT Intern", "IT Permanent"].includes(user.role)) {
    return <ITHomePage />;
  }
  return <HomePage />;
};

// Removed Router wrapper so it can be used at a higher level
const AllRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<Login />} />
      <Route path="/customer-signup" element={<CustomerSignUp />} />
      <Route path="/debug" element={<TokenDebugPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/tutorials" element={<TutorialsPage />} />
      <Route path="/management-contacts" element={<ManagementContactsPage />} />
      <Route path="/countries" element={<CountriesPage />} />
    
      {/* Customer Dashboard */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={["Customer"]}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      {/* Signup Route */}
      <Route
        path="/signup"
        element={<SignUp />}
      />
      {/* IT Department Dashboard */}
      <Route
        path="/it"
        element={
          <ProtectedRoute allowedRoles={["IT Manager", "IT Intern", "IT Permanent", "Admin"]}>
            <ITDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Test Notifications */}
      <Route
        path="/test-notifications"
        element={
          <ProtectedRoute allowedRoles={["Sales Person", "Lead Person", "Manager", "Admin"]}>
            <TestNotificationsPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/leads"
        element={
          <ProtectedRoute allowedRoles={["Sales Person", "Lead Person", "Manager", "Admin"]}>
            <LeadsPage />
          </ProtectedRoute>
        }
      />
      
      {/* Sales Routes */}
      <Route
        path="/sales"
        element={
          <ProtectedRoute allowedRoles={["Sales Person", "Manager", "Admin"]}>
            <SalesPage />
          </ProtectedRoute>
        }
      />
      
      {/* Sales Tracking Route */}
      <Route
        path="/sales-tracking"
        element={
          <ProtectedRoute allowedRoles={["Sales Person", "Manager", "Admin"]}>
            <Suspense fallback={<LoadingSpinner />}>
              <SalesTrackingPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      
      {/* Sales Create Route */}
      <Route
        path="/create-sale"
        element={
          <ProtectedRoute allowedRoles={["Sales Person", "Manager", "Admin"]}>
            <SalesCreatePage />
          </ProtectedRoute>
        }
      />
      
      {/* Invoice Management Route */}
      <Route
        path="/invoices"
        element={
          <ProtectedRoute allowedRoles={["Sales Person", "Manager", "Admin"]}>
            <Suspense fallback={<LoadingSpinner />}>
              <InvoiceManagementPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      
      {/* Task Management Route */}
      <Route
        path="/tasks"
        element={
          <ProtectedRoute allowedRoles={["Sales Person", "Lead Person", "Manager", "Admin", "IT Manager", "IT Intern", "IT Permanent"]}>
            <TaskManagementPage />
          </ProtectedRoute>
        }
      />
      
      {/* Profile Route */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["Sales Person", "Lead Person", "Manager", "Admin", "Customer", "HR", "Employee", "IT Manager", "IT Intern", "IT Permanent"]}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      
      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Lead Person"]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <Suspense fallback={<LoadingSpinner />}>
              <AdminUsersPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/leads"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminLeadsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/import"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminImportPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <Suspense fallback={<LoadingSpinner />}>
              <AdminReportsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/activity"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
            <AdminActivityPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/activity-logs"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <Suspense fallback={<LoadingSpinner />}>
              <AdminActivityLogsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/repeat-customers"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
            <RepeatCustomersPage />
          </ProtectedRoute>
        }
      />
      
      <Route 
        path="/lead-sales-sheet" 
        element={
          <ProtectedRoute allowedRoles={['Lead Person', 'Manager', 'Admin']}>
            <Suspense fallback={<LoadingSpinner />}>
              <LeadSalesSheet />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/update-sales" 
        element={
          <ProtectedRoute allowedRoles={['Lead Person', 'Manager', 'Admin']}>
            <LeadSalesUpdatePage />
          </ProtectedRoute>
        } 
      />

      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRoles={["Manager", "Admin"]}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route 
        path="/prospects" 
        element={
          <ProtectedRoute allowedRoles={['Sales Person', 'Manager', 'Admin']}>
            <Suspense fallback={<LoadingSpinner />}>
              <ProspectsPage />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/employees" 
        element={
          <ProtectedRoute allowedRoles={['HR', 'Manager', 'Admin', 'IT Manager']}>
            <EmployeeManagementPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/documents" 
        element={
          <ProtectedRoute allowedRoles={['Sales Person', 'Lead Person', 'Manager', 'Admin', 'HR', 'Employee', 'IT Manager', 'IT Intern', 'IT Permanent']}>
            <Suspense fallback={<LoadingSpinner />}>
              <DocumentManagementPage />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/invoice-management" 
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager', 'Sales']}>
            <Suspense fallback={<LoadingSpinner />}>
              <InvoiceManagementPage />
            </Suspense>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/stripe-invoices" 
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager', 'Sales']}>
            <StripeInvoicePage />
          </ProtectedRoute>
        } 
      />

      {/* Catch-all route */}
      <Route path="*" element={<RootRoute />} />
    </Routes>
  );
};

export default AllRoutes;