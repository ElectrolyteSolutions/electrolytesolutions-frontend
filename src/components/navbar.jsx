import { Link, useLocation, useNavigate } from 'react-router-dom';
import iconUrl from '../assets/icon.png';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';

// Helper to render clean icons based on path or name
const getRouteIcon = (path) => {
  switch (path) {
    case '/dashboard':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case '/orders':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      );
    case '/products':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case '/devices':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case '/invoices':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      );
    case '/billing':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      );
    case '/customers':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case '/returns':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      );
    case '/profile':
    default:
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
  }
};

const Navbar = ({isCollapsed,setIsCollapsed}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { profileData, role } = useSelector(state => state.auth);
  
  // Navigation states
  const [isOpen, setIsOpen] = useState(false); // Mobile menu drawer

  useEffect(() => {
    setIsOpen(false);
  }, [location, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const getNavLinks = () => {
    if (!role) return [];

    switch (role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Orders', path: '/orders' },
          { name: 'Products', path: '/products' },
          { name: 'Devices', path: '/devices' },
          { name: 'Customers', path: '/customers' },
          { name: 'Invoices', path: '/invoices' },
          { name: 'Billing', path: '/billing' },
          { name: 'Returns', path: '/returns' },
          { name: 'Profile', path: '/profile' }
        ];
      case 'store':
        return [
          { name: 'Products', path: '/products' },
          { name: 'Devices', path: '/devices' },
          { name: 'Billing', path: '/billing' },
          { name: 'Invoices', path: '/invoices' },
          { name: 'Returns', path: '/returns' },
          { name: 'Stores / Customers', path: '/customers' },
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
    <>
      {/* Mobile Top Bar Header */}
      <div className="lg:hidden flex items-center justify-between bg-vercel-black border-b border-zinc-800 px-4 py-3 fixed top-0 left-0 right-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <img src={iconUrl} alt="Logo" className="h-7 w-7 rounded-md" />
          <span className="text-vercel-primary font-bold text-sm tracking-tight">Electrolyte ERP</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg text-zinc-400 hover:text-vercel-primary hover:bg-vercel-card focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-vercel-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Slide-over Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-vercel-black border-r border-zinc-800 flex flex-col transition-transform duration-300 lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 h-16 border-b border-zinc-800/80">
          <Link to="/" className="flex items-center gap-3">
            <img src={iconUrl} alt="Logo" className="h-8 w-8 rounded-lg" />
            <span className="text-vercel-primary font-bold text-base">Electrolyte ERP</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-vercel-card text-vercel-primary font-semibold'
                    : 'text-zinc-400 hover:text-vercel-primary hover:bg-vercel-secondary'
                }`}
              >
                <span className={isActive ? 'text-emerald-400' : 'text-zinc-400'}>
                  {getRouteIcon(link.path)}
                </span>
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-zinc-800/80 bg-vercel-black flex items-center justify-between">
          <div className="flex flex-col truncate pr-2">
            <span className="text-sm font-semibold text-zinc-200 truncate">{profileData?.name || 'User'}</span>
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-medium">{role}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all text-xs font-semibold"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Desktop Vercel-Style Left Sidebar */}
      <aside 
        className={`hidden lg:flex fixed overflow-none inset-y-0 left-0 z-30 flex-col bg-vercel-surface border-r border-zinc-800 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Sidebar Header & Collapse Toggle */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-800/80">
          <Link to="/" className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <img src={iconUrl} alt="Logo" className="h-8 w-8 rounded-lg shrink-0" />
            {!isCollapsed && (
              <span className="text-vercel-primary font-bold text-sm tracking-tight truncate">
                Electrolyte Solutions
              </span>
            )}
          </Link>
        </div>

        {/* Collapse Button Trigger */}
        <div className="px-3 py-2 border-b border-zinc-800/40 flex justify-end">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className="p-1.5 rounded-md text-zinc-400 hover:text-vercel-primary hover:bg-vercel-secondary transition-colors"
          >
            <svg 
              className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1  px-3 py-4 space-y-1 custom-scrollbar">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                title={isCollapsed ? link.name : ''}
                className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-vercel-selected text-vercel-primary font-bold shadow-sm'
                    : 'text-vercel-secondary hover:text-vercel-primary hover:bg-vercel-hover'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <span className={`shrink-0 ${isActive ? 'text-vercel-primary' : 'text-vercel-secondary group-hover:text-vercel-primary'}`}>
                  {getRouteIcon(link.path)}
                </span>
                {!isCollapsed && <span className="truncate">{link.name}</span>}
                
                {/* Tooltip when collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 bg-vercel-secondary text-vercel-primary text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-zinc-800">
                    {link.name}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Profile & Footer Actions */}
        <div className={`p-3 shadow-[0_0_15px_5px_rgba(0,0,0,0.1)] bg-vercel-black flex flex-col gap-3 ${isCollapsed ? 'items-center' : ''}`}>
          {!isCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex flex-col truncate pr-2">
                <span className="text-xs font-bold text-zinc-200 truncate">{profileData?.name || 'User'}</span>
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-medium">{role}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all text-xs font-semibold"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border-1 border-red-500/20 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Navbar;