import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogById, fetchRelatedBlogs } from '../redux/slices/blogsSlice';
import { fetchComments, addComment } from '../redux/slices/commentsSlice';
import { motion } from 'framer-motion';
import { FiCalendar, FiUser, FiMail, FiShare2 } from 'react-icons/fi';
import { FaTwitter, FaFacebook, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { Helmet } from 'react-helmet';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center text-red-600 py-10">
          Something went wrong: {this.state.error.message}
          <br />
          <button
            className="mt-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const BlogDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentBlog = null, relatedBlogs = [], loading = false, error = null } = useSelector((state) => state.blogs || {});
  const { comments = [], loading: commentsLoading = false, error: commentsError = null } = useSelector((state) => state.comments || {});
  const [commentText, setCommentText] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const contentRef = useRef(null);
  const sidebarRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(null);
  const [shareFeedback, setShareFeedback] = useState('');

  useEffect(() => {
    dispatch(fetchBlogById(id));
    dispatch(fetchRelatedBlogs(id));
    dispatch(fetchComments(id));
  }, [dispatch, id]);

  useEffect(() => {
    const handleScroll = () => {
      if (!sidebarRef.current) return;

      const sidebarElement = sidebarRef.current;
      const sidebarTotalHeight = sidebarElement.scrollHeight - sidebarElement.clientHeight;
      const sidebarScrollTop = sidebarElement.scrollTop;
      setScrollProgress(sidebarTotalHeight > 0 ? sidebarScrollTop / sidebarTotalHeight : 0);

      const sections = document.querySelectorAll('h2');
      let currentActiveSection = null;
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
          currentActiveSection = section.id;
        }
      });
      setActiveSection(currentActiveSection);
    };

    window.addEventListener('scroll', handleScroll);
    const sidebarEl = sidebarRef.current;
    if (sidebarEl) {
      sidebarEl.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (sidebarEl) {
        sidebarEl.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const handleCommentSubmit = () => {
    if (!commentText.trim() || !name.trim() || !email.trim()) {
      alert('Please fill in all required fields: Comment, Name, and Email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    dispatch(addComment({ blogId: id, comment: commentText, name, email }))
      .unwrap()
      .then(() => {
        setCommentText('');
        setName('');
        setEmail('');
        alert('Comment posted successfully!');
      })
      .catch((error) => {
        alert(`Failed to post comment: ${error}`);
      });
  };

  const retryFetchComments = () => {
    dispatch(fetchComments(id));
  };

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const handleShare = (platform) => {
    if (!currentBlog) return;

    const articleUrl = `${window.location.origin}/blog/${id}`;
    const title = encodeURIComponent(currentBlog.title || '');
    const mainContentBlock = currentBlog.content?.find(
      (block) => block.type === 'main-content' || block.type === 'paragraph'
    );
    const descriptionText = mainContentBlock?.text || 'Check out this insightful article on our blog!';
    const description = encodeURIComponent(descriptionText.length > 150 ? descriptionText.substring(0, 147) + '...' : descriptionText);

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${articleUrl}&text=${title}%0A${description}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${articleUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${articleUrl}&title=${title}&summary=${description}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${title}%0A${description}%0A${articleUrl}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNormalShare = async () => {
    if (!currentBlog) return;

    const articleUrl = `${window.location.origin}/blog/${id}`;
    const title = currentBlog.title || '';
    const mainContentBlock = currentBlog.content?.find(
      (block) => block.type === 'main-content' || block.type === 'paragraph'
    );
    const descriptionText = mainContentBlock?.text || 'Check out this insightful article on our blog!';
    const description = descriptionText.length > 150 ? descriptionText.substring(0, 147) + '...' : descriptionText;

    const shareData = {
      title: title,
      text: `${title}\n${description}\n`,
      url: articleUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        setShareFeedback('Article link copied to clipboard!');
        setTimeout(() => setShareFeedback(''), 3000);
      }
    } catch (error) {
      console.error('Error sharing article:', error);
      setShareFeedback('Failed to share article. Please try again.');
      setTimeout(() => setShareFeedback(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
        Loading blog...
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 py-10">Error loading blog: {error}</div>;
  }

  if (!currentBlog) {
    return <div className="text-center text-gray-600 py-10">Blog not found.</div>;
  }

  const subheadings = currentBlog.content
    ?.filter((block) => block.type === 'subheading')
    .map((block) => ({ id: block.id, text: block.text })) || [];

  const articleUrl = `${window.location.origin}/blog/${id}`;
  const mainContentBlock = currentBlog.content?.find(
    (block) => block.type === 'main-content' || block.type === 'paragraph'
  );
  const descriptionText = mainContentBlock?.text || 'Check out this insightful article on our blog!';
  const description = descriptionText.length > 150 ? descriptionText.substring(0, 147) + '...' : descriptionText;

  return (
    <ErrorBoundary className="bg-gray-600">
      <Helmet>
        <title>{currentBlog.title || 'Blog'}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={currentBlog.title || ''} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={currentBlog.image || ''} />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={currentBlog.title || ''} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={currentBlog.image || ''} />
      </Helmet>

      <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row gap-6 ">
        <aside
          className="md:w-1/4 md:sticky md:top-20 h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-100 shadow-2xl"
          ref={sidebarRef}
        >
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-bold mb-4 text-lg text-gray-800">Inside This Article</h2>
            <div className="mb-4">
              <motion.div
                className="h-1 bg-blue-500 rounded"
                initial={{ scaleX: 0, transformOrigin: '0%' }}
                animate={{ scaleX: scrollProgress, transformOrigin: '100%' }}
              />
            </div>
            <nav>
              {subheadings.map((subheading) => (
                <button
                  key={subheading.id}
                  className={`block text-left mb-2 px-2 py-1 rounded transition-colors w-full ${
                    activeSection === subheading.id
                      ? 'bg-blue-100 font-semibold text-blue-600'
                      : 'hover:bg-blue-50 hover:text-blue-600'
                  }`}
                  onClick={() => scrollToSection(subheading.id)}
                >
                  {subheading.text}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="md:w-3/4 bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">{currentBlog.title}</h1>
          <img src={currentBlog.image} alt={currentBlog.title} className="w-full object-cover mb-4 rounded-3xl" />
          <div className="flex justify-between text-gray-600 mb-6">
            <div className="flex items-center gap-2 text-primary-600 font-bold">
              <FiUser />
              <span>{currentBlog.author}</span>
            </div>
            <div className="flex items-center gap-2 text-primary-600 font-bold">
              <FiCalendar />
              <span>
                {currentBlog.date
                  ? new Date(currentBlog.date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </span>
            </div>
          </div>

          <article>
            {currentBlog.content?.map((block) => {
              switch (block.type) {
                case 'main-content':
                case 'paragraph':
                  return (
                    <p key={block.id} className="my-4 text-gray-700 text-lg leading-relaxed">
                      {block.text}
                    </p>
                  );
                case 'subheading':
                  return (
                    <h2 key={block.id} id={block.id} className="text-2xl font-bold my-6 text-blue-800">
                      {block.text}
                    </h2>
                  );
                case 'description':
                  return (
                    <p key={block.id} className="my-4 ml-4 text-gray-800 text-base leading-relaxed">
                      {block.text}
                    </p>
                  );
                default:
                  return null;
              }
            })}
          </article>

          {currentBlog.conclusion && (
            <section className="mt-8">
              <h2 className="text-2xl font-bold mb-2 text-gray-800">Conclusion</h2>
              <p className="text-gray-700">{currentBlog.conclusion}</p>
            </section>
          )}

          {currentBlog.faqs?.length > 0 && (
            <section className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">FAQs</h2>
              {currentBlog.faqs.map((faq, index) => (
                <div key={index} className="mb-4">
                  <h3 className="font-bold bg-gray-100 rounded p-2 text-gray-800">{faq.question}</h3>
                  <p className="mt-2 text-gray-700">Ans: {faq.answer}</p>
                </div>
              ))}
            </section>
          )}

          <section className="mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Share This Article</h3>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-2 bg-blue-500 text-white px-2 py-2 rounded-3xl hover:bg-blue-600 transition-colors"
              >
                <FaTwitter size={25} />
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-2 bg-blue-700 text-white px-3 py-2 rounded-3xl hover:bg-blue-900 transition-colors"
              >
                <FaFacebook size={20} />
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-3xl hover:bg-blue-800 transition-colors"
              >
                <FaLinkedin size={20} />
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-3xl hover:bg-green-800 transition-colors"
              >
                <FaWhatsapp size={20} />
              </button>
              <button
                onClick={handleNormalShare}
                className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-3xl hover:bg-gray-800 transition-colors"
              >
                <FiShare2 size={20} />
                Share
              </button>
            </div>
            {shareFeedback && (
              <p className="mt-2 text-sm text-green-600">{shareFeedback}</p>
            )}
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Related Posts</h2>
            {relatedBlogs.length === 0 ? (
              <p className="text-gray-600">No related posts found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedBlogs.map((blog) => (
                  <motion.div
                    key={blog.id}
                    className="bg-white rounded-lg shadow-md cursor-pointer overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigate(`/blog/${blog.id}`)}
                  >
                    <img src={blog.image} alt={blog.title} className="w-full h-32 object-cover" />
                    <div className="p-4">
                      <h3 className="text-md font-semibold text-gray-800">{blog.title}</h3>
                      <p className="text-gray-600 text-sm">By {blog.author}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Comments</h2>
            {commentsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
                Loading comments...
              </div>
            ) : commentsError ? (
              <div className="text-center text-red-600 py-4">
                {commentsError}
                <br />
                <button
                  onClick={retryFetchComments}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry Loading Comments
                </button>
              </div>
            ) : comments.length === 0 ? (
              <p className="text-gray-600">No comments yet. Be the first to comment!</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border p-4 rounded-lg shadow-sm bg-gray-50">
                    <div className="flex items-center mb-2">
                      <div className="h-8 w-8 rounded-full bg-primary-400 text-white flex items-center justify-center mr-2">
                        <FiUser />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">{comment.name}</span>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <FiMail />
                          <span className="text-primary-400">{comment.email}</span>
                        </div>
                      </div>
                      <span className="ml-auto text-sm text-gray-500">
                        {comment.created_at
                          ? new Date(comment.created_at).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : 'N/A'}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.comment}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-xl font-bold mb-2 text-gray-800">Leave a Reply</h3>
              <p className="text-sm mb-4 text-gray-600">
                Your email address will not be published. Required fields are marked *
              </p>
              <textarea
                name="comment"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Comment *"
                className="w-full border rounded-xl p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
                rows={4}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name *"
                  className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email *"
                  className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <button
                onClick={handleCommentSubmit}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={commentsLoading}
              >
                Post Comment
              </button>
            </div>
          </section>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default BlogDetails;