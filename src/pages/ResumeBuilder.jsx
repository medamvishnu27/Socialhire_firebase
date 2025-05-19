import { motion } from 'framer-motion';
import { FiFileText, FiCheckCircle } from 'react-icons/fi';
import bg3 from '/bg-3.png';

const ResumeBuilder = () => {
  const services = [
    {
      title: "Create Resume",
      description: "Build a professional resume with our AI-powered resume builder. Choose from ATS-friendly templates and get smart content suggestions.",
      icon: <FiFileText className="h-8 w-8" />,
      color: "from-blue-500 to-blue-700"
    },
    {
      title: "Resume Score Checker",
      description: "Get instant feedback on your resume with detailed analysis and suggestions for improvement to make it stand out.",
      icon: <FiCheckCircle className="h-8 w-8" />,
      color: "from-purple-500 to-purple-700"
    }
  ];

  return (
    <div className="min-h-screen bg-black  bg-no-repeat bg-cover bg-center py-12"  style={{ backgroundImage: `url(${bg3})` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-white mb-4">AI Resume Builder</h1>
          <p className="text-lg text-gray-300">
            Create and analyze your resume with AI assistance
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
          initial="hidden"
          animate="visible"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="relative overflow-hidden rounded-xl"
              variants={{
                hidden: { y: 50, opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: {
                    duration: 0.5,
                    ease: "easeOut"
                  }
                }
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className={`bg-gradient-to-r ${service.color} p-8 h-full min-h-[300px] flex flex-col`}>
                <div className="bg-white bg-opacity-20 p-3 rounded-lg w-fit mb-6">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {service.title}
                </h3>
                <p className="text-white text-opacity-90 text-lg mb-8 flex-grow">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Explore Button */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <a
            href="https://socialhire.in/resume-checker/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-gray-900 px-8 py-3 rounded-full font-medium text-lg hover:bg-opacity-90 transition-colors duration-200 transform hover:scale-105"
          >
            Explore Now
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default ResumeBuilder;