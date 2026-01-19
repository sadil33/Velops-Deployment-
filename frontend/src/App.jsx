import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Prerequisites from './pages/Prerequisites';
import Dashboard from './pages/Dashboard';
import IDMDeployment from './pages/IDMDeployment';
import ION from './pages/ION';
import SecurityRoles from './components/SecurityRoles';
import SidebarLayout from './components/SidebarLayout';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route path="/prerequisites" element={
            <ProtectedRoute>
              <Prerequisites />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <SidebarLayout />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/ai" element={
            <ProtectedRoute>
              <SidebarLayout />
            </ProtectedRoute>
          } />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
