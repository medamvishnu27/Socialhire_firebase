import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchMentors } from '../redux/slices/mentorsSlice';
import { FiUser, FiSearch, FiFilter, FiStar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import bg3 from '/bg-3.png';

const Mentors = () => {
  const dispatch = useDispatch();
  const { mentors, loading } = useSelector(state => state.mentors);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    expertise: '',
    availability: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchMentors());
  }, [dispatch]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      expertise: '',
      availability: '',
    });
    setSearchTerm('');
  };

  const handleBookSession = (mentor) => {
    if (mentor.topmate) {
      // Use a more secure way to open external links
      const link = document.createElement('a');
      link.href = mentor.topmate;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error('Mentor has not set up their booking link yet');
    }
  };

  // Get unique expertise areas for filter
  const expertiseAreas = [...new Set(mentors.map(mentor => mentor.expertise))];

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         mentor.expertise.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.bio.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesExpertise = filters.expertise === '' || mentor.expertise === filters.expertise;
    const matchesAvailability = filters.availability === '' || mentor.availability.includes(filters.availability);
    
    return matchesSearch && matchesExpertise && matchesAvailability;
  });

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
    <div className="min-h-screen bg-black bg-no-repeat bg-cover bg-center py-12" style={{ backgroundImage: `url(${bg3})` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-white">Book a Mentor</h1>
          <p className="mt-2 text-lg text-gray-300">Connect with industry experts for guidance and career advice</p>
        </motion.div>
        
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-2/3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search mentors by name, expertise, or keywords"
                value={searchTerm}
                onChange={handleSearchChange}
                className="input-field pl-10 py-3"
              />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 w-full md:w-auto"
            >
              <FiFilter className="mr-2" /> {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
          
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 p-4 bg-white rounded-md shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="expertise" className="block text-sm font-medium text-gray-700 mb-1">
                    Expertise
                  </label>
                  <select
                    id="expertise"
                    name="expertise"
                    value={filters.expertise}
                    onChange={handleFilterChange}
                    className="input-field"
                  >
                    <option value="">All Expertise</option>
                    {expertiseAreas.map((expertise, index) => (
                      <option key={index} value={expertise}>{expertise}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
                    Availability
                  </label>
                  <select
                    id="availability"
                    name="availability"
                    value={filters.availability}
                    onChange={handleFilterChange}
                    className="input-field"
                  >
                    <option value="">Any Availability</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Weekends">Weekends</option>
                    <option value="Evenings">Evenings</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="text-primary-600 hover:text-primary-800 font-medium"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FiUser className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No mentors found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
            <div className="mt-6">
              <button
                onClick={resetFilters}
                className="text-primary-600 hover:text-primary-800 font-medium"
              >
                Reset all filters
              </button>
            </div>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredMentors.map((mentor) => (
              <motion.div 
                key={mentor.id} 
                className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 shadow-lg"
                variants={itemVariants}
              >
                <div className="flex items-center mb-4">
                  <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 mr-4">
                    {mentor.profileImage ? (
                      <img 
                        src={mentor.profileImage} 
                        alt={mentor.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-600">
                        <FiUser size={32} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{mentor.name}</h3>
                    <p className="text-primary-400">{mentor.expertise}</p>
                  </div>
                </div>
                
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <FiStar 
                      key={i}
                      className={`h-4 w-4 ${i < mentor.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-300">{mentor.rating.toFixed(1)}</span>
                </div>
                
                <p className="text-sm text-gray-300 mb-4 line-clamp-3">
                  {mentor.bio}
                </p>
                
                <div className="text-sm text-gray-300 mb-4">
                  <p><strong>Experience:</strong> {mentor.experience} years</p>
                  <p><strong>Availability:</strong> {mentor.availability}</p>
                  <p><strong>Session Fee:</strong> ${mentor.sessionFee}/hour</p>
                </div>
                
                <button 
                  onClick={() => handleBookSession(mentor)}
                  className={`btn-primary w-full ${!mentor.topmate ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {mentor.topmate ? 'Book a Session' : 'Booking Not Available'}
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Mentors;