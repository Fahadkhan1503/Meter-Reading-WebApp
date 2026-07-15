import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import CreateMeter from '../pages/CreateMeter';
import ProtectedRoute from './ProtectedRoute';
import Meters from '../pages/Meters';
import AddReading from '../pages/AddReading';
import History from '../pages/History';
import EditMeter from '../pages/EditMeter';


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
      <Route path="/readings/new" element={<ProtectedRoute><AddReading /></ProtectedRoute>} />
      <Route path="/meters/:id" element={<ProtectedRoute><History /></ProtectedRoute>}/>
      <Route path="/meters/:id/edit" element={<ProtectedRoute><EditMeter /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;