import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { loginUser, googleLogin, clearError } from '../../redux/slices/authSlice';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import bg3 from '/bg-3.png';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector(state => state.auth);
  const [showError, setShowError] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (data) => {
    setShowError(false);
    const result = await dispatch(loginUser({ ...data, isAdmin: isAdminLogin }));
    if (result.meta.requestStatus === 'fulfilled') {
      if (isAdminLogin && result.payload.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } else {
      setShowError(true);
    }
  };

  const handleGoogleLogin = async () => {
    setShowError(false);
    const result = await dispatch(googleLogin());
    if (result.meta.requestStatus === 'fulfilled') {
      navigate(from, { replace: true });
    } else {
      setShowError(true);
    }
  };

  return (
    <div className="min-h-screen bg-black bg-no-repeat bg-cover bg-center flex items-center justify-center px-4 sm:px-6 lg:px-8" style={{ backgroundImage: `url(${bg3})` }}>
      <motion.div 
        className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="px-6 py-8 sm:p-10">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your {isAdminLogin ? 'admin' : ''} account
            </p>
          </div>

          {showError && error && (
            <motion.div 
              className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center">
                <FiAlertCircle className="text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button 
                onClick={() => {
                  setShowError(false);
                  dispatch(clearError());
                }}
                className="text-xs text-red-700 underline mt-1"
              >
                Dismiss
              </button>
            </motion.div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 flex justify-center items-center"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : `Sign in as ${isAdminLogin ? 'Admin' : 'User'}`}
              </button>
            </div>

            {isAdminLogin && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setIsAdminLogin(!isAdminLogin)}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  Switch to User Login
                </button>
              </div>
            )}
          </form>

          {!isAdminLogin && (
            <>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <FcGoogle className="h-5 w-5 mr-2" />
                    Google
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                    Sign up
                  </Link>
                </p>
              </div>

              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setIsAdminLogin(!isAdminLogin)}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  Switch to Admin Login
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;