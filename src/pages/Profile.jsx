import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getUserProfile, 
  updateUserProfile, 
  getActiveSessions, 
  terminateSession,
  logoutAllDevices,
  resetState 
} from '../features/authSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, sessions, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });

  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    dispatch(getUserProfile());
    dispatch(getActiveSessions());

    return () => {
      dispatch(resetState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        password: ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (isSuccess && message) {
      setFeedback(message);
      const timer = setTimeout(() => setFeedback(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, message]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUserProfile(formData));
  };

  const handleTerminateSession = (sessionId) => {
    dispatch(terminateSession(sessionId));
  };

  const handleLogoutAll = () => {
    if (window.confirm('Are you sure you want to log out from all active devices?')) {
      dispatch(logoutAllDevices());
    }
  };

  if (isLoading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-500 italic gap-3">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        Synchronizing active ledger matrices...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full max-w-[1400px] mx-auto font-sans">
      
      {/* Header Section */}
      <header className="flex items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Account Settings & Profile</h1>
        </div>
      </header>

      {isError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-xs sm:text-sm">
          {message}
        </div>
      )}

      {feedback && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-xs sm:text-sm">
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SECTION 1: Edit Profile Form */}
        <div className="bg-zinc-900 p-4 sm:p-6 rounded-xl shadow-xl border border-zinc-800/60">
          <h3 className="text-base sm:text-lg font-bold text-white mb-4">Edit Profile Details</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1.5 ml-0.5">Full Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                className="w-full bg-zinc-950 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1.5 ml-0.5">Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                className="w-full bg-zinc-950 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1.5 ml-0.5">Phone Number</label>
              <input 
                type="text" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                className="w-full bg-zinc-950 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1.5 ml-0.5">Address</label>
              <input 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                className="w-full bg-zinc-950 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1.5 ml-0.5">New Password (leave blank to keep current)</label>
              <input 
                type="password" 
                name="password" 
                placeholder="At least 6 characters"
                value={formData.password} 
                onChange={handleChange} 
                className="w-full bg-zinc-950 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 cursor-pointer mt-2"
            >
              {isLoading ? 'Updating...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* SECTION 2: Active Sessions Management */}
        <div className="bg-zinc-900 p-4 sm:p-6 rounded-xl shadow-xl border border-zinc-800/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base sm:text-lg font-bold text-white">Active Login Sessions</h3>
              {sessions && sessions.length > 0 && (
                <button
                  onClick={handleLogoutAll}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Log out all devices
                </button>
              )}
            </div>
            <p className="text-zinc-500 text-xs mb-4">Here is where and when your account is currently logged in.</p>

            {sessions && sessions.length === 0 ? (
              <p className="text-zinc-500 text-xs italic py-8 text-center">No active sessions found.</p>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                {sessions?.map((session) => (
                  <div 
                    key={session.sessionId} 
                    className={`bg-zinc-950 p-3.5 rounded-lg border border-zinc-800/80 flex items-center justify-between ${
                      session.isCurrent ? 'border-l-4 border-l-emerald-400' : 'border-l-4 border-l-zinc-700'
                    }`}
                  >
                    <div className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-zinc-200 text-xs sm:text-sm">{session.device}</span>
                        {session.isCurrent && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 whitespace-nowrap">
                            Current Device
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-400 text-xs font-mono mt-1">IP: {session.ipAddress}</p>
                      <p className="text-zinc-500 text-xs font-mono mt-0.5">Logged in: {new Date(session.loginAt).toLocaleString()}</p>
                    </div>

                    <button
                      onClick={() => handleTerminateSession(session.sessionId)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ml-4"
                    >
                      Log out
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;