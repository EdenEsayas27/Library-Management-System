import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import BooksPage from "./pages/BooksPage";
import BorrowReturnPage from "./pages/BorrowReturnPage";
import MembersPage from "./pages/MembersPage";
import StaffPage from "./pages/StaffPage";
import ReportsPage from "./pages/ReportsPage";
import GenresPage from "./pages/GenresPage";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="books" element={<BooksPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="borrows" element={<BorrowReturnPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="genres" element={<GenresPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
