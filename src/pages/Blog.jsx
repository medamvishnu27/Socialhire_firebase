import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs } from '../redux/slices/blogsSlice';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const bg3 = 'src/assets/bg-3.png'; // Replace with your actual background image URL

const Blog = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { blogs = [], loading = false, error = null } = useSelector((state) => state.blogs || {});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  const handleCardClick = (id) => {
    navigate(`/blog/${id}`);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredBlogs = blogs
    .filter((blog) => blog.title?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aMatch = a.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const bMatch = b.title?.toLowerCase().includes(searchTerm.toLowerCase());
      return bMatch - aMatch;
    });

  if (loading) return <div className="text-black text-center">Loading blogs...</div>;
  if (error) return <div className="text-black text-center">Error loading blogs: {error}</div>;

  return (
    <>
      <div 
        className="text-white bg-black bg-no-repeat bg-cover bg-center" 
        style={{ backgroundImage: `url(${bg3})` }}
      >
        <div className="max-w-7xl mx-auto p-4">
          <h1 className="text-4xl my-2 text-center">
            Get actionable tips and updates on <br />
            <span className="text-4xl font-bold">Career, Exams & Events at Inspira</span>
          </h1>
          <p className="text-center my-1 text-xl text-orange-300 font-semibold">Or enter a keyword to search</p>
          <div className="flex justify-center mb-8">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search Blog"
                className="w-full px-3 py-3 rounded-full bg-white text-primary-600 placeholder-gray-500 focus:outline-none"
                value={searchTerm}
                onChange={handleSearch}
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-300 min-h-screen">
        <div className="max-w-7xl mx-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredBlogs.length === 0 ? (
              <p className="text-gray-600 text-center col-span-3">No blogs found.</p>
            ) : (
              filteredBlogs.map((blog) => {
                const mainContentBlock = blog.content?.find(
                  (block) => block.type === 'main-content' || block.type === 'paragraph'
                );
                const contentText = mainContentBlock?.text || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...';
                const limitedContent = contentText.length > 200 ? contentText.substring(0, 199) + '...' : contentText;

                return (
                  <div
                    key={blog.id}
                    className="bg-white rounded-3xl shadow-md cursor-pointer overflow-hidden"
                    onClick={() => handleCardClick(blog.id)}
                  >
                    <div className="relative">
                      <motion.img 
                        src={blog.image} 
                        alt={blog.title} 
                        className="w-full object-cover transition-transform duration-300"
                        whileHover={{ scale: 1.1 }}
                      />
                    </div>
                    <div className="p-4">
                      <h2 className="text-xl font-bold mb-2 text-gray-800">{blog.title}</h2>
                      <p className="text-gray-800 text-sm mb-4">{limitedContent}</p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(blog.id);
                        }} 
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        READ MORE →
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;