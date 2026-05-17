import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; 
import { getDevices, updateDevice, deleteDevice } from '../features/deviceSlice'; 
import RegisterDeviceModal from '../components/addDevice'; 

const DevicesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, status } = useSelector(state => state.devices);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(getDevices());
  }, [dispatch]);

  // Handle inline status dropdown updates
  const handleStatusChange = (device, newStatus) => {
    dispatch(updateDevice({ id: device._id, data: { ...device, deviceRepairingStatus: newStatus } }))
      .unwrap()
      .then(() => {
        dispatch(getDevices());
      })
      .catch((err) => alert(`Status synchronization failed: ${err.message || err}`));
  };

  // Inline styling matcher for dropdown micro-badges
  const getStatusStyles = (statusVal) => {
    switch (statusVal) {
      case 'resolved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 focus:ring-emerald-500/30';
      case 'rejected':
        return 'bg-red-500/10 text-red-400 border-red-500/30 focus:ring-red-200/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 focus:ring-amber-500/30';
    }
  };

  // Triggers device asset record cleanup
  const handleDeleteRecord = (deviceId) => {
    if (window.confirm("Are you sure you want to completely remove this device from repair tracking?")) {
      dispatch(deleteDevice(deviceId))
        .unwrap()
        .then(() => dispatch(getDevices()))
        .catch((err) => alert(`Failed to delete device: ${err.message || err}`));
    }
  };

  // Safe router navigation passing deep parameters across browser tabs
  const handleProceedToBilling = (device) => {
    if (!device.owner) return alert("Cannot bill an unassigned customer account asset.");
    
    navigate('/billing', { 
      state: { 
        autoCustomerId: device.owner._id,
        autoPurpose: 'repair',
        autoDeviceId: device._id
      } 
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-4 max-w-[1400px] mx-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Device Repair Tracking</h1>
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
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Issue Matrix Faults</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status Flow</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {status === 'loading' ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-zinc-500 italic">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading telemetry arrays...
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-zinc-500 text-sm italic">No devices currently under repair.</td>
                </tr>
              ) : (
                items.map((device) => (
                  <tr key={device._id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-zinc-100">{device.deviceName}</div>
                      <div className="text-xs font-mono text-zinc-500 mt-0.5">{device.deviceHardwareId}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {device.owner?.name || <span className="text-zinc-600 italic">No Owner Assigned</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {device.issues && device.issues.length > 0 ? (
                        device.issues.slice(0, 3).join(", ") + (device.issues.length > 3 ? "..." : "")
                      ) : (
                        <span className="text-zinc-600 italic">No issues reported</span>
                      )}
                    </td>
                    
                    {/* Dynamic Status Dropdown Selector Cell */}
                    <td className="px-6 py-4">
                      <select
                        value={device.deviceRepairingStatus}
                        onChange={(e) => handleStatusChange(device, e.target.value)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-zinc-950 focus:outline-none focus:ring-2 cursor-pointer transition-all ${getStatusStyles(device.deviceRepairingStatus)}`}
                      >
                        <option value="in-progress" className="bg-zinc-900 text-amber-400">In Progress</option>
                        <option value="resolved" className="bg-zinc-900 text-emerald-400">Resolved</option>
                        <option value="rejected" className="bg-zinc-900 text-red-400">Rejected</option>
                      </select>
                    </td>

                    {/* Conditional Action Actions Layout Cell */}
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-4 min-h-[32px]">
                        {device.deviceRepairingStatus === 'resolved' && (
                          <button 
                            onClick={() => handleProceedToBilling(device)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-md shadow-emerald-600/10 animate-in fade-in zoom-in-95 duration-200 transition-all"
                          >
                            Proceed to Billing →
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteRecord(device._id)}
                          className="text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100 duration-150"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RegisterDeviceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default DevicesPage;