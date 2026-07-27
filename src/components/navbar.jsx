import { Link, useLocation, useNavigate } from 'react-router-dom';
import iconUrl from '../assets/icon.png';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice'; // ⚡ Import your logout action

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get current logged-in user from Redux
  const { user } = useSelector(state => state.auth);
  const {role}=user
  // State to manage mobile menu toggle
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Close the mobile menu automatically when a link is clicked and route changes
    setIsOpen(false);
  }, [location, navigate]);

  const handleLogout = () => {
    dispatch(logout()); // Clears token & user from Redux + LocalStorage
    navigate('/');      // Redirects to login
  };

  // ⚡ DYNAMIC LINKS GENERATION BASED ON ROLE
  const getNavLinks = () => {
    if (!role) return [];

    switch (role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Products', path: '/products' },
          { name: 'Devices', path: '/devices' },
          { name: 'Billing', path: '/billing' },
          { name: 'Stores / Customers', path: '/customers' },
          { name: 'Returns', path: '/returns' },
          { name: 'Profile', path: '/profile' }
        ];
      case 'store':
        return [
          { name: 'Products', path: '/products' },
          { name: 'Devices', path: '/devices' },
          { name: 'Billing', path: '/billing' },
          { name: 'Returns', path: '/returns' },
          { name: 'Profile', path: '/profile' }
        ];
      case 'customer':
      default:
        return [
          { name: 'Products', path: '/products' },
          { name: 'Profile', path: '/profile' }
        ];
    }
  };

  const navLinks = getNavLinks();

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
              <span className="text-white font-bold text-xl tracking-tight hidden sm:block">
                Electrolyte ERP
              </span>
            </Link>

            {/* Desktop Navigation (Hidden on mobile/tablet) */}
            <div className="hidden lg:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                    location.pathname === link.path
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side Actions: User Info & Logout */}
          <div className="flex items-center gap-4">
            
            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex flex-col text-right">
                <span className="text-sm font-bold text-zinc-200">{user?.name}</span>
                <span className="text-[10px] uppercase tracking-widest text-emerald-500">{user?.role}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Action Trigger Toggle Button */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 focus:outline-none transition-colors"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Responsive Navigation Panel Drawer */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:hidden bg-zinc-900 border-t border-zinc-800 animate-in slide-in-from-top-2`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                location.pathname === link.path
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
        
        {/* Mobile Sub-Actions Segment */}
        <div className="pt-4 pb-4 border-t border-zinc-800 px-5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-200">{user?.name}</span>
            <span className="text-[10px] uppercase tracking-widest text-emerald-500">{user?.role}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;