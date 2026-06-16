import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setCredentials } from '../features/authSlice'; 
import logourl from '../assets/icon.png';

const AuthLandingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Form toggles and states
  const [isLoginView, setIsLoginView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(''); // ⚡ Tracks registration success

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isLoginView) {
        // ⚡ FLOW 1: LOGIN
        const res = await axios.post(`${import.meta.env.VITE_API_URL}users/login`, { email, password });
        
        // Save token and user info to Redux & LocalStorage
        dispatch(setCredentials(res.data));
        
        // Send directly to dashboard upon successful login
        navigate('/dashboard'); 
        
      } else {
        // ⚡ FLOW 2: REGISTER
        await axios.post(`${import.meta.env.VITE_API_URL}users/register`, { name, email, password, role });
        
        // Do NOT log them in automatically. Switch to login view and show success banner.
        setSuccessMsg('Account provisioned successfully. Please log in with your new credentials.');
        setIsLoginView(true);
        setPassword(''); // Clear password for security, leave email populated for convenience
      }

    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isLoginView ? 'authenticate' : 'register'}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError('');
    setSuccessMsg('');
    setPassword('');
    setName('');
    setRole('customer');
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 font-sans">
      
      {/* LEFT HALF: Tech Branding Image Overlay (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900 overflow-hidden">
        {/* Unsplash Tech Hardware Image */}
        <img 
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop" 
          alt="Hardware Circuitry" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity"
        />
        {/* Premium Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent"></div>
        <div className="absolute inset-0 bg-emerald-900/10 mix-blend-overlay"></div>
        
        {/* Branding Content */}
        <div className="relative z-10 flex flex-col justify-end p-14 w-full h-full pb-24">
          <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest w-max mb-6 backdrop-blur-sm">
            System Architecture v2.0
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-[1.1]">
            Electrolyte<br />Solutions ERP.
          </h1>
          <p className="text-zinc-400 mt-5 text-base max-w-md leading-relaxed">
            Enterprise-grade point-of-sale, hardware repair tracking, and intelligent inventory management.
          </p>
        </div>
      </div>

      {/* RIGHT HALF: Authentication Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-[420px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Header & Logo Section */}
          <div className="flex flex-col items-center lg:items-center text-center lg:text-left space-y-4">
            <div className="">
              <img src={logourl} alt="Electrolyte Logo" className="w-28 h-28" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {isLoginView ? 'Welcome Back' : 'Create Workspace'}
              </h2>
              <p className="text-zinc-500 mt-1.5 text-sm font-medium">
                {isLoginView ? 'Enter your credentials to access the secure system.' : 'Register to provision a new role-based account.'}
              </p>
            </div>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs font-semibold text-center animate-in fade-in">
              {error}
            </div>
          )}
          
          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl text-xs font-semibold text-center animate-in fade-in">
              ✓ {successMsg}
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4 bg-zinc-900/40 p-6 sm:p-8 rounded-2xl border border-zinc-800/80 shadow-2xl backdrop-blur-sm">
            
            {/* Registration Only Fields */}
            {!isLoginView && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-0.5">Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-700"
                    placeholder="e.g. John Doe"
                    required={!isLoginView}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-0.5">Account Role</label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer"
                  >
                    <option value="customer">Customer (Portal Access)</option>
                    <option value="store">Store Operator (POS Access)</option>
                    {/* <option value="admin">System Administrator (Full Access)</option> */}
                  </select>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-0.5">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-700"
                placeholder="operator@company.com"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5 ml-0.5 mr-0.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Password</label>
                {isLoginView && <button type="button" className="text-[10px] font-bold text-zinc-500 hover:text-emerald-400 transition-colors">Forgot?</button>}
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-700"
                placeholder="••••••••"
                required
                minLength="6"
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-3.5 rounded-lg text-sm tracking-wider uppercase transition-all shadow-lg shadow-emerald-900/20 mt-6 flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                isLoginView ? 'Authenticate' : 'Initialize Account'
              )}
            </button>
          </form>

          {/* Toggle View Footer */}
          <div className="text-center pt-2">
            <p className="text-zinc-500 text-xs sm:text-sm font-medium">
              {isLoginView ? "Don't have system access? " : "Already have an assigned role? "}
              <button 
                type="button" 
                onClick={toggleView}
                className="font-bold text-emerald-500 hover:text-emerald-400 hover:underline transition-all"
              >
                {isLoginView ? 'Request Account' : 'Login Here'}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthLandingPage;