import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateDevice, getDevices } from '../features/deviceSlice';
import { getCustomers } from '../features/customerSlice';

const EditDeviceModal = ({ isOpen, onClose, device }) => {
  const dispatch = useDispatch();
  const customers = useSelector((state) => state.customers.items);
  
  const [currentIssueInput, setCurrentIssueInput] = useState('');
  const [form, setForm] = useState({
    owner: '',
    deviceName: '',
    deviceType: 'mobile',
    customDeviceType: '',
    issues: [],
    deviceHardwareId: '',
    deviceRepairingStatus: 'in-progress'
  });

  // Populate form with existing device data when modal opens or device changes
  useEffect(() => {
    if (customers.length === 0) {
      dispatch(getCustomers());
    }
    
    if (device) {
      setForm({
        owner: device.owner?._id || device.owner || '',
        deviceName: device.deviceName || '',
        deviceType: device.deviceType || 'mobile',
        customDeviceType: device.customDeviceType || '',
        issues: device.issues ? [...device.issues] : [],
        deviceHardwareId: device.deviceHardwareId || '',
        deviceRepairingStatus: device.deviceRepairingStatus || 'in-progress'
      });
    }
  }, [device, customers.length, dispatch]);

  if (!isOpen || !device) return null;

  // Append a tag to the issues array tracking payload
  const handleAddIssue = (e) => {
    if (e) e.preventDefault();
    const trimmedInput = currentIssueInput.trim();
    
    if (trimmedInput && !form.issues.includes(trimmedInput)) {
      setForm({ ...form, issues: [...form.issues, trimmedInput] });
      setCurrentIssueInput('');
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
    
    if (form.deviceType === 'other' && !form.customDeviceType.trim()) {
      return alert('Please specify a custom device type name.');
    }
    
    let finalIssuesArray = [...form.issues];
    if (currentIssueInput.trim() && !finalIssuesArray.includes(currentIssueInput.trim())) {
      finalIssuesArray.push(currentIssueInput.trim());
    }

    if (finalIssuesArray.length === 0) {
      return alert('Please describe at least one device fault or hardware issue.');
    }

    const payload = { 
      ...form, 
      issues: finalIssuesArray,
      customDeviceType: form.deviceType === 'other' ? form.customDeviceType.trim() : ''
    };

    dispatch(updateDevice({ id: device._id, data: payload }))
      .unwrap()
      .then(() => {
        dispatch(getDevices());
        onClose();
      })
      .catch((err) => alert(`Failed to update device: ${err.message || err}`));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh] border border-zinc-800">
        
        {/* Modal Header */}
        <div className="p-3 sm:p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-white">Edit Device Record</h3>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-white transition-colors text-2xl leading-none">&times;</button>
        </div>
        
        {/* Form Container */}
        <form onSubmit={handleSave} className="p-3 sm:p-6 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Assigned Customer</label>
            <select 
              className="w-full bg-zinc-900 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
              onChange={e => setForm({...form, owner: e.target.value})} 
              value={form.owner}
              required
            >
              <option value="">Select a customer...</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Device Model</label>
            <input 
              className="w-full bg-zinc-900 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="e.g. MacBook Pro M2" 
              value={form.deviceName}
              onChange={e => setForm({...form, deviceName: e.target.value})} 
              required 
            />
          </div>

          {/* Device Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Device Type</label>
            <select
              value={form.deviceType}
              onChange={(e) => setForm({ ...form, deviceType: e.target.value })}
              className="w-full bg-zinc-900 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 capitalize cursor-pointer"
            >
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
              <option value="printer">Printer</option>
              <option value="desktop">Desktop</option>
              <option value="laptop">Laptop</option>
              <option value="speaker">Speaker</option>
              <option value="other">Other (Custom)</option>
            </select>
          </div>

          {form.deviceType === 'other' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Specify Custom Type</label>
              <input
                type="text"
                placeholder="e.g., Smartwatch, Console..."
                value={form.customDeviceType}
                onChange={(e) => setForm({ ...form, customDeviceType: e.target.value })}
                className="w-full bg-zinc-900 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Hardware ID</label>
            <input 
              className="w-full bg-zinc-900 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="SN / IMEI" 
              value={form.deviceHardwareId}
              onChange={e => setForm({...form, deviceHardwareId: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Repair Status</label>
            <select 
              className="w-full bg-zinc-900 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
              value={form.deviceRepairingStatus}
              onChange={e => setForm({...form, deviceRepairingStatus: e.target.value})}
            >
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Dynamic Tag Input Element Block for Multiple Issues Tracking */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Reported Issues / Faults</label>
            <div className="flex gap-2">
              <input 
                className="flex-1 min-w-0 bg-zinc-900 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="Type fault & click add..." 
                value={currentIssueInput}
                onChange={e => setCurrentIssueInput(e.target.value)}
                onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); handleAddIssue(); } }}
              />
              <button 
                type="button"
                onClick={handleAddIssue}
                className="shrink-0 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 sm:px-4 rounded-lg font-bold transition-all text-xs sm:text-sm"
              >
                + Add
              </button>
            </div>

            {form.issues.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5 p-2 bg-zinc-900/60 rounded-lg max-h-[100px] overflow-y-auto scrollbar-thin border border-zinc-800/60">
                {form.issues.map((issue, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-2.5 py-1 rounded-md"
                  >
                    <span className="truncate max-w-[150px] sm:max-w-[200px]">{issue}</span>
                    <button 
                      type="button"
                      onClick={() => handleRemoveIssue(idx)}
                      className="text-blue-500 hover:text-red-400 transition-colors font-bold pl-0.5 text-xs shrink-0"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2 sm:pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-2.5 rounded-lg text-zinc-300 font-semibold bg-zinc-900 hover:bg-zinc-800 transition-colors text-xs sm:text-sm border border-zinc-800"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all text-xs sm:text-sm shadow-lg shadow-blue-500/20"
            >
              Update Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDeviceModal;