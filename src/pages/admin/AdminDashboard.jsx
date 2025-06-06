import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiBriefcase, FiCalendar, FiUser, FiMenu, FiX, FiChevronLeft, FiChevronRight, FiBook } from 'react-icons/fi';

// Admin Components
import MentorsCRUD from './MentorsCRUD';
import StudentsCRUD from './StudentsCRUD';
import JobsCRUD from './JobsCRUD';
import SessionsCRUD from './SessionsCRUD';
import AdminOverview from './AdminOverview';
import PlacementCRUD from './PlacementCRUD';
import BlogCrud from './BlogCrud';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Quick action handlers
  const handleAddMentor = () => {
    navigate('/admin/mentors');
  };

  const handlePostJob = () => {
    navigate('/admin/jobs');
  };

  const handleScheduleWebinar = () => {
    navigate('/admin/sessions');
  };

  const handleViewStudents = () => {
    navigate('/admin/students');
  };

  const handleManagePlacement = () => {
    navigate('/admin/placement');
  };
  const handleManageBlog=()=>{
    navigate('/admin/blog')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-20 left-4 z-20">
        <button
          onClick={toggleMobileSidebar}
          className="p-2 rounded-md bg-white shadow-md text-gray-700 hover:text-primary-600 focus:outline-none"
        >
          {isMobileSidebarOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
        </button>
      </div>

      {/* Desktop Sidebar Toggle */}
      <button
        onClick={toggleSidebar}
        className="hidden lg:flex fixed top-15 left-4 z-20 p-2 bg-white shadow-md rounded-full text-gray-700 hover:text-primary-600"
      >
        {isSidebarOpen ? <FiChevronLeft size={25} /> : <FiChevronRight size={25} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-10 w-64 bg-white shadow-lg pt-20
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isSidebarOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full'}`}
      >
        <div className="px-4 py-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>

          <nav className="space-y-1">
            <Link
              to="/admin"
              onClick={closeMobileSidebar}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                isActive('/admin') &&
                !isActive('/admin/mentors') &&
                !isActive('/admin/students') &&
                !isActive('/admin/jobs') &&
                !isActive('/admin/sessions') &&
                !isActive('/admin/placement')&&
                !isActive('/admin/blog') 
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiUser className="mr-3 h-5 w-5" />
              Overview
            </Link>

            <Link
              to="/admin/mentors"
              onClick={closeMobileSidebar}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                isActive('/admin/mentors')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiUsers className="mr-3 h-5 w-5" />
              Mentors
            </Link>

            <Link
              to="/admin/students"
              onClick={closeMobileSidebar}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                isActive('/admin/students')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiUsers className="mr-3 h-5 w-5" />
              Students
            </Link>

            <Link
              to="/admin/jobs"
              onClick={closeMobileSidebar}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                isActive('/admin/jobs')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiBriefcase className="mr-3 h-5 w-5" />
              Jobs
            </Link>

            <Link
              to="/admin/sessions"
              onClick={closeMobileSidebar}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                isActive('/admin/sessions')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiCalendar className="mr-3 h-5 w-5" />
              Sessions
            </Link>

            <Link
              to="/admin/placement"
              onClick={closeMobileSidebar}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                isActive('/admin/placement')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiBook className="mr-3 h-5 w-5" />
              Placement
            </Link>

            <Link
              to="/admin/blog"
              onClick={closeMobileSidebar}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                isActive('/admin/blog')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiBook className="mr-3 h-5 w-5" />
              Blog Mangament
            </Link>
            
          </nav>
        </div>
      </div>

      {/* Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-0 lg:hidden"
            onClick={closeMobileSidebar}
          ></motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-0'} pt-20`}>
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Routes>
              <Route
                path="/"
                element={
                  <AdminOverview
                    onAddMentor={handleAddMentor}
                    onPostJob={handlePostJob}
                    onScheduleWebinar={handleScheduleWebinar}
                    onViewStudents={handleViewStudents}
                    onManagePlacement={handleManagePlacement}
                  />
                }
              />
              <Route path="/mentors" element={<MentorsCRUD />} />
              <Route path="/students" element={<StudentsCRUD />} />
              <Route path="/jobs" element={<JobsCRUD />} />
              <Route path="/sessions" element={<SessionsCRUD />} />
              <Route path="/placement" element={<PlacementCRUD />} />
              <Route path="/blog" element={<BlogCrud />} />
            </Routes>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;