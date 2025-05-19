import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiUser , FiBriefcase, FiCalendar, FiBook, FiFileText } from 'react-icons/fi';
import RotatingText from "../components/RotatingText.jsx";
import ShinyText from '../components/ShinyText.jsx';
import bg3 from '/bg-3.png';
import bg2 from '/bg2.png';
import bgh3 from "/bgh3.png";

// Loader Component
const Loader = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="loader"></div>
  </div>
);

const Home = () => {
  const { isAuthenticated } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000); // Simulate loading
    return () => clearTimeout(timer);
  }, []);

  const features = [
    { icon: <FiUser  />, title: "Digital Profile", description: "Create and manage your professional profile to showcase your skills and experience.", link: "/profile" },
    { icon: <FiBriefcase />, title: "Job Listings", description: "Browse and apply for curated job opportunities tailored for students.", link: "/jobs" },
    { icon: <FiUser  />, title: "Mentor Booking", description: "Connect with industry experts for guidance and career advice.", link: "/mentors" },
    { icon: <FiCalendar />, title: "Events", description: "Attend live events and workshops to enhance your skills.", link: "/webinars" },
    { icon: <FiBook />, title: "Placement Preparation", description: "Access resources and tips to prepare for placement interviews.", link: "/placement" },
    { icon: <FiFileText />, title: "AI Resume Builder", description: "Create professional resumes with AI-powered assistance.", link: "/resume-builder" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.3 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      {/* Hero Section */}
      <div className="min-h-screen text-white bg-black bg-no-repeat bg-cover bg-center" style={{ backgroundImage: `url(${bg3})` }}>
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 lg:py-16">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Turn Your{" "}
              <span className="inline-block">
                <RotatingText
                  texts={[
                    "Talent into Success",
                    "Efforts into Opportunities",
                    "Skills into a Career",
                    "Goals into Growth",
                    "Hustle into Hires",
                  ]}
                  mainClassName="px-1 sm:px-2 md:px-3 text-white overflow-hidden py-0.5 sm:py-1 md:py-2 rounded-xl"
                  staggerFrom="last"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2500}
                />
              </span>{" "}
              with  <span style={{
                background: 'linear-gradient(to right, #0284c7 44%, #CFA575 66%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>SocialHire!</span>
            </h1>
            <ShinyText 
              text="Your AI-Powered Career Partner! Apply, prepare, and conquer your dream role with SocialHire's revolutionary career solutions" 
              disabled={false} 
              speed={3} 
              className='text-sm sm:text-base md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto' 
            />
            
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 lg:mb-16">
                <Link to="/register" className="btn-primary text-sm sm:text-base px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
                  Get Started
                </Link>
                <Link to="/login" className="btn-secondary text-sm sm:text-base px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
                  Login
                </Link>
              </div>
            )}
          </motion.div>
          
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12 lg:mt-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-4 sm:p-6 shadow-lg"
              >
                <div className="h-8 sm:h-10 lg:h-12 w-8 sm:w-10 lg:w-12 bg-primary-100 bg-opacity-60 text-black rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-white text-opacity-80 mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base">{feature.description}</p>
                {isAuthenticated && (
                  <Link
                    to={feature.link}
                    className="inline-flex items-center text-white hover:text-primary-200 font-medium text-xs sm:text-sm lg:text-base"
                  >
                    Explore {feature.title} →
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Career Growth Section */}
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <motion.div className="flex flex-col md:flex-row bg-white bg-opacity-10 rounded-2xl p-4 sm:p-6 items-center">
            <div className="w-full md:w-1/2 text-white mb-6 md:mb-0">
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                The <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                  Solution
                </span>
                <br />
                for your Career Growth
              </p>
              <p className="text-gray-400 mt-3 text-xs sm:text-sm md:text-base">
                SocialHire is a platform designed specifically for students and job seekers to thrive.
                With SocialHire, you can apply for curated jobs, build advanced resumes using AI, receive 
                mentorship sessions from expert trainers, and create tech portfolio pages that showcase your skills.
              </p>
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
              <img src="/carrergrowth.png" loading="lazy" className="w-full max-w-xs sm:max-w-sm md:max-w-md m-3" alt="Career Growth" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Jobs Section */}
      <section className="min-h-screen text-white bg-black">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <motion.div className="flex flex-col md:flex-row bg-black bg-opacity-10 rounded-2xl p-4 sm:p-6 items-center bg-no-repeat bg-cover bg-center" style={{ backgroundImage: `url(${bg2})` }}>
            <div className="w-full md:w-2/5 mb-6 md:mb-0">
              <img src="/jobsearch.png" loading="lazy" alt="Job Search" className="rounded-lg w-full h-auto" />
            </div>
            <div className="w-full lg:text-end md:w-1/2 text-center md:text-end">
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                Find the{" "}
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                  Jobs
                </span>{" "}
                You Deserve
              </p>
              <p className="text-gray-400 ml-10 mt-3 text-xs sm:text-sm md:text-base">
                Tired of searching endlessly? SocialHire provides you with
                personalized job opportunities that align perfectly with your
                skills and goals.
              </p>
              <Link to="/jobs" className="bg-primary-600 mt-5 text-white px-6 py-3 rounded-full inline-flex items-center">
                Apply Now <span className="ml-2">→</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Mentorship Section */}
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <motion.div className="flex flex-col md:flex-row bg-white bg-opacity-10 rounded-2xl p-4 sm:p-6 items-center gap-4">
            <div className="w-full md:w-3/5 text-center md:text-left">
              <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Grow with Personalized
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                  {" "}
                  Mentorship
                </span>
              </h2>
              <p className="text-gray-400 mt-2 text-xs sm:text-sm md:text-lg">
                Gain valuable insights from industry leaders who've walked your
                path. Our mentorship program offers tailored guidance to help you
                at every stage of your journey.
              </p>
              <Link to="/mentors" className="bg-primary-600 mt-5 text-white px-6 py-3 rounded-full inline-flex items-center">
                Get Mentored <span className="ml-2">→</span>
              </Link>
            </div>
            <div className="w-full md:w-2/5 flex justify-center">
              <img src="/mentorship.png" loading="lazy" alt="Mentorship" className="w-full max-w-xs sm:max-w-sm md:max-w-md rounded-lg shadow-lg" />
            </div>
          </motion.div>
        </div>

        {/* Resume Section */}
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <motion.div className="flex flex-col md:flex-row bg-white bg-opacity-10 rounded-2xl p-4 sm:p-6 items-center lg:space-x-10">
            <div className="w-full md:w-2/5 mb-6 md:mb-0">
              <img src="/airesume.png" loading="lazy" alt="Resume Builder" className="rounded-lg w-full h-auto" />
            </div>
            
            <div className="w-full md:w-1/2 text-center md:text-end">
              <h2 className="text-4xl font-bold mb-4">Create a Winning <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Resume</span> in Seconds</h2>
              <p className="text-gray-400 mb-8">
                Make your resume stand out effortlessly with SocialHire's AI-powered tools. Build, optimize, and
                ensure your resume passes Applicant Tracking Systems (ATS) so you never miss an opportunity. Create
                a compelling resume with just one click.
              </p>
              <Link to="/resume-builder" className="bg-primary-600 text-white px-6 py-3 rounded-full inline-flex items-center">
                Build Your Resume <span className="ml-2">→</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ and Contact Section */}
      <section className="min-h-screen text-white bg-black">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-opacity-10 rounded-2xl p-4 sm:p-7 bg-no-repeat bg-cover bg-center" style={{ backgroundImage: `url(${bgh3})` }}>
            {/* FAQ Section */}
            <div>
              <h6 className="text-gray-400 text-sm sm:text-base md:text-lg leading-tight">
                We just might have answered
                <br />
                some of your questions.{" "}
                <span className="text-white">Check this out</span>
              </h6>
              <div className="space-y-3 sm:space-y-4 mt-4">
                {[
                  { question: "What is SocialHire?", answer: "SocialHire is an AI-driven career platform designed to help students and job seekers apply for curated jobs, build advanced resumes, receive mentorship, and create tech portfolio pages." },
                  { question: "How do I get started with SocialHire?", answer: "Simply create a profile on SocialHire by highlighting your skills, experience, and job preferences. Upload your resume and start exploring curated job opportunities." },
                  { question: "What kind of jobs are available on SocialHire?", answer: "SocialHire offers a variety of curated job opportunities, specifically tailored to match your skills, experience, and career aspirations." },
                  { question: "How does SocialHire help with resume building?", answer: "SocialHire provides advanced AI tools that help you build, optimize, and ensure your resume is ATS-compatible, making you stand out to potential employers." },
                  { question: "Can I get career mentorship through SocialHire?", answer: "Yes, SocialHire connects you with industry experts who provide personalized guidance to help you succeed in your career journey." },
                  { question: "What is a tech portfolio, and how can SocialHire help me create one?", answer: "A tech portfolio is a showcase of your skills and accomplishments. SocialHire helps you create a professional tech portfolio that highlights your work and abilities." },
                ].map((faq, index) => (
                  <motion.details
                    key={index}
                    className="bg-black border border-white rounded-lg p-3 sm:p-4 transition duration-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <summary className="text-white font-medium flex justify-between items-center cursor-pointer text-sm sm:text-base">
                      {faq.question}
                      <i className="bi bi-chevron-down"></i>
                    </summary>
                    <p className="text-gray-300 mt-2 text-xs sm:text-sm md:text-base">{faq.answer}</p>
                  </motion.details>
                ))}
              </div>
            </div>

            {/* Contact Section */}
            <div>
              <h2 className="text-4xl font-bold mb-4">Want a feature on <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">SocialHire</span>?</h2>
              <p className="text-gray-400 mb-8">
                If there are features you would like us to have on SocialHire to aid your recruitment
                and matching process kindly send us a message.
              </p>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter Email"
                  className="w-full bg-[#111] border border-gray-700 rounded-lg p-4"
                />
                <textarea
                  placeholder="Message"
                  rows="4"
                  className="w-full bg-[#111] border border-gray-700 rounded-lg p-4"
                ></textarea>
                <button className="bg-primary-600 text-white px-6 py-3 rounded-full inline-flex items-center">
                  Send message <span className="ml-2">→</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Home;