import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FiEdit, FiTrash2, FiSearch, FiX, FiBarChart2, FiBook, FiVideo, FiBriefcase } from 'react-icons/fi';
import { BiSolidUpArrow, BiSolidDownArrow } from 'react-icons/bi';
import { useForm } from 'react-hook-form';
import { setupStudentCollections } from '../../utils/setupCollections';

const StudentsCRUD = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentStats, setStudentStats] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'users'), where('role', '==', 'student'));
      const querySnapshot = await getDocs(q);
      
      const studentsList = [];
      querySnapshot.forEach((doc) => {
        studentsList.push({ id: doc.id, ...doc.data() });
      });
      
      setStudents(studentsList);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentStats = async (studentId) => {
    try {
      setLoading(true);

      await setupStudentCollections(studentId);
      
      const jobAppsQuery = query(collection(db, 'jobApplications'), where('studentId', '==', studentId));
      const jobAppsSnapshot = await getDocs(jobAppsQuery);
      const jobApplications = [];
      
      for (const doc of jobAppsSnapshot.docs) {
        const appData = doc.data();
        const jobDoc = await getDoc(doc(db, 'jobs', appData.jobId));
        if (jobDoc.exists()) {
          jobApplications.push({
            id: doc.id,
            ...appData,
            job: jobDoc.data()
          });
        }
      }

      const webinarQuery = query(collection(db, 'webinarAttendance'), where('studentId', '==', studentId));
      const webinarSnapshot = await getDocs(webinarQuery);
      const webinarAttendance = [];
      
      for (const doc of webinarSnapshot.docs) {
        const attendanceData = doc.data();
        const webinarDoc = await getDoc(doc(db, 'webinars', attendanceData.webinarId));
        if (webinarDoc.exists()) {
          webinarAttendance.push({
            id: doc.id,
            ...attendanceData,
            webinar: webinarDoc.data()
          });
        }
      }

      const sessionsQuery = query(collection(db, 'sessions'), where('studentId', '==', studentId));
      const sessionsSnapshot = await getDocs(sessionsQuery);
      const sessions = [];
      
      for (const doc of sessionsSnapshot.docs) {
        const sessionData = doc.data();
        const mentorDoc = await getDoc(doc(db, 'mentors', sessionData.mentorId));
        if (mentorDoc.exists()) {
          sessions.push({
            id: doc.id,
            ...sessionData,
            mentor: mentorDoc.data()
          });
        }
      }

      const stats = {
        totalJobApplications: jobApplications.length,
        jobApplicationsByStatus: jobApplications.reduce((acc, app) => {
          acc[app.status] = (acc[app.status] || 0) + 1;
          return acc;
        }, {}),
        totalWebinarsAttended: webinarAttendance.length,
        totalSessionsAttended: sessions.length,
        averageSessionRating: sessions.reduce((acc, session) => acc + (session.rating || 0), 0) / (sessions.filter(s => s.rating).length || 1),
        recentActivity: [...jobApplications, ...webinarAttendance, ...sessions]
          .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
          .slice(0, 5),
        jobApplications,
        webinarAttendance,
        sessions
      };

      setStudentStats(stats);
    } catch (error) {
      console.error('Error fetching student statistics:', error);
      setStudentStats(null);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (student = null) => {
    setCurrentStudent(student);
    
    if (student) {
      setValue('displayName', student.displayName || '');
      setValue('email', student.email || '');
      setValue('phone', student.phone || '');
      setValue('location', student.location || '');
      setValue('education', student.education || '');
      setValue('skills', student.skills || '');
    } else {
      reset();
    }
    
    setIsModalOpen(true);
  };

  const openStatsModal = async (student) => {
    setCurrentStudent(student);
    setIsStatsModalOpen(true);
    await fetchStudentStats(student.id);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentStudent(null);
    reset();
  };

  const closeStatsModal = () => {
    setIsStatsModalOpen(false);
    setCurrentStudent(null);
    setStudentStats(null);
  };

  const onSubmit = async (data) => {
    try {
      if (currentStudent) {
        await updateDoc(doc(db, 'users', currentStudent.id), {
          ...data,
          updatedAt: new Date().toISOString(),
        });
        
        setStudents(students.map(student => 
          student.id === currentStudent.id 
            ? { ...student, ...data, updatedAt: new Date().toISOString() } 
            : student
        ));
      }
      
      closeModal();
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'users', id));
        setStudents(students.filter(student => student.id !== id));
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleResetSort = () => {
    setSortConfig({ key: null, direction: null });
  };

  const filteredStudents = students
    .filter(student => 
      (student.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.location || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortConfig.key) return 0;

      if (sortConfig.key === 'displayName') {
        const nameA = (a.displayName || '').toLowerCase();
        const nameB = (b.displayName || '').toLowerCase();
        if (sortConfig.direction === 'ascending') {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      }

      if (sortConfig.key === 'createdAt') {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        if (sortConfig.direction === 'ascending') {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      }

      return 0;
    });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Students</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
        
        {loading && !isStatsModalOpen ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No students found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      Student
                      <div className="ml-2 flex flex-col">
                        <button onClick={() => handleSort('displayName')} onDoubleClick={handleResetSort}>
                          <BiSolidUpArrow className={`h-2 w-2 ${sortConfig.key === 'displayName' && sortConfig.direction === 'ascending' ? 'text-gray-900' : 'text-gray-400'}`} />
                        </button>
                        <button onClick={() => handleSort('displayName')} onDoubleClick={handleResetSort}>
                          <BiSolidDownArrow className={`h-2 w-2 ${sortConfig.key === 'displayName' && sortConfig.direction === 'descending' ? 'text-gray-900' : 'text-gray-400'}`} />
                        </button>
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Education
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skills
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      Joined
                      <div className="ml-2 flex flex-col">
                        <button onClick={() => handleSort('createdAt')} onDoubleClick={handleResetSort}>
                          <BiSolidUpArrow className={`h-2 w-2 ${sortConfig.key === 'createdAt' && sortConfig.direction === 'ascending' ? 'text-gray-900' : 'text-gray-400'}`} />
                        </button>
                        <button onClick={() => handleSort('createdAt')} onDoubleClick={handleResetSort}>
                          <BiSolidDownArrow className={`h-2 w-2 ${sortConfig.key === 'createdAt' && sortConfig.direction === 'descending' ? 'text-gray-900' : 'text-gray-400'}`} />
                        </button>
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          {student.profileImage ? (
                            <img 
                              src={student.profileImage} 
                              alt={student.displayName} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-600">
                              {student.displayName?.charAt(0).toUpperCase() || 'S'}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.displayName}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                          {student.phone && (
                            <div className="text-sm text-gray-500">{student.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.location || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2">{student.education || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2">{student.skills || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openStatsModal(student)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                        title="View Statistics"
                      >
                        <FiBarChart2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openModal(student)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <FiEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Edit Modal */}
      {isModalOpen && currentStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-purple-gradient px-6 py-4 text-white flex justify-between items-center">
              <h3 className="text-xl font-semibold">Edit Student</h3>
              <button onClick={closeModal} className="text-white hover:text-gray-200">
                <FiX className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    {...register('displayName', { required: 'Name is required' })}
                    className="input-field"
                  />
                  {errors.displayName && (
                    <p className="mt-1 text-sm text-red-600">{errors.displayName.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="input-field"
                    disabled
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    {...register('location')}
                    className="input-field"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                    Education
                  </label>
                  <textarea
                    id="education"
                    rows={3}
                    {...register('education')}
                    className="input-field"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                    Skills
                  </label>
                  <textarea
                    id="skills"
                    rows={3}
                    {...register('skills')}
                    className="input-field"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Update Student
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Statistics Modal */}
      {isStatsModalOpen && currentStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-purple-gradient px-6 py-4 text-white flex justify-between items-center">
              <h3 className="text-xl font-semibold">Student Statistics - {currentStudent.displayName}</h3>
              <button onClick={closeStatsModal} className="text-white hover:text-gray-200">
                <FiX className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <svg className="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : studentStats ? (
                <div className="space-y-8">
                  {/* Student Profile Section */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start">
                      <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {currentStudent.profileImage ? (
                          <img 
                            src={currentStudent.profileImage} 
                            alt={currentStudent.displayName} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-600 text-2xl font-bold">
                            {currentStudent.displayName?.charAt(0).toUpperCase() || 'S'}
                          </div>
                        )}
                      </div>
                      <div className="ml-6">
                        <h2 className="text-2xl font-bold text-gray-900">{currentStudent.displayName}</h2>
                        <p className="text-gray-600">{currentStudent.email}</p>
                        {currentStudent.phone && (
                          <p className="text-gray-600 mt-1">{currentStudent.phone}</p>
                        )}
                        {currentStudent.location && (
                          <p className="text-gray-600 mt-1">{currentStudent.location}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Statistics Cards - Matching Previous Styling */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Job Applications Card */}
                    <div className="bg-primary-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-primary-100 text-primary-600">
                          <FiBriefcase className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Job Applications</p>
                          <p className="text-2xl font-semibold text-gray-900">{studentStats.totalJobApplications}</p>
                        </div>
                      </div>
                    </div>

                    {/* Webinars Attended Card */}
                    <div className="bg-primary-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-primary-100 text-primary-600">
                          <FiVideo className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Webinars Attended</p>
                          <p className="text-2xl font-semibold text-gray-900">{studentStats.totalWebinarsAttended}</p>
                        </div>
                      </div>
                    </div>

                    {/* Mentoring Sessions Card */}
                    <div className="bg-primary-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-primary-100 text-primary-600">
                          <FiBook className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Mentoring Sessions</p>
                          <p className="text-2xl font-semibold text-gray-900">{studentStats.totalSessionsAttended}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
                    {studentStats.recentActivity.length === 0 ? (
                      <p className="text-gray-500">No recent activity</p>
                    ) : (
                      <ul className="space-y-3">
                        {studentStats.recentActivity.map((activity, index) => (
                          <li key={index} className="flex items-start">
                            {activity.jobId && (
                              <FiBriefcase className="h-5 w-5 text-primary-600 mt-0.5 mr-3 flex-shrink-0" />
                            )}
                            {activity.webinarId && (
                              <FiVideo className="h-5 w-5 text-primary-600 mt-0.5 mr-3 flex-shrink-0" />
                            )}
                            {activity.mentorId && (
                              <FiBook className="h-5 w-5 text-primary-600 mt-0.5 mr-3 flex-shrink-0" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {activity.jobId && `Applied for ${activity.job?.title}`}
                                {activity.webinarId && `Attended ${activity.webinar?.title}`}
                                {activity.mentorId && `Session with ${activity.mentor?.name}`}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {formatDate(activity.createdAt || activity.date)}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Job Applications */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Job Applications</h4>
                    {studentStats.jobApplications.length === 0 ? (
                      <p className="text-gray-500">No job applications</p>
                    ) : (
                      <div className="space-y-4">
                        {studentStats.jobApplications.map((app) => (
                          <div key={app.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                            <h5 className="font-medium text-gray-900">{app.job?.title}</h5>
                            <p className="text-sm text-gray-600">{app.job?.company}</p>
                            <div className="flex items-center mt-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                app.status === 'applied' ? 'bg-blue-100 text-blue-800' :
                                app.status === 'interviewed' ? 'bg-yellow-100 text-yellow-800' :
                                app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">
                                {formatDate(app.appliedAt)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mentoring Sessions */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Mentoring Sessions</h4>
                    {studentStats.sessions.length === 0 ? (
                      <p className="text-gray-500">No mentoring sessions</p>
                    ) : (
                      <div className="space-y-4">
                        {studentStats.sessions.map((session) => (
                          <div key={session.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                            <h5 className="font-medium text-gray-900">
                              Session with {session.mentor?.name}
                            </h5>
                            <p className="text-sm text-gray-600">{session.mentor?.expertise}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {formatDate(session.date)}
                              </span>
                              {session.rating && (
                                <span className="flex items-center text-yellow-500">
                                  <span className="text-xs font-medium mr-1">Rating:</span>
                                  {session.rating.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No statistics available for this student.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StudentsCRUD;