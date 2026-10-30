import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getUserProfile, 
  updateUserProfile, 
  getActiveSessions, 
  terminateSession,
  logoutAllDevices,
  logout, 
  resetState 
} from '../features/authSlice';
import Button from '../components/button';
import Badge from '../components/badge';
import GlobalTable from '../components/table.large';
import ResizablePanes from '../components/table.extralarge';
import { useToast } from '../context/ToastContext';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { profileData, sessions, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    gst: '',
    pan: '',
    udyam: '',
    contactemail: '',
    bankaccountnumber: '',
    bankifsc: '',
    bankname: '',
    upi: ''
  });

  useEffect(() => {
    dispatch(getUserProfile());
    dispatch(getActiveSessions());

    // Poll active sessions every 30 seconds to keep telemetry updated
    const sessionInterval = setInterval(() => {
      dispatch(getActiveSessions());
    }, 30000);

    return () => {
      clearInterval(sessionInterval);
      dispatch(resetState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        password: '',
        gst: profileData.gst || '',
        pan: profileData.pan || '',
        udyam: profileData.udyam || '',
        contactemail: profileData.contactemail || '',
        bankaccountnumber: profileData.bankaccountnumber || '',
        bankifsc: profileData.bankifsc || '',
        bankname: profileData.bankname || '',
        upi: profileData.upi || ''
      });
    }
  }, [profileData]);

  useEffect(() => {
    if (isSuccess && message) {
      const displayMsg = typeof message === 'string' ? message : (message?.message || 'Success');
      addToast(displayMsg, "success");
    }
  }, [isSuccess, message, addToast]);

  useEffect(() => {
    if (isError && message) {
      const displayMsg = typeof message === 'string' ? message : (message?.message || 'An error occurred');
      addToast(displayMsg, "error");
    }
  }, [isError, message, addToast]);

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

  const handleTerminateSession = (session) => {
    if (session.isCurrent) {
      if (window.confirm("This is your current active session. Are you sure you want to log out?")) {
        dispatch(logout());
      }
      return;
    }

    dispatch(terminateSession(session.sessionId))
      .unwrap()
      .then(() => {
        addToast("Session terminated successfully", "success");
        dispatch(getActiveSessions());
      })
      .catch((err) => {
        addToast(err || "Failed to terminate session", "error");
      });
  };

  const handleLogoutAll = () => {
    if (window.confirm('Are you sure you want to log out from all active devices?')) {
      dispatch(logoutAllDevices())
        .unwrap()
        .then(() => {
          dispatch(logout());
        })
        .catch((err) => {
          addToast(err || "Failed to log out all devices", "error");
        });
    }
  };

  if (isLoading && !profileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-500 italic gap-3">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        Synchronizing active ledger matrices...
      </div>
    );
  }

  // Sessions Table Configuration using GlobalTable & Badge
  const sessionTableHead = [
    { label: 'Device & IP', value: 'device',width: 4 * 8  },
    { label: 'Login Timestamp', value: 'loginAt',width: 4 * 8  },
    { label: 'Status', value: 'status',width : 4 * 2  },
    { label: 'Actions', value: 'actions',width : 4 * 8 , class:"text-right" }
  ];

  function sessionTableData(session) {
    return [
      { 
        label: 'Device & IP', 
        value: (
          <div>
            <div className="font-semibold text-zinc-200">{session.device}</div>
            <div className="text-[11px] text-zinc-400 font-mono">IP: {session.ipAddress}</div>
          </div>
        ), 
      },
      { 
        label: 'Login Timestamp', 
        value: <span className="font-mono text-zinc-400">{new Date(session.loginAt).toLocaleString()}</span>, 
      },
      { 
        label: 'Status', 
        value: (
          <Badge 
            title={session.isCurrent ? "Current Device" : "Active"} 
            type={session.isCurrent ? "dark" : "light"} 
          />
        ), 
      },
      { 
        label: 'Actions', 
        value: (
          <div className="text-right">
            <Button
              type="danger"
              onClick={() => handleTerminateSession(session)}
              label="Log out"
              className="text-xs py-1"
            />
          </div>
        ), 
      }
    ];
  }

  // Left Pane: Edit Profile Form
  const leftPaneContent = (
    <div className="p-6 w-full h-full flex flex-col overflow-y-auto custom-scrollbar bg-vercel-black">
      <div className="text-vercel-suraface p-4 sm:p-6 rounded-xl shadow-xl border-1 border-zinc-800/60">
        <h3 className="text-sm font-bold text-vercel-primary mb-4">Edit Profile & Business Details</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label >Full Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData?.name} 
                onChange={handleChange} 
                required 
                
              />
            </div>

            <div>
              <label >Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData?.email} 
                onChange={handleChange} 
                required 
                
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label >Phone Number</label>
              <input 
                type="text" 
                name="phone" 
                value={formData?.phone} 
                onChange={handleChange} 
                
              />
            </div>

            <div>
              <label >Contact Email</label>
              <input 
                type="email" 
                name="contactemail" 
                value={formData?.contactemail} 
                onChange={handleChange} 
                
              />
            </div>
          </div>

          <div>
            <label >Address</label>
            <input 
              type="text" 
              name="address" 
              value={formData?.address} 
              onChange={handleChange} 
              
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label >GST Number</label>
              <input 
                type="text" 
                name="gst" 
                value={formData?.gst} 
                onChange={handleChange} 
              />
            </div>

            <div>
              <label >PAN Number</label>
              <input 
                type="text" 
                name="pan" 
                value={formData?.pan} 
                onChange={handleChange} 
              />
            </div>

            <div>
              <label >Udyam Registration</label>
              <input 
                type="text" 
                name="udyam" 
                value={formData?.udyam} 
                onChange={handleChange} 
                
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label >Bank Name</label>
              <input 
                type="text" 
                name="bankname" 
                value={formData?.bankname} 
                onChange={handleChange} 
                
              />
            </div>

            <div>
              <label >Account Number</label>
              <input 
                type="text" 
                name="bankaccountnumber" 
                value={formData?.bankaccountnumber} 
                onChange={handleChange} 
              />
            </div>

            <div>
              <label >IFSC Code</label>
              <input 
                type="text" 
                name="bankifsc" 
                value={formData?.bankifsc} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div>
            <label >UPI ID</label>
            <input 
              type="text" 
              name="upi" 
              value={formData?.upi} 
              onChange={handleChange} 
              placeholder="e.g. username@okhdfcbank" 
            />
          </div>

          <div>
            <label >New Password (leave blank to keep current)</label>
            <input 
              type="password" 
              name="password" 
              placeholder="At least 6 characters"
              value={formData?.password} 
              onChange={handleChange} 
              
            />
          </div>

          <Button 
            type="primary"
            disabled={isLoading} 
            label={isLoading ? 'Updating...' : 'Save Changes'}
          />
        </form>
      </div>
    </div>
  );

  // Right Pane: Active Sessions Management
  const rightPaneContent = (
    <div className="p-6 w-full h-full flex flex-col justify-between text-vercel-suraface border-l border-zinc-800 overflow-y-auto custom-scrollbar">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-vercel-primary">Active Login Sessions</h3>
          {sessions && sessions.length > 0 && (
            <Button
              type="danger"
              onClick={handleLogoutAll}
              label="Log out all devices"
            />
          )}
        </div>
        <p className="text-zinc-500 text-xs mb-4">Here is where and when your account is currently logged in.</p>

        {sessions && sessions.length === 0 ? (
          <p className="text-zinc-500 text-xs italic py-8 text-center">No active sessions found.</p>
        ) : (
          <div className="max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
            <GlobalTable
              title="Session"
              tableHead={sessionTableHead}
              filteredList={sessions || []}
              status="succeeded"
              selectedItem={null}
              setSelectedItem={() => {}}
              tableData={sessionTableData}
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-vercel-black">
      <ResizablePanes 
        animationKey="profile-sessions"
        leftPane={leftPaneContent}
        rightPane={rightPaneContent}
        defaultLeftWidth="45%"
      />
    </div>
  );
};

export default ProfilePage;