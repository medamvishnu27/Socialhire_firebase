import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RiCodeSLine, 
  RiDatabase2Line, 
  RiCloudLine, 
  RiBarChartBoxLine, 
  RiCpuLine, 
  RiGitBranchLine, 
  RiReactjsLine, 
  RiAngularjsLine, 
  RiVuejsLine, 
  RiNodejsLine, 
  RiJavascriptLine, 
  RiCodeBoxLine,
  RiDatabaseLine, 
  RiBox3Line,
  RiStackLine,
  RiGoogleLine, 
  RiBrainLine,
  RiHtml5Line,
  RiCss3Line,
  RiJavaLine,
  RiTerminalLine,
  RiServerLine,
  RiGitMergeLine,
  RiRocketLine,
  RiPieChartLine,
  RiFileCodeLine,
  RiSettings5Line,
  RiFileListLine,
  RiShieldLine,
  RiTableLine
} from 'react-icons/ri';
import bg3 from '/bg-3.png';

const TechnologyCard = ({ tech, activeCardId, setActiveCardId }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isActive = activeCardId === tech.id; // Check if this card is the active one

  // Handle tap/click to set this card as active
  const handleTap = () => {
    setActiveCardId(isActive ? null : tech.id); // Toggle off if already active, otherwise set as active
  };

  return (
    <motion.div
      className="relative bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 flex flex-col items-center transition-all duration-300 group min-h-[250px]"
      onHoverStart={() => setIsHovered(true)} // For desktop hover
      onHoverEnd={() => setIsHovered(false)}  // For desktop hover
      onClick={handleTap}                     // For mobile tap
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: { duration: 0.3 }
        }
      }}
    >
      <div
        className={`flex flex-col items-center transition-opacity duration-300 ${
          isHovered || isActive ? 'opacity-60' : 'opacity-100'
        }`}
      >
        <tech.icon className={`h-12 w-12 ${tech.color} mb-4`} />
        <h3 className="text-lg font-semibold text-white mb-2">{tech.name}</h3>
        <p className="text-sm text-gray-300 text-center">{tech.description}</p>
      </div>
      
      <AnimatePresence>
        {(isHovered || isActive) && (
          <motion.div
            className="absolute bottom-6 left-0 right-0 flex justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <a
              href="https://labs.socialhire.in/register"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary-600 text-white px-6 py-2 rounded-full font-medium hover:bg-primary-700 transition-colors duration-200"
              onClick={(e) => e.stopPropagation()} // Prevent tap on button from toggling card
            >
              Explore Now
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CodeLabs = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeCardId, setActiveCardId] = useState(null); // Track the active card

  const categories = [
    { id: 'all', name: 'All Technologies', icon: RiCodeSLine },
    { id: 'web', name: 'Web Development', icon: RiReactjsLine },
    { id: 'programming', name: 'Programming', icon: RiCpuLine },
    { id: 'database', name: 'Databases', icon: RiDatabase2Line },
    { id: 'devops', name: 'DevOps', icon: RiGitBranchLine },
    { id: 'data', name: 'Data Science & Analytics', icon: RiBarChartBoxLine },
    { id: 'dsa', name: 'DSA', icon: RiCodeSLine }
  ];

  const technologies = [
    // Web Development
    {
      id: 1,
      name: 'React.js',
      category: 'web',
      icon: RiReactjsLine,
      color: 'text-blue-500',
      description: 'A JavaScript library for building user interfaces.'
    },
    {
      id: 2,
      name: 'Angular',
      category: 'web',
      icon: RiAngularjsLine,
      color: 'text-red-600',
      description: 'A platform for building mobile and desktop web applications.'
    },
    {
      id: 3,
      name: 'Vue.js',
      category: 'web',
      icon: RiVuejsLine,
      color: 'text-green-500',
      description: 'A progressive framework for building user interfaces.'
    },
    {
      id: 4,
      name: 'Node.js',
      category: 'web',
      icon: RiNodejsLine,
      color: 'text-green-600',
      description: 'A runtime for executing JavaScript on the server-side.'
    },
    {
      id: 19,
      name: 'HTML5',
      category: 'web',
      icon: RiHtml5Line,
      color: 'text-orange-500',
      description: 'The latest standard for structuring content on the web.'
    },
    {
      id: 20,
      name: 'CSS3',
      category: 'web',
      icon: RiCss3Line,
      color: 'text-blue-400',
      description: 'A stylesheet language for styling web pages.'
    },
    {
      id: 30,
      name: 'TypeScript',
      category: 'web',
      icon: RiFileListLine,
      color: 'text-blue-600',
      description: 'A typed superset of JavaScript for scalable apps.'
    },

    // Programming Languages
    {
      id: 5,
      name: 'JavaScript',
      category: 'programming',
      icon: RiJavascriptLine,
      color: 'text-yellow-400',
      description: 'A versatile language for web development and beyond.'
    },
    {
      id: 6,
      name: 'Python',
      category: 'programming',
      icon: RiCodeBoxLine,
      color: 'text-blue-500',
      description: 'A high-level language known for simplicity and readability.'
    },
    {
      id: 21,
      name: 'Java',
      category: 'programming',
      icon: RiJavaLine,
      color: 'text-red-500',
      description: 'A robust, object-oriented language for enterprise apps.'
    },
    {
      id: 22,
      name: 'Ruby',
      category: 'programming',
      icon: RiCodeBoxLine,
      color: 'text-red-600',
      description: 'A dynamic language focused on simplicity and productivity.'
    },
    {
      id: 23,
      name: 'Bash/Shell',
      category: 'programming',
      icon: RiTerminalLine,
      color: 'text-gray-500',
      description: 'A scripting language for automating tasks in Unix systems.'
    },
    {
      id: 31,
      name: 'PHP',
      category: 'programming',
      icon: RiCodeBoxLine,
      color: 'text-purple-500',
      description: 'A server-side scripting language for web development.'
    },
    {
      id: 32,
      name: 'Go',
      category: 'programming',
      icon: RiCodeBoxLine,
      color: 'text-teal-500',
      description: 'A statically typed language designed for concurrency.'
    },

    // Databases
    {
      id: 7,
      name: 'MongoDB',
      category: 'database',
      icon: RiDatabaseLine,
      color: 'text-green-500',
      description: 'A NoSQL database for storing JSON-like documents.'
    },
    {
      id: 8,
      name: 'PostgreSQL',
      category: 'database',
      icon: RiDatabaseLine,
      color: 'text-blue-600',
      description: 'An open-source relational database with advanced features.'
    },
    {
      id: 9,
      name: 'MySQL',
      category: 'database',
      icon: RiDatabaseLine,
      color: 'text-blue-500',
      description: 'A popular relational database for web applications.'
    },
    {
      id: 24,
      name: 'Redis',
      category: 'database',
      icon: RiServerLine,
      color: 'text-red-500',
      description: 'An in-memory data store used as a cache or database.'
    },
    {
      id: 33,
      name: 'SQLite',
      category: 'database',
      icon: RiServerLine,
      color: 'text-cyan-500',
      description: 'A lightweight, embedded relational database.'
    },

    // DevOps
    {
      id: 10,
      name: 'Docker',
      category: 'devops',
      icon: RiBox3Line,
      color: 'text-blue-500',
      description: 'A platform for containerizing applications.'
    },
    {
      id: 11,
      name: 'Kubernetes',
      category: 'devops',
      icon: RiStackLine,
      color: 'text-blue-600',
      description: 'An orchestration system for managing containers.'
    },
    {
      id: 12,
      name: 'AWS',
      category: 'devops',
      icon: RiCloudLine,
      color: 'text-yellow-500',
      description: 'A comprehensive cloud computing platform by Amazon.'
    },
    {
      id: 13,
      name: 'Google Cloud',
      category: 'devops',
      icon: RiGoogleLine,
      color: 'text-red-500',
      description: 'Google suite of cloud computing services.'
    },
    {
      id: 25,
      name: 'Git',
      category: 'devops',
      icon: RiGitMergeLine,
      color: 'text-orange-600',
      description: 'A distributed version control system.'
    },
    {
      id: 26,
      name: 'Terraform',
      category: 'devops',
      icon: RiRocketLine,
      color: 'text-purple-500',
      description: 'An IaC tool for provisioning infrastructure.'
    },
    {
      id: 34,
      name: 'Ansible',
      category: 'devops',
      icon: RiRocketLine,
      color: 'text-red-600',
      description: 'An automation tool for configuration management.'
    },
    {
      id: 35,
      name: 'Jenkins',
      category: 'devops',
      icon: RiSettings5Line,
      color: 'text-blue-700',
      description: 'An open-source automation server for CI/CD.'
    },

    // Data Science & Analytics
    {
      id: 14,
      name: 'TensorFlow',
      category: 'data',
      icon: RiBrainLine,
      color: 'text-orange-500',
      description: 'An open-source framework for machine learning.'
    },
    {
      id: 15,
      name: 'Scikit-learn',
      category: 'data',
      icon: RiBarChartBoxLine,
      color: 'text-orange-600',
      description: 'A Python library for machine learning algorithms.'
    },
    {
      id: 16,
      name: 'Pandas',
      category: 'data',
      icon: RiBarChartBoxLine,
      color: 'text-blue-600',
      description: 'A data manipulation and analysis library for Python.'
    },
    {
      id: 27,
      name: 'PyTorch',
      category: 'data',
      icon: RiBrainLine,
      color: 'text-red-600',
      description: 'A deep learning framework with dynamic computation.'
    },
    {
      id: 28,
      name: 'Matplotlib',
      category: 'data',
      icon: RiPieChartLine,
      color: 'text-green-500',
      description: 'A plotting library for creating visualizations in Python.'
    },
    {
      id: 36,
      name: 'NumPy',
      category: 'data',
      icon: RiTableLine,
      color: 'text-blue-500',
      description: 'A library for numerical computations in Python.'
    },
    {
      id: 37,
      name: 'Seaborn',
      category: 'data',
      icon: RiPieChartLine,
      color: 'text-purple-600',
      description: 'A statistical data visualization library based on Matplotlib.'
    },

    // DSA
    {
      id: 17,
      name: 'Data Structures',
      category: 'dsa',
      icon: RiCodeSLine,
      color: 'text-purple-600',
      description: 'Fundamental ways to organize and store data.'
    },
    {
      id: 18,
      name: 'Algorithms',
      category: 'dsa',
      icon: RiCodeSLine,
      color: 'text-green-600',
      description: 'Step-by-step procedures for solving problems.'
    },
    {
      id: 29,
      name: 'DSA Practice',
      category: 'dsa',
      icon: RiFileCodeLine,
      color: 'text-blue-500',
      description: 'Practice platform for coding and algorithmic skills.'
    },
    {
      id: 38,
      name: 'Competitive Programming',
      category: 'dsa',
      icon: RiShieldLine,
      color: 'text-orange-500',
      description: 'Problem-solving contests to sharpen coding skills.'
    }
  ];

  const filteredTechnologies = selectedCategory === 'all' 
    ? technologies 
    : technologies.filter(tech => tech.category === selectedCategory);

  return (
    <div className="min-h-screen bg-black bg-no-repeat bg-cover bg-center py-12" style={{ backgroundImage: `url(${bg3})` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-white">Code Labs</h1>
          <p className="mt-2 text-lg text-gray-300">
            Explore and master a wide range of technologies
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
              }`}
            >
              <category.icon className="mr-2 h-4 w-4" />
              {category.name}
            </button>
          ))}
        </div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {filteredTechnologies.map((tech) => (
            <TechnologyCard 
              key={tech.id} 
              tech={tech} 
              activeCardId={activeCardId} 
              setActiveCardId={setActiveCardId} 
            />
          ))}
        </motion.div>

        <div className="mt-12 text-center">
          <a
            href="https://labs.socialhire.in/register"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
          >
            Explore Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default CodeLabs;