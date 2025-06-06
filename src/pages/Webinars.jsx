import { useEffect, useCallback, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { subscribeToWebinarsAndSessions, clearWebinars } from '../redux/slices/webinarsSlice';
import { FiCalendar, FiClock, FiUser, FiVideo, FiExternalLink, FiBriefcase, FiShare2, FiCheck, FiCopy } from 'react-icons/fi';
import bg3 from '/bg-3.png';

const Webinars = () => {
  const dispatch = useDispatch();
  const { items: allItems, loading, error } = useSelector((state) => state.webinars);
  const { user } = useSelector((state) => state.auth);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [copiedItemId, setCopiedItemId] = useState(null);
  const unsubscribeRef = useRef({ webinars: null, sessions: null });

  useEffect(() => {
    const unsubscribePromise = dispatch(subscribeToWebinarsAndSessions());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => {
      clearInterval(timer);
      if (unsubscribeRef.current.webinars) unsubscribeRef.current.webinars();
      if (unsubscribeRef.current.sessions) unsubscribeRef.current.sessions();
      dispatch(clearWebinars());
    };
  }, [dispatch]);

  useEffect(() => {
    const setupSubscriptions = async () => {
      const { unwrap } = dispatch(subscribeToWebinarsAndSessions());
      await unwrap();
    };
    setupSubscriptions();
  }, [dispatch]);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const getSessionStatus = useCallback((item) => {
    if (item.type === 'webinar') {
      return new Date(item.date) >= currentTime ? { text: 'Register', disabled: false, link: item.sessionLink } : { text: 'Ended', disabled: true };
    }

    const sessionDate = new Date(item.date);
    const [hours, minutes] = item.time.split(':');
    sessionDate.setHours(parseInt(hours), parseInt(minutes));
    const sessionEndTime = new Date(sessionDate);
    sessionEndTime.setMinutes(sessionEndTime.getMinutes() + (item.duration || 60));

    switch (item.status) {
      case 'cancelled':
        return { text: 'Cancelled', disabled: true };
      case 'completed':
        return { text: 'Completed', disabled: true };
      case 'pending':
        return { text: 'Pending', disabled: true };
      case 'scheduled':
      default:
        if (currentTime < sessionDate) return { text: 'Register', disabled: false, link: item.sessionLink };
        if (currentTime >= sessionDate && currentTime <= sessionEndTime) {
          return { text: 'Join Now', disabled: !item.sessionLink, link: item.sessionLink };
        }
        return { text: 'Ended', disabled: true };
    }
  }, [currentTime]);

  const processItems = useCallback(() => {
    const userSessions = allItems.filter(
      (item) => item.type === 'session' && (item.student?.id === user?.uid || item.forAllStudents)
    );
    const webinars = allItems.filter((item) => item.type === 'webinar');
    const combined = [...webinars, ...userSessions];

    const upcoming = combined.filter((item) => {
      const status = getSessionStatus(item);
      return status.text === 'Register' || status.text === 'Join Now';
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    const past = combined.filter((item) => {
      const status = getSessionStatus(item);
      return status.text === 'Ended' || status.text === 'Completed';
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    return { upcoming, past };
  }, [allItems, user?.uid, currentTime, getSessionStatus]);

  const { upcoming, past } = processItems();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  const handleJoinSession = (link) => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else {
      alert('No session link available for this event.');
    }
  };

  const generateShareableLink = (item) => {
    // Return the sessionLink provided during session/webinar creation
    return item.sessionLink || '';
  };

  const handleShare = async (item) => {
    const shareUrl = generateShareableLink(item);
    if (!shareUrl) {
      alert('No session link available to share for this event.');
      return;
    }

    const shareData = {
      title: item.type === 'webinar' ? item.title : `Session with ${item.mentor?.name}`,
      text: item.type === 'webinar' ? item.description : item.topic,
      url: shareUrl
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        setCopiedItemId(item.id);
        setTimeout(() => setCopiedItemId(null), 2000);
      }
    } catch (error) {
      // Fallback to clipboard if share fails
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedItemId(item.id);
        setTimeout(() => setCopiedItemId(null), 2000);
      } catch (clipboardError) {
        // Final fallback - create a temporary input to copy
        const tempInput = document.createElement('input');
        tempInput.value = shareUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        setCopiedItemId(item.id);
        setTimeout(() => setCopiedItemId(null), 2000);
      }
    }
  };

  const canShare = (item) => {
    const status = getSessionStatus(item);
    return status.text === 'Register' || status.text === 'Join Now';
  };

  const renderItem = (item) => (
    <motion.div
      key={item.id}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      variants={itemVariants}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className="text-primary-600 font-semibold">{formatDate(item.date)}</span>
          <div className="flex items-center space-x-2">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                item.type === 'webinar'
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {item.type === 'webinar' ? item.category : 'Mentoring Session'}
            </span>
            {canShare(item) && (
              <button
                onClick={() => handleShare(item)}
                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                title="Share session"
              >
                {copiedItemId === item.id ? (
                  <FiCheck className="h-4 w-4 text-green-600" />
                ) : (
                  <FiShare2 className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {item.type === 'webinar' ? item.title : `Session with ${item.mentor?.name}`}
        </h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {item.type === 'webinar' ? item.description : item.topic}
        </p>

        <div className="space-y-2 text-sm text-gray-500 mb-6">
          <div className="flex items-center">
            <FiUser className="mr-2 h-4 w-4" />
            {item.type === 'webinar' ? item.presenter : item.mentor?.name}
          </div>

          {item.type === 'session' && item.mentor?.expertise && (
            <div className="flex items-center">
              <FiBriefcase className="mr-2 h-4 w-4" />
              {item.mentor.expertise}
            </div>
          )}

          <div className="flex items-center">
            <FiClock className="mr-2 h-4 w-4" />
            {item.time} ({item.duration || 60} min)
          </div>

          <div className="flex items-center">
            <FiVideo className="mr-2 h-4 w-4" />
            {item.type === 'webinar' ? item.platform : 'Online Session'}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => handleJoinSession(getSessionStatus(item).link)}
            className={`btn-primary w-full ${getSessionStatus(item).disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={getSessionStatus(item).disabled}
          >
            {getSessionStatus(item).text}
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderFeaturedItem = (item) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary-900 to-primary-700 rounded-xl shadow-xl overflow-hidden"
    >
      <div className="md:flex">
        <div className="md:w-2/3 p-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-block bg-white bg-opacity-20 rounded-full px-3 py-1 text-sm font-semibold">
              Featured
            </span>
            {canShare(item) && (
              <button
                onClick={() => handleShare(item)}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                title="Share session"
              >
                {copiedItemId === item.id ? (
                  <FiCheck className="h-5 w-5" />
                ) : (
                  <FiShare2 className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {item.type === 'webinar' ? item.title : `Session with ${item.mentor?.name}`}
          </h2>
          <p className="mb-6 text-white text-opacity-90">
            {item.type === 'webinar' ? item.description : item.topic}
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center">
              <FiCalendar className="mr-2" />
              {formatDate(item.date)}
            </div>
            <div className="flex items-center">
              <FiClock className="mr-2" />
              {item.time}
            </div>
            <div className="flex items-center">
              <FiUser className="mr-2" />
              {item.type === 'webinar' ? item.presenter : item.mentor?.name}
            </div>
            <div className="flex items-center">
              <FiVideo className="mr-2" />
              {item.type === 'webinar' ? item.platform : 'Online Session'}
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => handleJoinSession(getSessionStatus(item).link)}
              className={`bg-white text-primary-700 hover:bg-gray-100 font-bold py-3 px-6 rounded-md ${
                getSessionStatus(item).disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={getSessionStatus(item).disabled}
            >
              {getSessionStatus(item).text}
            </button>
          </div>
        </div>
        <div className="md:w-1/3 bg-primary-800 flex items-center justify-center p-8">
          <div className="text-center text-white">
            <div className="text-5xl font-bold mb-2">{new Date(item.date).getDate()}</div>
            <div className="text-xl">{new Date(item.date).toLocaleString('default', { month: 'long' })}</div>
            <div className="mt-6 inline-block bg-primary-600 rounded-full px-4 py-2">Upcoming</div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black bg-no-repeat bg-cover bg-center py-12" style={{ backgroundImage: `url(${bg3})` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-100">Events & Sessions</h1>
          <p className="mt-2 text-lg text-gray-300">Enhance your skills with live sessions and events</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-10 w-10 text-primary-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-red-600">
            <p>Error loading events: {error}</p>
          </div>
        ) : (
          <div className="space-y-12">
            {upcoming.length > 0 && renderFeaturedItem(upcoming[0])}

            <div>
              <h2 className="text-2xl font-bold text-gray-100 mb-6">Upcoming Events</h2>
              {upcoming.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No upcoming events</h3>
                  <p className="mt-1 text-gray-500">Check back later for new events.</p>
                </div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {upcoming.slice(1).map(renderItem)}
                </motion.div>
              )}
            </div>

            {past.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-100 mb-6">Past Events</h2>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {past.map(renderItem)}
                </motion.div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Webinars;