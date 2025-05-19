import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { setUser } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiMapPin, FiBook, FiAward, FiBriefcase, FiLink, FiEdit } from 'react-icons/fi';
import bgh3 from '/bg-3.png';

const Profile = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isEditMode, setIsEditMode] = useState(true);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.uid) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          setValue('displayName', userData.displayName || '');
          setValue('email', userData.email || '');
          setValue('phone', userData.phone || '');
          setValue('location', userData.location || '');
          setValue('education', userData.education || '');
          setValue('skills', userData.skills || '');
          setValue('experience', userData.experience || '');
          setValue('portfolio', userData.portfolio || '');
          setValue('bio', userData.bio || '');
          
          if (userData.profileImage) {
            setPreviewImage(userData.profileImage);
          }
          setProfileData(userData);
        }
      }
    };
    
    fetchUserProfile();
  }, [user, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      let profileImageUrl = previewImage;
      
      if (profileImage) {
        const reader = new FileReader();
        profileImageUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(profileImage);
        });
      }
      
      const updatedData = {
        ...data,
        profileImage: profileImageUrl,
        updatedAt: new Date().toISOString(),
      };
      
      await updateDoc(doc(db, 'users', user.uid), updatedData);
      dispatch(setUser({ ...user, ...updatedData }));
      setProfileData(updatedData); // Ensure profileData is updated with all fields
      setIsEditMode(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ProfileDisplay = () => (
    <div className="p-6 relative">
      <button 
        onClick={() => setIsEditMode(true)}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
      >
        <FiEdit size={24} />
      </button>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 flex flex-col items-center">
          <div className="w-48 h-48 rounded-full overflow-hidden bg-gray-200 mb-4">
            {profileData?.profileImage ? (
              <img 
                src={profileData.profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <FiUser size={64} />
              </div>
            )}
          </div>
        </div>

        <div className="w-full md:w-2/3 space-y-6">
          <h2 className="text-2xl font-bold">{profileData?.displayName || 'No Name Provided'}</h2>
          <div className="space-y-4">
            {profileData?.bio && (
              <p className="text-gray-600">{profileData.bio}</p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileData?.email && (
                <div className="flex items-center">
                  <FiMail className="mr-2 text-gray-400" />
                  <span>{profileData.email}</span>
                </div>
              )}
              {profileData?.phone && (
                <div className="flex items-center">
                  <FiPhone className="mr-2 text-gray-400" />
                  <span>{profileData.phone}</span>
                </div>
              )}
              {profileData?.location && (
                <div className="flex items-center">
                  <FiMapPin className="mr-2 text-gray-400" />
                  <span>{profileData.location}</span>
                </div>
              )}
            </div>

            {profileData?.education && (
              <div>
                <h3 className="font-semibold flex items-center">
                  <FiBook className="mr-2" /> Education
                </h3>
                <p className="mt-1 text-gray-600 whitespace-pre-wrap">{profileData.education}</p>
              </div>
            )}

            {profileData?.skills && (
              <div>
                <h3 className="font-semibold flex items-center">
                  <FiAward className="mr-2" /> Skills
                </h3>
                <p className="mt-1 text-gray-600 whitespace-pre-wrap">{profileData.skills}</p>
              </div>
            )}

            {profileData?.experience && (
              <div>
                <h3 className="font-semibold flex items-center">
                  <FiBriefcase className="mr-2" /> Experience
                </h3>
                <p className="mt-1 text-gray-600 whitespace-pre-wrap">{profileData.experience}</p>
              </div>
            )}

            {profileData?.portfolio && (
              <div>
                <h3 className="font-semibold flex items-center">
                  <FiLink className="mr-2" /> Portfolio
                </h3>
                <a 
                  href={profileData.portfolio} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline"
                >
                  {profileData.portfolio}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const ProfileForm = () => (
    <div className="p-6 bg-transparent">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <div className="relative w-48 h-48 rounded-full overflow-hidden bg-gray-200 mb-4">
              {previewImage ? (
                <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FiUser size={64} />
                </div>
              )}
            </div>
            <label className="btn-secondary cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="hidden" 
              />
              Change Photo
            </label>
          </div>
          
          <div className="w-full md:w-2/3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="displayName"
                    type="text"
                    {...register('displayName', { required: 'Name is required' })}
                    className="input-field pl-10"
                  />
                </div>
                {errors.displayName && (
                  <p className="mt-1 text-sm text-red-600">{errors.displayName.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="input-field pl-10"
                    disabled
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    className="input-field pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="location"
                    type="text"
                    {...register('location')}
                    className="input-field pl-10"
                    placeholder="City, Country"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                rows={3}
                {...register('bio')}
                className="input-field"
                placeholder="Tell us about yourself"
              />
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-xl font-semibold mb-6">Professional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                Education
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiBook className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="education"
                  rows={3}
                  {...register('education')}
                  className="input-field pl-10"
                  placeholder="Your educational background"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                Skills
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiAward className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="skills"
                  rows={3}
                  {...register('skills')}
                  className="input-field pl-10"
                  placeholder="Your skills (e.g., JavaScript, React, Node.js)"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                Experience
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiBriefcase className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="experience"
                  rows={3}
                  {...register('experience')}
                  className="input-field pl-10"
                  placeholder="Your work experience"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-1">
                Portfolio/Website
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLink className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="portfolio"
                  type="url"
                  {...register('portfolio')}
                  className="input-field pl-10"
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-3 px-8 flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-black py-12 bg-cover bg-center bg-no-repeat"  style={{ backgroundImage: `url(${bgh3})` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <div className=" bg-black bg-cover bg-center px-6 py-8 text-white"  style={{ backgroundImage: `url(${bgh3})` }}>
            <h1 className="text-3xl font-bold">Digital Profile</h1>
            <p className="mt-2">Manage your professional information</p>
          </div>
          
          {isEditMode ? <ProfileForm /> : <ProfileDisplay />}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;