import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FiUsers, FiBriefcase, FiCalendar, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const AdminOverview = ({ onAddMentor, onPostJob, onScheduleWebinar, onViewStudents }) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalMentors: 0,
    totalJobs: 0,
    totalSessions: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get counts from collections
        const studentsSnapshot = await getDocs(collection(db, 'users'));
        const mentorsSnapshot = await getDocs(collection(db, 'mentors'));
        const jobsSnapshot = await getDocs(collection(db, 'jobs'));
        const sessionsSnapshot = await getDocs(collection(db, 'sessions'));
        
        setStats({
          totalStudents: studentsSnapshot.docs.filter(doc => doc.data().role === 'student').length,
          totalMentors: mentorsSnapshot.size,
          totalJobs: jobsSnapshot.size,
          totalSessions: sessionsSnapshot.size,
        });
        
        // Get recent activities
        const activitiesQuery = query(
          collection(db, 'activities'),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        
        const activitiesSnapshot = await getDocs(activitiesQuery);
        const activities = activitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setRecentActivities(activities);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <svg className="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="bg-white rounded-lg shadow-md p-6"
              variants={itemVariants}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <FiUsers className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Students</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <FiTrendingUp className="text-green-500 mr-1" />
                <span className="text-green-500 font-medium">12% increase</span>
                <span className="text-gray-500 ml-2">from last month</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-lg shadow-md p-6"
              variants={itemVariants}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <FiUsers className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Mentors</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalMentors}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <FiTrendingUp className="text-green-500 mr-1" />
                <span className="text-green-500 font-medium">8% increase</span>
                <span className="text-gray-500 ml-2">from last month</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-lg shadow-md p-6"
              variants={itemVariants}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <FiBriefcase className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Jobs</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalJobs}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <FiTrendingUp className="text-green-500 mr-1" />
                <span className="text-green-500 font-medium">15% increase</span>
                <span className="text-gray-500 ml-2">from last month</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-lg shadow-md p-6"
              variants={itemVariants}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <FiCalendar className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Booked Sessions</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalSessions}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <FiTrendingDown className="text-red-500 mr-1" />
                <span className="text-red-500 font-medium">3% decrease</span>
                <span className="text-gray-500 ml-2">from last month</span>
              </div>
            </motion.div>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div 
              className="bg-white rounded-lg shadow-md p-6"
              variants={itemVariants}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
              
              {recentActivities.length === 0 ? (
                <p className="text-gray-500">No recent activities found.</p>
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start">
                      <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 flex-shrink-0">
                        {activity.type === 'user' && <FiUsers className="h-4 w-4" />}
                        {activity.type === 'job' && <FiBriefcase className="h-4 w-4" />}
                        {activity.type === 'session' && <FiCalendar className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-lg shadow-md p-6"
              variants={itemVariants}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={onAddMentor}
                  className="bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium py-3 px-4 rounded-lg text-sm flex items-center justify-center transition-colors duration-200"
                >
                  <FiUsers className="mr-2" /> Add New Mentor
                </button>
                <button 
                  onClick={onPostJob}
                  className="bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium py-3 px-4 rounded-lg text-sm flex items-center justify-center transition-colors duration-200"
                >
                  <FiBriefcase className="mr-2" /> Post New Job
                </button>
                <button 
                  onClick={onScheduleWebinar}
                  className="bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium py-3 px-4 rounded-lg text-sm flex items-center justify-center transition-colors duration-200"
                >
                  <FiCalendar className="mr-2" /> Schedule Webinar
                </button>
                <button 
                  onClick={onViewStudents}
                  className="bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium py-3 px-4 rounded-lg text-sm flex items-center justify-center transition-colors duration-200"
                >
                  <FiUsers className="mr-2" /> View All Students
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminOverview;