import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs, createBlog, updateBlog, deleteBlog } from '../../redux/slices/blogsSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit, FiTrash2, FiX, FiPlus } from 'react-icons/fi';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { storage, auth } from '../../firebase/config';

const BlogCrud = () => {
  const dispatch = useDispatch();
  const { blogs = [], loading = false, error = null } = useSelector((state) => state.blogs || {});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    image: '',
    author: '',
    date: new Date().toISOString().split('T')[0], // Set to current date
    mainContent: '',
    subheadings: [],
    conclusion: '',
    faqs: [],
  });
  const [faqInput, setFaqInput] = useState({ question: '', answer: '' });
  const [subheadingInput, setSubheadingInput] = useState({ subheading: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setSubmissionError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }
      
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setSubmissionError('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      setSubmissionError(null);
    }
  };

  const handleFaqChange = (e) => {
    setFaqInput({ ...faqInput, [e.target.name]: e.target.value });
  };

  const handleSubheadingChange = (e) => {
    setSubheadingInput({ ...subheadingInput, [e.target.name]: e.target.value });
  };

  const addFaq = () => {
    if (faqInput.question.trim() && faqInput.answer.trim()) {
      setFormData({ ...formData, faqs: [...formData.faqs, { ...faqInput }] });
      setFaqInput({ question: '', answer: '' });
    } else {
      alert('Please fill in both question and answer fields');
    }
  };

  const addSubheading = () => {
    if (subheadingInput.subheading.trim() && subheadingInput.description.trim()) {
      setFormData({ ...formData, subheadings: [...formData.subheadings, { ...subheadingInput }] });
      setSubheadingInput({ subheading: '', description: '' });
    } else {
      alert('Please fill in both subheading and description fields');
    }
  };

  const removeFaq = (index) => {
    const newFaqs = formData.faqs.filter((_, i) => i !== index);
    setFormData({ ...formData, faqs: newFaqs });
  };

  const removeSubheading = (index) => {
    const newSubheadings = formData.subheadings.filter((_, i) => i !== index);
    setFormData({ ...formData, subheadings: newSubheadings });
  };

  const uploadImage = async (file) => {
    if (!currentUser) {
      throw new Error('You must be logged in to upload images.');
    }

    try {
      const fileExt = file.name.split('.').pop().toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;
      const imageRef = ref(storage, filePath);
      await uploadBytes(imageRef, file);
      const publicUrl = await getDownloadURL(imageRef);
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      setSubmissionError('You must be logged in to create or edit a blog.');
      return;
    }

    if (!formData.title.trim() || !formData.author.trim() || !formData.date || !formData.mainContent.trim()) {
      setSubmissionError('Please fill in all required fields: Title, Author, Date, and Main Content');
      return;
    }

    let imageUrl = formData.image;
    setSubmissionError(null);

    if (selectedFile) {
      try {
        imageUrl = await uploadImage(selectedFile);
      } catch (error) {
        setSubmissionError(error.message || 'Failed to upload image. Please try again or check your permissions.');
        return;
      }
    }

    const contentJson = [];
    contentJson.push({
      type: 'main-content',
      text: formData.mainContent.trim(),
      id: `main-${Date.now()}`,
    });
    formData.subheadings.forEach((item, index) => {
      contentJson.push({
        type: 'subheading',
        text: item.subheading.trim(),
        id: `sub-${Date.now()}-${index}`,
      });
      contentJson.push({
        type: 'description',
        text: item.description.trim(),
        id: `desc-${Date.now()}-${index}`,
      });
    });

    const { id, mainContent, subheadings, ...blogData } = formData;
    const payload = {
      ...blogData,
      title: formData.title.trim(),
      author: formData.author.trim(),
      image: imageUrl,
      content: contentJson,
      conclusion: formData.conclusion.trim(),
      faqs: formData.faqs.filter(faq => faq.question.trim() && faq.answer.trim()),
      date: new Date(formData.date).toISOString(), // Use form input date
      created_at: serverTimestamp(), // Use server timestamp
    };

    try {
      if (formData.id) {
        await dispatch(updateBlog({ ...payload, id: formData.id })).unwrap();
      } else {
        await dispatch(createBlog(payload)).unwrap();
      }
      
      setIsModalOpen(false);
      resetForm();
      dispatch(fetchBlogs());
      
    } catch (error) {
      setSubmissionError(error.message || 'Failed to submit blog. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      title: '',
      image: '',
      author: '',
      date: new Date().toISOString().split('T')[0], // Reset to current date
      mainContent: '',
      subheadings: [],
      conclusion: '',
      faqs: [],
    });
    setFaqInput({ question: '', answer: '' });
    setSubheadingInput({ subheading: '', description: '' });
    setSelectedFile(null);
    setSubmissionError(null);
  };

  const handleEdit = (blog) => {
    let mainContent = '';
    const subheadings = [];
    let currentSubheading = null;

    if (Array.isArray(blog.content)) {
      blog.content.forEach((block) => {
        if (block.type === 'main-content' || block.type === 'paragraph') {
          mainContent = block.text || '';
        } else if (block.type === 'subheading') {
          currentSubheading = { subheading: block.text || '', description: '' };
        } else if (block.type === 'description' && currentSubheading) {
          currentSubheading.description = block.text || '';
          subheadings.push(currentSubheading);
          currentSubheading = null;
        }
      });
    }

    setFormData({
      id: blog.id,
      title: blog.title || '',
      image: blog.image || '',
      author: blog.author || '',
      date: blog.date ? new Date(blog.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      mainContent,
      subheadings,
      conclusion: blog.conclusion || '',
      faqs: Array.isArray(blog.faqs) ? blog.faqs : [],
    });
    setSelectedFile(null);
    setSubmissionError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await dispatch(deleteBlog(id)).unwrap();
        dispatch(fetchBlogs());
      } catch (error) {
        alert('Failed to delete blog. Please try again.');
      }
    }
  };

  const filteredBlogs = blogs.filter((blog) =>
    blog.title && typeof blog.title === 'string' && blog.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

 const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTime = (date) => {
    try {
      return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      return 'Invalid Time';
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
  };

  const rowVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    hover: { backgroundColor: '#f3f4f6', transition: { duration: 0.3 } },
  };

  const buttonVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    hover: { scale: 1.05, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Blog Management</h1>
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              disabled={!currentUser}
            >
              <FiPlus /> Create a Blog
            </motion.button>
          </div>
        </div>

        {!currentUser && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p>You must be logged in to create or manage blogs.</p>
          </div>
        )}

        {loading && <p className="text-gray-600 text-center">Loading blogs...</p>}
        {error && <p className="text-red-600 text-center">Error: {error}</p>}
        {!loading && !error && (
          <motion.div
            className="bg-white rounded-lg shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="p-4">
              <input
                type="text"
                placeholder="Search blogs by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-1/3 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 mb-4"
              />
            </div>

            {filteredBlogs.length === 0 ? (
              <p className="text-gray-600 text-center p-6">No articles are present.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-4 text-left text-gray-700 font-semibold">Title</th>
                      <th className="p-4 text-left text-gray-700 font-semibold">Author</th>
                      <th className="p-4 text-left text-gray-700 font-semibold">Date and Time</th>
                      <th className="p-4 text-left text-gray-700 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBlogs.map((blog) => (
                      <motion.tr
                        key={blog.id}
                        className="border-t border-gray-200"
                        variants={rowVariants}
                        initial="initial"
                        animate="animate"
                        whileHover="hover"
                      >
                        <td className="p-4 text-gray-800">{blog.title || 'Untitled'}</td>
                        <td className="p-4 text-gray-800">{blog.author || 'Unknown'}</td>
                        <td className="p-4 text-gray-800">
                          {blog.date ? formatDate(blog.date) : 'No date'} {blog.created_at ? formatTime(blog.created_at) : ''}
                        </td>
                        <td className="p-4 space-x-3">
                          {/* <motion.button
                            onClick={() => handleEdit(blog)}
                            className="text-purple-600 hover:text-purple-800 transition-colors"
                            variants={buttonVariants}
                            initial="initial"
                            animate="animate"
                            whileHover="hover"
                            disabled={!currentUser}
                          >
                            <FiEdit size={20} />
                          </motion.button> */}
                          <motion.button
                            onClick={() => handleDelete(blog.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            variants={buttonVariants}
                            initial="initial"
                            animate="animate"
                            whileHover="hover"
                            disabled={!currentUser}
                          >
                            <FiTrash2 size={20} />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
            />

            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div
                className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {formData.id ? 'Edit Blog' : 'Create a Blog'}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Title of the Article <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Enter article title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      maxLength={200}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Article Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    {selectedFile && (
                      <p className="mt-1 text-sm text-gray-600">
                        Selected file: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                    {formData.image && !selectedFile && formData.id && (
                      <p className="mt-1 text-sm text-gray-600">
                        Current image:{' '}
                        <a
                          href={formData.image}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:underline"
                        >
                          View
                        </a>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Date of Article Post <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Author Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="author"
                      placeholder="Enter author name"
                      value={formData.author}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Main Content of the Article <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="mainContent"
                      placeholder="Enter the main content of the article"
                      value={formData.mainContent}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Subheadings and Descriptions</label>
                    {formData.subheadings.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-2 mb-3 bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="flex-grow">
                          <input
                            type="text"
                            placeholder="Subheading"
                            value={item.subheading}
                            onChange={(e) => {
                              const newSubheadings = [...formData.subheadings];
                              newSubheadings[index].subheading = e.target.value;
                              setFormData({ ...formData, subheadings: newSubheadings });
                            }}
                            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                          />
                          <textarea
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => {
                              const newSubheadings = [...formData.subheadings];
                              newSubheadings[index].description = e.target.value;
                              setFormData({ ...formData, subheadings: newSubheadings });
                            }}
                            rows={3}
                            className="w-full border border-gray-300 p-2 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                          />
                        </div>
                        <button
                          onClick={() => removeSubheading(index)}
                          className="text-red-600 hover:text-red-800 self-end transition-colors"
                          type="button"
                        >
                          <FiTrash2 size={20} />
                        </button>
                      </div>
                    ))}
                    <div className="flex flex-col gap-2 mb-3">
                      <input
                        type="text"
                        name="subheading"
                        placeholder="Subheading"
                        value={subheadingInput.subheading}
                        onChange={handleSubheadingChange}
                        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                      <textarea
                        name="description"
                        placeholder="Description"
                        value={subheadingInput.description}
                        onChange={handleSubheadingChange}
                        rows={3}
                        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                    <motion.button
                      onClick={addSubheading}
                      type="button"
                      className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm transition-colors"
                      variants={buttonVariants}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                    >
                      <FiPlus size={16} /> Add Another Subheading
                    </motion.button>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Conclusion of the Article
                    </label>
                    <textarea
                      name="conclusion"
                      placeholder="Enter conclusion"
                      value={formData.conclusion}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">FAQ Section</label>
                    {formData.faqs.map((faq, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-2 mb-3 bg-gray-100 p-3 rounded-lg"
                      >
                        <div className="flex-grow">
                          <input
                            type="text"
                            placeholder="Question"
                            value={faq.question}
                            onChange={(e) => {
                              const newFaqs = [...formData.faqs];
                              newFaqs[index].question = e.target.value;
                              setFormData({ ...formData, faqs: newFaqs });
                            }}
                            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                          />
                          <textarea
                            placeholder="Answer"
                            value={faq.answer}
                            onChange={(e) => {
                              const newFaqs = [...formData.faqs];
                              newFaqs[index].answer = e.target.value;
                              setFormData({ ...formData, faqs: newFaqs });
                            }}
                            rows={2}
                            className="w-full border border-gray-300 p-2 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                          />
                        </div>
                        <button
                          onClick={() => removeFaq(index)}
                          className="text-red-600 hover:text-red-800 self-end transition-colors"
                          type="button"
                        >
                          <FiTrash2 size={20} />
                        </button>
                      </div>
                    ))}
                    <div className="flex flex-col gap-2 mb-3">
                      <input
                        type="text"
                        name="question"
                        placeholder="Question"
                        value={faqInput.question}
                        onChange={handleFaqChange}
                        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                      <textarea
                        name="answer"
                        placeholder="Answer"
                        value={faqInput.answer}
                        onChange={handleFaqChange}
                        rows={2}
                        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                    <motion.button
                      onClick={addFaq}
                      type="button"
                      className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm transition-colors"
                      variants={buttonVariants}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                    >
                      <FiPlus size={16} /> Add Another FAQ
                    </motion.button>
                  </div>

                  {submissionError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      {submissionError}
                    </div>
                  )}
                </div>

                <motion.button
                  onClick={handleSubmit}
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  variants={buttonVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  disabled={!currentUser}
                >
                  {formData.id ? 'Update Blog' : 'Add the Blog'}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogCrud;