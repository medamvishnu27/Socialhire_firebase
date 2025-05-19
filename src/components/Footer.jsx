import { Link } from 'react-router-dom';
import { FiLinkedin, FiMail, FiInstagram, FiYoutube } from 'react-icons/fi';
import { FaXTwitter, FaFacebook } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  const links = {
    company: [
      { label: 'About Us', path: '/About' },
      { label: 'Contact', path: '/Contactus' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' }
    ],
    resources: [
      { label: 'Blog', href: '#' },
      { label: 'Help Center', href: '#' },
      { label: 'Career Tips', href: '#' },
      { label: 'Student Guide', href: '#' }
    ],
    social: [
      { label: 'Instagram', href: 'https://www.instagram.com/socialhire.in?igsh=MWxiNmJubDJoNmoxOA==', icon: FiInstagram },
      { label: 'Twitter', href: 'https://x.com/social_prachar', icon: FaXTwitter },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/company/socialprachar-com/posts/?feedView=all', icon: FiLinkedin },
      { label: 'Email', href: 'mailto:connect@socialhire.in', icon: FiMail },
      { label: 'Youtube', href: 'https://www.youtube.com/@socialprachar', icon: FiYoutube },
      { label: 'Facebook', href: 'https://x.com/social_prachar', icon: FaFacebook }
    ]
  };

  return (
    <footer className="bg-black border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1">
            <Link to="/" className="text-primary-100 font-extrabold text-2xl" style={{
              background: 'linear-gradient(to right, #0284c7 44%, #CFA575 66%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              SocialHire
            </Link>
            <p className="mt-4 text-sm text-gray-100">
              Your one-stop platform for career development and professional growth.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase">
              Company
            </h3>
            <ul className="mt-4 space-y-4">
              {links.company.map((link) => (
                <li key={link.label}>
                  {link.path ? (
                    <Link
                      to={link.path}
                      className="text-base text-gray-100 hover:text-primary-600"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-base text-gray-100 hover:text-primary-600"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase">
              Resources
            </h3>
            <ul className="mt-4 space-y-4">
              {links.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-base text-gray-100 hover:text-primary-600"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase">
              Connect With Us
            </h3>
            <ul className="mt-4 space-y-4">
              {links.social.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-gray-100 hover:text-primary-600 flex items-center"
                  >
                    <link.icon className="h-5 w-5 mr-2" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-base text-gray-100">
              © {currentYear} SocialHire. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              {links.social.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-100 hover:text-primary-600"
                >
                  <span className="sr-only">{link.label}</span>
                  <link.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
