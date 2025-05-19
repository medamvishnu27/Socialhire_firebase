import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Pages
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Profile from '../pages/Profile';
import Jobs from '../pages/Jobs';
import Mentors from '../pages/Mentors';
import Webinars from '../pages/Webinars';
import Placement from '../pages/Placement';
import ResumeBuilder from '../pages/ResumeBuilder';
import CodeLabs from '../pages/CodeLabs';
import AdminDashboard from '../pages/admin/AdminDashboard';
import About from '../pages/About';
import ContactUs from "../Pages/ContactUs"
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/jobs" 
        element={
          <ProtectedRoute>
            <Jobs />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/mentors" 
        element={
          <ProtectedRoute>
            <Mentors />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/webinars" 
        element={
          <ProtectedRoute>
            <Webinars />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/placement" 
        element={
          <ProtectedRoute>
            <Placement />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/resume-builder" 
        element={
          <ProtectedRoute>
            <ResumeBuilder />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/codelabs" 
        element={
          <ProtectedRoute>
            <CodeLabs />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
      path='/About'
      element={
        <ProtectedRoute>
          <About/>
        </ProtectedRoute>
      }
      />
      <Route
      path='/Contactus'
      element={
        <ProtectedRoute>
          <ContactUs/>
        </ProtectedRoute>

      }
      />
      
      
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;