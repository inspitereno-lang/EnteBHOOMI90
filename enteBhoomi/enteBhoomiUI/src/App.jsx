import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Admin screens
import { AdminLogin } from './screens/admin/adminLogin';
import AdminDashboard from './screens/admin/adminDashboard';

const AdminProtectedRoute = ({ children }) => {
  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />
      {/* Redirect all other routes to admin dashboard */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default App;
