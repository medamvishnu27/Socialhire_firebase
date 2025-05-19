import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FiEdit, FiTrash2, FiPlus, FiX, FiSearch, FiCalendar, FiClock, FiLink } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const SessionsCRUD = () => {
  const [sessions, setSessions] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const PAGE_SIZE = 10;
  const forAllStudents = watch('forAllStudents'); // Watch the checkbox state

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchMentors(), fetchStudents(), fetchSessions()]);
    } catch (error) {
      toast.error('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMentors = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'mentors'));
      const mentorsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMentors(mentorsList);
    } catch (error) {
      toast.error('Failed to fetch mentors');
    }
  };

  const fetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(query(collection(db, 'users')));
      const studentsList = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.role === 'student');
      setStudents(studentsList);
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  const fetchSessions = async (isLoadMore = false) => {
    try {
      setLoading(true);
      const sessionsQuery = query(
        collection(db, 'sessions'),
        orderBy('date', 'desc'),
        limit(PAGE_SIZE),
        ...(isLoadMore && lastDoc ? [startAfter(lastDoc)] : [])
      );

      const querySnapshot = await getDocs(sessionsQuery);
      const sessionsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setSessions(prev => isLoadMore ? [...prev, ...sessionsList] : sessionsList);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      toast.error('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (session = null) => {
    setCurrentSession(session);
    
    if (session) {
      setValue('mentorId', session.mentor?.id || '');
      setValue('studentId', session.student?.id || '');
      setValue('forAllStudents', session.forAllStudents || false);
      setValue('date', formatDateForInput(session.date));
      setValue('time', session.time);
      setValue('duration', session.duration);
      setValue('topic', session.topic);
      setValue('status', session.status);
      setValue('notes', session.notes || '');
      setValue('sessionLink', session.sessionLink || '');
    } else {
      reset({
        mentorId: '',
        studentId: '',
        forAllStudents: false,
        date: '',
        time: '',
        duration: 60,
        topic: '',
        status: 'scheduled',
        notes: '',
        sessionLink: '',
      });
    }
    
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentSession(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      const mentor = mentors.find(m => m.id === data.mentorId);
      const student = data.forAllStudents ? null : students.find(s => s.id === data.studentId);

      const sessionData = {
        ...data,
        mentor: { id: mentor.id, name: mentor.name, expertise: mentor.expertise },
        ...(data.forAllStudents 
          ? { forAllStudents: true, student: null }
          : { forAllStudents: false, student: student ? { id: student.id, name: student.displayName } : null }),
        updatedAt: new Date().toISOString(),
      };

      if (currentSession) {
        await updateDoc(doc(db, 'sessions', currentSession.id), sessionData);
        toast.success('Session updated successfully');
      } else {
        sessionData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'sessions'), sessionData);
        toast.success('Session scheduled successfully');
      }

      await fetchSessions();
      closeModal();
    } catch (error) {
      toast.error('Failed to save session');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await deleteDoc(doc(db, 'sessions', id));
        setSessions(sessions.filter(session => session.id !== id));
        toast.success('Session deleted successfully');
      } catch (error) {
        toast.error('Failed to delete session');
      }
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSessions = sessions.filter(session => 
    (session.mentor?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (session.student?.name || session.forAllStudents ? 'All Students' : '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (session.topic || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Sessions</h1>
        <button onClick={() => openModal()} className="btn-primary flex items-center">
          <FiPlus className="mr-2" /> Schedule Session
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {loading && !sessions.length ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-10 w-10 text-primary-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No sessions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{session.mentor?.name || 'Unknown Mentor'}</div>
                      <div className="text-sm text-gray-500">{session.mentor?.expertise || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {session.forAllStudents ? 'All Students' : session.student?.name || 'No Student Assigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(session.date)}</div>
                      <div className="text-sm text-gray-500">{session.time} ({session.duration} min)</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2">{session.topic}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(session.status)}`}>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openModal(session)} className="text-primary-600 hover:text-primary-900 mr-3">
                        <FiEdit className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDelete(session.id)} className="text-red-600 hover:text-red-900">
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {hasMore && (
              <div className="p-4 text-center">
                <button
                  onClick={() => fetchSessions(true)}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-purple-gradient px-6 py-4 text-white flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                {currentSession ? 'Edit Session' : 'Schedule New Session'}
              </h3>
              <button onClick={closeModal} className="text-white hover:text-gray-200">
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="mentorId" className="block text-sm font-medium text-gray-700 mb-1">Mentor *</label>
                  <select
                    id="mentorId"
                    {...register('mentorId', { required: 'Mentor is required' })}
                    className="input-field"
                  >
                    <option value="">Select a mentor</option>
                    {mentors.map((mentor) => (
                      <option key={mentor.id} value={mentor.id}>
                        {mentor.name} - {mentor.expertise}
                      </option>
                    ))}
                  </select>
                  {errors.mentorId && <p className="mt-1 text-sm text-red-600">{errors.mentorId.message}</p>}
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <input
                      id="forAllStudents"
                      type="checkbox"
                      {...register('forAllStudents')}
                      className="h-4 w-4 text-primary-600 rounded"
                    />
                    <label htmlFor="forAllStudents" className="ml-2 text-sm font-medium text-gray-700">
                      Schedule for all students
                    </label>
                  </div>
                  <select
                    id="studentId"
                    {...register('studentId', { 
                      required: !forAllStudents && 'Student is required unless scheduled for all students'
                    })}
                    className="input-field"
                    disabled={forAllStudents}
                  >
                    <option value="">Select a student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.displayName} - {student.email}
                      </option>
                    ))}
                  </select>
                  {errors.studentId && <p className="mt-1 text-sm text-red-600">{errors.studentId.message}</p>}
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="date"
                      type="date"
                      {...register('date', { required: 'Date is required' })}
                      className="input-field pl-10"
                    />
                  </div>
                  {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                  <div className="relative">
                    <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="time"
                      type="time"
                      {...register('time', { required: 'Time is required' })}
                      className="input-field pl-10"
                    />
                  </div>
                  {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>}
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
                  <input
                    id="duration"
                    type="number"
                    min="15"
                    step="15"
                    {...register('duration', { 
                      required: 'Duration is required',
                      min: { value: 15, message: 'Minimum 15 minutes' }
                    })}
                    className="input-field"
                  />
                  {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>}
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    id="status"
                    {...register('status', { required: 'Status is required' })}
                    className="input-field"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="pending">Pending</option>
                  </select>
                  {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">Topic *</label>
                  <input
                    id="topic"
                    type="text"
                    {...register('topic', { required: 'Topic is required' })}
                    className="input-field"
                    placeholder="e.g., Career Guidance"
                  />
                  {errors.topic && <p className="mt-1 text-sm text-red-600">{errors.topic.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="sessionLink" className="block text-sm font-medium text-gray-700 mb-1">Session Link</label>
                  <div className="relative">
                    <FiLink className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="sessionLink"
                      type="url"
                      {...register('sessionLink')}
                      className="input-field pl-10"
                      placeholder="https://topmate.io/your_session_link"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    id="notes"
                    rows={3}
                    {...register('notes')}
                    className="input-field"
                    placeholder="Additional information"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">
                  {currentSession ? 'Update Session' : 'Schedule Session'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SessionsCRUD;