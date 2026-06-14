import { Link, useLocation, useNavigate } from 'react-router-dom';
import iconUrl from '../assets/icon.png'
import { useEffect, useState } from 'react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // State to manage mobile menu toggle open/close
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/dashboard");
    }
    // Close the mobile menu automatically when a link is clicked and route changes
    setIsOpen(false);
  }, [location, navigate]);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Products', path: '/products' },
    { name: 'Customers', path: '/customers' },
    { name: 'Devices', path: '/devices' },
    { name: 'Billing', path: '/billing' },
    { name: 'Returns', path: '/returns' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-zinc-900 border-b border-zinc-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Side: Logo and Desktop Links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src={iconUrl} 
                alt="Logo" 
                className="h-9 w-9 rounded-lg transition-transform group-hover:scale-105" 
              />
              <span className="text-white font-bold text-xl tracking-tight">
                Electrolyte Solutions
              </span>
            </Link>

            {/* Desktop Navigation (Hidden on mobile/tablet) */}
            <div className="hidden md:flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side Actions: Desktop Actions & Mobile Menu Toggle Toggle */}
          <div className="flex items-center gap-4">
            {/* Desktop Actions (Hidden on mobile) */}
            <div className="hidden md:flex items-center gap-4">
              <button className="text-zinc-400 hover:text-white text-sm font-medium">
                Sign In
              </button>
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-semibold transition-all">
                Get Started
              </button>
            </div>

            {/* Mobile Menu Action Trigger Toggle Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 focus:outline-none transition-colors"
                aria-controls="mobile-menu"
                aria-expanded={isOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  // Close Icon (X)
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  // Hamburger Icon Menu
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Responsive Navigation Panel Drawer (Hidden on Desktop) */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-zinc-900 border-t border-zinc-800`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                location.pathname === link.path
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
        
        {/* Mobile Sub-Actions Segment */}
        <div className="pt-4 pb-4 border-t border-zinc-800 px-5 flex flex-col gap-3">
          <button className="w-full text-center text-zinc-400 hover:text-white text-base font-medium py-2 rounded-md hover:bg-zinc-800 transition-colors">
            Sign In
          </button>
          <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-md text-base font-semibold text-center transition-all shadow">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;