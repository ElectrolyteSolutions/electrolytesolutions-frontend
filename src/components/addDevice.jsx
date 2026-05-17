import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addDevice } from '../features/deviceSlice';
import { getCustomers } from '../features/customerSlice';

const RegisterDeviceModal = ({ isOpen, onClose, preSelectedCustomerId = '' }) => {
  const dispatch = useDispatch();
  const customers = useSelector((state) => state.customers.items);
  
  // Local input tracker for the issue field before it is committed to the array
  const [currentIssueInput, setCurrentIssueInput] = useState('');

  const [form, setForm] = useState({
    owner: preSelectedCustomerId,
    deviceName: '',
    issues: [], // ⚡ Updated from issueType to matches your array rules schema
    deviceHardwareId: '',
    deviceRepairingStatus: 'in-progress'
  });

  useEffect(() => {
    if (customers.length === 0) {
      dispatch(getCustomers());
    }
    if (preSelectedCustomerId) {
      setForm((prev) => ({ ...prev, owner: preSelectedCustomerId }));
    }
  }, [dispatch, customers.length, preSelectedCustomerId]);

  if (!isOpen) return null;

  // Append a tag to the issues array tracking payload
  const handleAddIssue = (e) => {
    if (e) e.preventDefault(); // Prevent modal form firing prematurely
    const trimmedInput = currentIssueInput.trim();
    
    if (trimmedInput && !form.issues.includes(trimmedInput)) {
      setForm({ ...form, issues: [...form.issues, trimmedInput] });
      setCurrentIssueInput(''); // Clear typing box area
    }
  };

  // Remove individual target tag from list state mapping
  const handleRemoveIssue = (indexToRemove) => {
    setForm({
      ...form,
      issues: form.issues.filter((_, idx) => idx !== indexToRemove)
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.owner) return alert('Please assign a customer profile');
    
    // Fallback block to safely parse text remaining inside input box if form submission is hit directly
    let finalIssuesArray = [...form.issues];
    if (currentIssueInput.trim() && !finalIssuesArray.includes(currentIssueInput.trim())) {
      finalIssuesArray.push(currentIssueInput.trim());
    }

    if (finalIssuesArray.length === 0) {
      return alert('Please describe at least one device fault or hardware issue.');
    }

    const payload = { ...form, issues: finalIssuesArray };
    dispatch(addDevice(payload));
    dispatch(getCustomers());
    
    // Clean inputs up completely
    setForm({
      owner: preSelectedCustomerId,
      deviceName: '',
      issues: [],
      deviceHardwareId: '',
      deviceRepairingStatus: 'in-progress'
    });
    setCurrentIssueInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/30">
          <h3 className="text-lg font-bold text-white">Repair Registration</h3>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-white transition-colors text-xl">&times;</button>
        </div>
        
        {/* Form Container */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Assigned Customer</label>
            <select 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer disabled:opacity-50"
              onChange={e => setForm({...form, owner: e.target.value})} 
              value={form.owner}
              disabled={!!preSelectedCustomerId}
              required
            >
              <option value="">Select a customer...</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Device Model</label>
            <input 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="e.g. MacBook Pro M2" 
              value={form.deviceName}
              onChange={e => setForm({...form, deviceName: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Hardware ID</label>
            <input 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="SN / IMEI" 
              value={form.deviceHardwareId}
              onChange={e => setForm({...form, deviceHardwareId: e.target.value})} 
              required 
            />
          </div>

          {/* ⚡ NEW: Dynamic Tag Input Element Block for Multiple Issues Tracking */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Reported Issues / Faults</label>
            <div className="flex gap-2">
              <input 
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="Type fault & click add (e.g. Broken Glass)" 
                value={currentIssueInput}
                onChange={e => setCurrentIssueInput(e.target.value)}
                onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); handleAddIssue(); } }}
              />
              <button 
                type="button"
                onClick={handleAddIssue}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-4 rounded-lg font-bold transition-all text-sm"
              >
                + Add
              </button>
            </div>

            {/* Render dynamically added problem tag groups layout map */}
            {form.issues.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5 p-2 bg-zinc-950/60 border border-zinc-800/80 rounded-lg max-h-[100px] overflow-y-auto">
                {form.issues.map((issue, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-2.5 py-1 rounded-md"
                  >
                    <span>{issue}</span>
                    <button 
                      type="button"
                      onClick={() => handleRemoveIssue(idx)}
                      className="text-blue-500 hover:text-red-400 transition-colors font-bold pl-0.5 text-xs"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-8">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 font-semibold hover:bg-zinc-800 transition-colors text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all text-sm shadow-lg shadow-blue-500/20"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterDeviceModal;