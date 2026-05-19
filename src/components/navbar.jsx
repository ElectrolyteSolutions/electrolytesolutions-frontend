import { Link, useLocation, useNavigate } from 'react-router-dom';
import iconUrl from '../assets/icon.png'
import { useEffect } from 'react';

const Navbar = () => {
  // Optional: Use location to highlight the 'active' link
  const location = useLocation();
  const navigate = useNavigate()


    useEffect(()=>{
        if (location.pathname === "/"){
            navigate("/dashboard")
        }
    },[location])

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
          
          {/* Left Side: Logo and Links */}
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

            {/* Desktop Navigation */}
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

          {/* Right Side: Actions (Optional) */}
          <div className="flex items-center gap-4">
             <button className="text-zinc-400 hover:text-white text-sm font-medium">
               Sign In
             </button>
             <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-semibold transition-all">
               Get Started
             </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;