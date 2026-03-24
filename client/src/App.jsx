import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext";
import DashboardLayout from "./components/layout/DashboardLayout";

// Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardPage from "./pages/user/DashboardPage";
import ElectionsPage from "./pages/user/ElectionsPage";
import VotingPage from "./pages/user/VotingPage";
import ResultsPage from "./pages/user/ResultsPage";
import TransactionsPage from "./pages/user/TransactionsPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import CreateElectionPage from "./pages/admin/CreateElectionPage";
import ManageElectionsPage from "./pages/admin/ManageElectionsPage";
import AddCandidatesPage from "./pages/admin/AddCandidatesPage";
import AddAdminPage from "./pages/admin/AddAdminPage";
import LandingPage from "./pages/LandingPage";

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* User routes */}
          <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="elections" element={<ElectionsPage />} />
            <Route path="elections/:id/vote" element={<VotingPage />} />
            <Route path="elections/:id/results" element={<ResultsPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<PrivateRoute adminOnly><DashboardLayout /></PrivateRoute>}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="elections/create" element={<CreateElectionPage />} />
            <Route path="elections/manage" element={<ManageElectionsPage />} />
            <Route path="add-admin" element={<AddAdminPage />} />
            <Route path="elections/:id/candidates" element={<AddCandidatesPage />} />
            <Route path="elections/:id/results" element={<ResultsPage />} />
          </Route>
        </Routes>
      </WalletProvider>
    </AuthProvider>
  );
}
