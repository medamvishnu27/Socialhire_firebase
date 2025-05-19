import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { motion } from 'framer-motion';
import { FaSearch, FaUser, FaFileAlt, FaBriefcase, FaLightbulb, FaNetworkWired, FaHandsHelping } from 'react-icons/fa';
import bg3 from '/bg-3.png'; // Import the background image

// Framer Motion animations
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const textVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
};

const highlightVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
};

const About = () => {
    const navigate = useNavigate(); // Move useNavigate to the top level

    // Handle button click to redirect to the home page
    const handleClick = () => {
        navigate('/'); // Use the navigate function here
    };

    return (
        <motion.div
            className="min-h-screen p-8 text-white font-sans bg-black"
            style={{ backgroundImage: `url(${bg3})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Introduction Section */}
            <motion.section className="mb-12" variants={itemVariants}>
                <motion.h1 className="text-5xl font-bold text-center text-gray-300  mb-6">
                    About Us
                </motion.h1>
                <motion.p className="text-lg leading-relaxed text-left lg:mx-5 text-gray-300 " variants={textVariants}>
                    <span className='font-bold text-3xl' style={{
                        background: 'linear-gradient(to right, #0284c7 44%, #CFA575 66%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                        ,
                    }}> SocialHire </span> {' '}
                    <motion.span
                        className=""
                        variants={highlightVariants}
                    >
                        is an AI-powered
                    </motion.span>{' '}
                    career advancement platform designed to help students and professionals land their dream jobs with ease. We leverage advanced technology, expert mentorship, and industry-driven insights to empower job seekers with the right tools, resources, and connections.
                </motion.p>
            </motion.section>

            {/* Vision Section */}
            <motion.section className="mb-12" variants={itemVariants}>
                <motion.h2 className="text-4xl font-semibold text-gray-300 mb-4 text-center">
                    Our Vision
                </motion.h2>
                <motion.p className="text-lg leading-relaxed text-left lg:mx-5 text-gray-300" variants={textVariants}>
                    Our mission is to bridge the gap between talent and opportunity by providing{' '}
                    <motion.span
                        className="font-bold text-2xl text-white" 
                        variants={highlightVariants}
                    >
                        AI-driven career solutions
                    </motion.span>
                    , personalized mentorship, and job-readiness tools to help individuals secure high-paying and fulfilling jobs.
                </motion.p>
            </motion.section>

            {/* What We Offer Section */}
            <motion.section className="mb-12" variants={itemVariants}>
                <motion.h2 className="text-3xl font-semibold text-gray-300 mb-4 text-left">
                    What We Offer
                </motion.h2>
                <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants}>
                    <motion.div
                        className="flex items-start space-x-4 p-6 rounded-lg backdrop-blur-md bg-white/10 border border-white/10"
                        variants={itemVariants}
                    >
                        <div className="bg-gray-200 rounded-2xl p-1 text-2xl">
                            <FaSearch className=' text-purple-500 ' />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">Job Search & Applications</h3>
                            <p className="text-lg my-3 text-gray-400">
                                Access curated job listings tailored to industry demands and apply directly to high-growth tech and business roles.
                            </p>
                        </div>
                    </motion.div>
                    <motion.div
                        className="flex items-start space-x-4 p-6 rounded-lg backdrop-blur-md bg-white/10 border border-white/10"
                        variants={itemVariants}
                    >
                        <div className="bg-gray-200 rounded-2xl p-1 text-2xl">
                            <FaUser className=' text-purple-500 ' />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">Personalized Mentorship</h3>
                            <p className="text-lg my-3 text-gray-400">
                                Book 1:1 mentorship sessions with industry experts and get guidance on career paths, job search strategies, and skill development.
                            </p>
                        </div>
                    </motion.div>
                    <motion.div
                        className="flex items-start space-x-4 p-6 rounded-lg backdrop-blur-md bg-white/10 border border-white/10"
                        variants={itemVariants}
                    >
                        <div className="bg-gray-200 rounded-2xl p-1 text-2xl">
                            <FaFileAlt className=' text-primary-500 ' />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">AI-Powered Resume & Interview Tools</h3>
                            <p className="text-lg my-3 text-gray-400">
                                Create a resume that passes recruiter screenings and practice real-world interview scenarios with automated feedback.
                            </p>
                        </div>
                    </motion.div>
                    <motion.div
                        className="flex items-start space-x-4 p-6 rounded-lg backdrop-blur-md bg-white/10 border border-white/10"
                        variants={itemVariants}
                    >
                        <div className="bg-gray-200 rounded-2xl p-1 text-2xl">
                            <FaNetworkWired className=' text-primary-500 ' />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">Digital Resumes & Career Portfolios</h3>
                            <p className="text-lg my-3 text-gray-400">
                                Build a compelling digital resume and portfolio to showcase skills, projects, and achievements.
                            </p>
                        </div>
                    </motion.div>
                    <motion.div
                        className="flex items-start space-x-4 p-6 rounded-lg backdrop-blur-md bg-white/10 border border-white/10"
                        variants={itemVariants}
                    >
                        <div className="bg-gray-200 rounded-2xl p-1 text-2xl">
                            <FaLightbulb className=' text-primary-500 ' />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">Career Roadmaps & Mock Assessments</h3>
                            <p className="text-lg my-3 text-gray-400">
                                Explore step-by-step career roadmaps tailored to various industries and take AI-powered mock assessments to evaluate skills and job readiness.
                            </p>
                        </div>
                    </motion.div>
                    <motion.div
                        className="flex items-start space-x-4 p-6 rounded-lg backdrop-blur-md bg-white/10 border border-white/10"
                        variants={itemVariants}
                    >
                        <div className="bg-gray-200 rounded-2xl p-1 text-2xl">
                            <FaHandsHelping className=' text-purple-500 ' />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">Placement Preparation Resources</h3>
                            <p className="text-lg my-3 text-gray-400">
                                Get access to HR interview tips, salary negotiation strategies, and job offer guidance.
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.section>

            {/* Why Choose SocialHire Section */}
            <motion.section className="mb-12" variants={itemVariants}>
                <motion.h2 className="text-3xl font-semibold text-gray-300 mb-4 text-left">
                    Why Choose SocialHire?
                </motion.h2>
                <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={containerVariants}>
                    <motion.div
                        className="text-center p-6 rounded-lg backdrop-blur-md bg-white/10 border border-white/10"
                        variants={itemVariants}
                    >

                        <h3 className="text-xl font-semibold">AI-Driven Career Tools</h3>
                        <p className="text-lg my-3 text-gray-400">
                            Cutting-edge technology to enhance your job search and interview performance.
                        </p>
                    </motion.div>
                    <motion.div
                        className="text-center p-6 rounded-lg backdrop-blur-md bg-white/10 border border-white/10"
                        variants={itemVariants}
                    >

                        <h3 className="text-xl font-semibold">Industry Connections</h3>
                        <p className="text-lg my-3 text-gray-400">
                            Direct access to hiring managers, recruiters, and career experts.
                        </p>
                    </motion.div>
                    <motion.div
                        className="text-center p-6 rounded-lg backdrop-blur-md bg-white/10 border border-white/10"
                        variants={itemVariants}
                    >

                        <h3 className="text-xl font-semibold">End-to-End Career Support</h3>
                        <p className="text-lg my-3 text-gray-400">
                            From resume building to job placement, we assist you at every stage.
                        </p>
                    </motion.div>
                </motion.div>
            </motion.section>

            {/* Join SocialHire Section */}
            <motion.section className="mb-12" variants={itemVariants}>
                <motion.h1 className="text-4xl font-bold text-left text-gray-300 mb-6"  >
                    Join  SocialHire Today!
                </motion.h1>
                <motion.p className="text-lg leading-relaxed text-left" variants={textVariants}>
                    Take control of your career with SocialHire. Whether you’re a fresher looking for your first job or a professional seeking career growth, we help you land the right opportunity with confidence.
                </motion.p>
                <motion.button
                    className="mt-6 px-8 py-3 bg-purple-700 text-white font-semibold rounded-lg hover:bg-purple-600 transition-all mx-auto"
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClick} // Call handleClick on button click
                >
                    Get Started
                </motion.button>
            </motion.section>
        </motion.div>
    );
};

export default About;