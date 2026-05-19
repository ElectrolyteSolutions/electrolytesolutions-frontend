import React from 'react';
import { Link } from 'react-router-dom';
// Optional: Import icons from lucide-react or react-icons
// import { Twitter, Github, Linkedin } from 'lucide-react';
import iconUrl from '../assets/icon.png'


const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'Features', path: '/features' },
        { name: 'Integrations', path: '/integrations' },
        { name: 'Pricing', path: '/pricing' },
        { name: 'Changelog', path: '/changelog' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', path: '/about' },
        { name: 'Careers', path: '/careers' },
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Terms of Service', path: '/terms' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Documentation', path: '/docs' },
        { name: 'Help Center', path: '/help' },
        { name: 'Contact', path: '/contact' },
        { name: 'Status', path: '/status' },
      ],
    },
  ];

  return (
    <footer className="bg-zinc-900 border-t border-zinc-800 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:py-16 lg:px-8">
        
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <img src={iconUrl} alt="Logo" className="h-8 w-8 grayscale brightness-200" />
              <span className="text-white font-bold text-xl">Electrolyte Solutions</span>
            </Link>
            <p className="text-sm leading-6 max-w-xs">
              Making professional dashboard management seamless and intuitive for teams worldwide.
            </p>
            <div className="flex space-x-5">
              {/* Replace with actual social icons */}
              <div className="h-5 w-5 bg-zinc-700 rounded-full hover:bg-zinc-600 cursor-pointer" />
              <div className="h-5 w-5 bg-zinc-700 rounded-full hover:bg-zinc-600 cursor-pointer" />
              <div className="h-5 w-5 bg-zinc-700 rounded-full hover:bg-zinc-600 cursor-pointer" />
            </div>
          </div>

          {/* Links Sections */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                  {footerSections[0].title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {footerSections[0].links.map((link) => (
                    <li key={link.name}>
                      <Link to={link.path} className="text-sm hover:text-white transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                  {footerSections[1].title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {footerSections[1].links.map((link) => (
                    <li key={link.name}>
                      <Link to={link.path} className="text-sm hover:text-white transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-1">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                  {footerSections[2].title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {footerSections[2].links.map((link) => (
                    <li key={link.name}>
                      <Link to={link.path} className="text-sm hover:text-white transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs">
            &copy; {currentYear} ElectrolyteSolutions Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              V 1.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;