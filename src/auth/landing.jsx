import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, resetState } from '../features/authSlice'; 
import logourl from '../assets/icon.png';
import { useToast } from '../context/ToastContext';
// Optional Lucide icons (replace with your preferred icon library or standard SVG/text)
import { Eye, EyeOff } from 'lucide-react';

const PasswordField = ({ isLoginView, password, setPassword }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5 ml-0.5 mr-0.5">
        <label>Password</label>
        {isLoginView && (
          <button 
            type="button" 
            className="text-[10px] font-medium text-vercel-blue hover:text-indigo-400 transition-colors"
          >
            Forgot Password?
          </button>
        )}
      </div>

      {/* Input wrapper relative positioning for the icon */}
      <div className="relative flex items-center">
        <input 
          type={showPassword ? "text" : "password"} 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength="6"
          className="w-full pr-10" // Extra right padding so text doesn't overlap the button
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 text-zinc-400 hover:text-zinc-200 transition-colors focus:outline-none"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
const AuthLandingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Pull state from the profile slice
  const { isLoading } = useSelector((state) => state.auth);

  // Form toggles and states
  const [isLoginView, setIsLoginView] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const {addToast} = useToast();

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');

  useEffect(() => {
    dispatch(resetState());
  }, [dispatch, isLoginView]);

  const handleAuthSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccessMsg('');

  if (isLoginView) {
    // Dispatch and let Redux handle the result safely without strictly needing 'await' if it triggers the warning
    dispatch(loginUser({ email, password }))
      .unwrap()
      .then((res) => {
        navigate('/dashboard');
      })
      .catch((err) => {
        setError(err || 'Failed to authenticate. Please check your credentials.');
      });
  } else {
    dispatch(registerUser({ name, email, password, role }))
      .unwrap()
      .then(() => {
        setSuccessMsg('Account provisioned successfully. Please log in with your new credentials.');
        setIsLoginView(true);
        setPassword('');
      })
      .catch((err) => {
        setError(err || 'Failed to register. Please try again.');
      });
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

  useEffect(() => {
    if(error){
      addToast(error, "error");
    }
    if(successMsg){
      addToast(successMsg, "success");
    }
  }, [error, successMsg]);

  return (
    <div className="h-screen w-screen bg-vercel-black d-flex items-center justify-center">
          <form onSubmit={handleAuthSubmit} className="rounded-md bg-vercel-card p-3 space-y-2 border-1 border-zinc-800 items-center">
            <p className='text-center font-bold'>Welcome to Electrolyte Solutions</p>
            {/* Registration Only Fields */}
            {!isLoginView && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label >Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required={!isLoginView}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-0.5">Account Role</label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="customer">Customer (Portal Access)</option>
                    <option value="store">Store Operator (POS Access)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label >Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@electrolyte.com"
                required
              />
            </div>

            {/* Password Field */}
            
            <PasswordField isLoginView={isLoginView} password={password} setPassword={setPassword} />
            <div className="text-center pt-2">
              <p className="text-zinc-500 text-[10px] font-medium">
                {isLoginView ? "Don't have system access? " : "Already have an assigned role? "}
                <button 
                  type="button" 
                  // onClick={toggleView}
                  onClick={()=>{alert('Come Back Later')}}
                  className="font-medium text-[10px] text-vercel-blue hover:text-indigo-300 hover:underline transition-all"
                >
                  {isLoginView ? 'Request Account' : 'Login Here'}
                </button>
              </p>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-vercel-primary hover:opacity-50 disabled:text-zinc-500 text-vercel-black font-bold py-2 rounded-md text-xs transition-all shadow-lg shadow-indigo-900/20 mt-6 flex justify-center items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                isLoginView ? 'Log In' : 'Initialize Account'
              )}
            </button>
          </form>        
        </div>
    
  );
};

export default AuthLandingPage;