import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDevices, addDevice } from '../features/deviceSlice';
import { getCustomers } from '../features/customerSlice';

const DevicesPage = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector(state => state.devices);
  const customers = useSelector(state => state.customers.items);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    owner: '',
    deviceName: '',
    issueType: '',
    deviceHardwareId: '',
    deviceRepairingStatus: 'in-progress'
  });

  useEffect(() => {
    dispatch(getDevices());
    dispatch(getCustomers());
  }, [dispatch]);

  const handleSave = (e) => {
    e.preventDefault();
    dispatch(addDevice(form));
    setIsModalOpen(false);
    setForm({ owner: '', deviceName: '', issueType: '', deviceHardwareId: '', deviceRepairingStatus: 'in-progress' });
  };

  // Helper for dynamic status colors
  const getStatusStyles = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Device Repair Tracking</h1>
          <p className="text-zinc-400 text-sm mt-1">Monitor repair status, hardware IDs, and assigned customers.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-blue-500/20"
        >
          <span>+</span> Register Device
        </button>
      </header>

      {/* Table Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-800/50 border-b border-zinc-800">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Device / HWID</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Issue Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-zinc-500 italic">
                    No devices currently under repair.
                  </td>
                </tr>
              ) : items.map((device) => (
                <tr key={device._id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-zinc-100">{device.deviceName}</div>
                    <div className="text-xs font-mono text-zinc-500 mt-0.5">{device.deviceHardwareId}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300">
                       <span className="text-zinc-600 italic">{device?.owner?.name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    {device.issueType}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyles(device.deviceRepairingStatus)}`}>
                      {device.deviceRepairingStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/30">
              <h3 className="text-lg font-bold text-white">Repair Registration</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Assigned Customer</label>
                <select 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                  onChange={e => setForm({...form, owner: e.target.value})} 
                  value={form.owner}
                  required
                >
                  <option value="">Select a customer...</option>
                  {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Device Model</label>
                <input 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="e.g. MacBook Pro M2" 
                  onChange={e => setForm({...form, deviceName: e.target.value})} 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Hardware ID</label>
                  <input 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="SN / IMEI" 
                    onChange={e => setForm({...form, deviceHardwareId: e.target.value})} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 ml-1">Issue Type</label>
                  <input 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="e.g. Battery" 
                    onChange={e => setForm({...form, issueType: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
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
      )}
    </div>
  );
};

export default DevicesPage;