import React from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import bg3 from '/bg-3.png';

const ContactUs = () => {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center bg-no-repeat bg-cover bg-center space-y-8" style={{ backgroundImage: `url(${bg3})` }}>
      {/* Contact Us Heading */}
      <h1 className="text-5xl font-bold text-white text-center">Contact Us</h1>

      {/* Contact Us Card */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-11/12 lg:w-1/2 h-auto bg-primary-600 py-10 px-8 shadow-2xl rounded-xl flex flex-col justify-center items-center"
        style={{ overflow: 'hidden' }}
      >
        <h2 className="text-3xl font-bold mb-4">Hey, Let's Get in Touch!</h2>
        <p className="text-gray-300 mb-6 leading-relaxed text-center">
          At SocialHire, our mission is to empower you to achieve your career dreams. Whether you have questions, need guidance, or want to explore how our AI-powered platform can help you land your ideal job, we're just a message away.
        </p>

        {/* Contact Information */}
        <div className="space-y-6 w-full">
          <div className="flex items-start gap-4">
            <FaMapMarkerAlt className="mt-1 text-3xl border p-1 rounded-2xl" />
            <div>
              <p><strong>Address:</strong> #508, 5th Floor,<br />
              Manjeera Majestic Commercial,<br />
              JNTU - HiTech City Road,<br />
              KPHB, Hyderabad - 500072</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <FaPhoneAlt className="text-3xl border p-1 rounded-2xl" />
            <p><strong>Contact:</strong> +91-8019 479 419</p>
          </div>

          <div className="flex items-center gap-4">
            <FaEnvelope className="text-3xl border p-1 rounded-2xl" />
            <p><strong>Email:</strong> connect@socialhire.in</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactUs;
