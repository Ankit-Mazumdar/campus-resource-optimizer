import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { createRoot } from "react-dom/client";

import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import { ResourceProvider } from "./context/ResourceContext";
import { AvailabilityProvider } from "./context/AvailabilityContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import MyBookings from "./pages/MyBookings";
import Resources from "./pages/Resources";
import Reports from "./pages/Reports";
import AvailabilityManagement from "./pages/AvailabilityManagement";
import AdminManagement from "./pages/AdminManagement";
import NotFound from "./pages/NotFound";
import { Navigation } from "./components/Navigation";
import { Sidebar, MobileNav } from "./components/Sidebar";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient();

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Layout for authenticated pages
function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">{children}</div>
          <MobileNav />
        </main>
      </div>
    </div>
  );
}

const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />

    {/* Protected routes */}
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <AuthenticatedLayout>
            <Dashboard />
          </AuthenticatedLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/my-bookings"
      element={
        <ProtectedRoute>
          <AuthenticatedLayout>
            <MyBookings />
          </AuthenticatedLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/resources"
      element={
        <ProtectedRoute>
          <AuthenticatedLayout>
            <Resources />
          </AuthenticatedLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/reports"
      element={
        <ProtectedRoute>
          <AuthenticatedLayout>
            <Reports />
          </AuthenticatedLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/availability"
      element={
        <ProtectedRoute>
          <AuthenticatedLayout>
            <AvailabilityManagement />
          </AuthenticatedLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/resources"
      element={
        <ProtectedRoute>
          <AuthenticatedLayout>
            <AdminManagement />
          </AuthenticatedLayout>
        </ProtectedRoute>
      }
    />

    {/* Catch-all */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <BookingProvider>
            <ResourceProvider>
              <AvailabilityProvider>
                <AppRoutes />
              </AvailabilityProvider>
            </ResourceProvider>
          </BookingProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
