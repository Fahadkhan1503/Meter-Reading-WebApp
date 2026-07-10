import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import CreateMeter from '../pages/CreateMeter';
import ProtectedRoute from './ProtectedRoute';
import Meters from '../pages/Meters';
// import MeterDetail from '../pages/MeterDetail';

/**
 * "/" sends the user to the right place once we know whether they're
 * logged in — avoids a hardcoded guess before auth has resolved.
 */
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/meters/new" element={<ProtectedRoute><CreateMeter /></ProtectedRoute>} />
      <Route path="/meters" element={<ProtectedRoute><Meters /></ProtectedRoute>} />
      {/* <Route path="/meters/:id" element={<ProtectedRoute><MeterDetail /></ProtectedRoute>} /> */}
      {/*
        /meters, /meters/new, /meters/:id, /readings/new don't exist yet —
        Dashboard and Sidebar already link to them, they'll just 404 to
        /login until those pages are built.
      */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;