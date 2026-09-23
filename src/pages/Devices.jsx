import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; 
import { getDevices, updateDevice, deleteDevice } from '../features/deviceSlice'; 
import RegisterDeviceModal from '../components/addDevice'; 
import EditDeviceModal from '../components/editDevice'; // Ensure this component exists or create it

const DevicesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, status } = useSelector(state => state.devices);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDeviceToEdit, setSelectedDeviceToEdit] = useState(null);

  // Search and Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'name' | 'status'

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

  // Opens the edit modal for a specific device
  const handleOpenEdit = (device) => {
    setSelectedDeviceToEdit(device);
    setIsEditModalOpen(true);
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

  // Filter and Sort Logic
  const filteredAndSortedDevices = useMemo(() => {
    if (!items) return [];

    // Filter by search query
    const filtered = items.filter((device) => {
      const term = searchTerm.toLowerCase();
      const deviceName = device.deviceName?.toLowerCase() || '';
      const hwId = device.deviceHardwareId?.toLowerCase() || '';
      const customerName = device.owner?.name?.toLowerCase() || '';
      const issues = device.issues?.join(', ').toLowerCase() || '';

      return deviceName.includes(term) || hwId.includes(term) || customerName.includes(term) || issues.includes(term);
    });

    // Sort results
    return filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return (a.deviceName || '').localeCompare(b.deviceName || '');
      } else if (sortBy === 'status') {
        return (a.deviceRepairingStatus || '').localeCompare(b.deviceRepairingStatus || '');
      } else {
        // Default: 'newest' (by createdAt or _id timestamp fallback)
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });
  }, [items, searchTerm, sortBy]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto w-full">
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Device Repair Tracking</h1>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-blue-500/20"
        >
          <span>+</span> Register Device
        </button>
      </header>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-zinc-900 p-4 rounded-xl shadow-md border border-zinc-800">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by device, hardware ID, customer, or issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 text-zinc-100 placeholder-zinc-500 px-4 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:border-blue-500 text-xs sm:text-sm transition-all"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-zinc-950 text-zinc-200 text-xs sm:text-sm px-3 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="name">Device Name</option>
            <option value="status">Status Flow</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-xl w-full border border-zinc-800">
        <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-zinc-800">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-zinc-800/50 border-b border-zinc-800">
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Device / HWID</th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Customer</th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Issue Matrix Faults</th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status Flow</th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Workflow Actions</th>
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
              ) : filteredAndSortedDevices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-zinc-500 text-sm italic">
                    {items.length === 0 ? "No devices currently under repair." : "No devices match your search criteria."}
                  </td>
                </tr>
              ) : (
                filteredAndSortedDevices.map((device) => (
                  <tr key={device._id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-4 sm:px-6 py-3">
                      <div className="text-xs sm:text-sm font-semibold text-zinc-100">{device.deviceName}</div>
                      <div className="text-[11px] sm:text-xs font-mono text-zinc-500 mt-0.5">{device.deviceHardwareId}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm text-zinc-300">
                      {device.owner?.name || <span className="text-zinc-600 italic">No Owner Assigned</span>}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm text-zinc-400">
                      {device.issues && device.issues.length > 0 ? (
                        <div className="truncate max-w-[180px] sm:max-w-[250px]" title={device.issues.join(", ")}>
                          {device.issues.slice(0, 3).join(", ") + (device.issues.length > 3 ? "..." : "")}
                        </div>
                      ) : (
                        <span className="text-zinc-600 italic">No issues reported</span>
                      )}
                    </td>
                    
                    {/* Dynamic Status Dropdown Selector Cell */}
                    <td className="px-4 sm:px-6 py-3">
                      <select
                        value={device.deviceRepairingStatus}
                        onChange={(e) => handleStatusChange(device, e.target.value)}
                        className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 sm:py-1.5 rounded-full border bg-zinc-950 focus:outline-none focus:ring-2 cursor-pointer transition-all ${getStatusStyles(device.deviceRepairingStatus)}`}
                      >
                        <option value="in-progress" className="bg-zinc-900 text-amber-400">In Progress</option>
                        <option value="resolved" className="bg-zinc-900 text-emerald-400">Resolved</option>
                        <option value="rejected" className="bg-zinc-900 text-red-400">Rejected</option>
                      </select>
                    </td>

                    {/* Conditional Action Actions Layout Cell */}
                    <td className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-medium">
                      <div className="flex justify-end items-center gap-3 min-h-[32px] flex-wrap lg:flex-nowrap">
                        {device.deviceRepairingStatus === 'resolved' && (
                          <button 
                            onClick={() => handleProceedToBilling(device)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] sm:text-xs px-3 py-1.5 rounded-lg shadow-md shadow-emerald-600/10 transition-all shrink-0"
                          >
                            Proceed to Billing →
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(device)}
                          className="text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 lg:bg-transparent px-2 py-1.5 lg:p-0 rounded text-[11px] sm:text-xs font-semibold lg:opacity-0 lg:group-hover:opacity-100 duration-150 shrink-0"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(device._id)}
                          className="text-red-400 hover:text-red-300 transition-colors bg-red-500/10 lg:bg-transparent px-2 py-1.5 lg:p-0 rounded text-[11px] sm:text-xs font-semibold lg:opacity-0 lg:group-hover:opacity-100 duration-150 shrink-0"
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

      {/* Modals */}
      <RegisterDeviceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {isEditModalOpen && (
        <EditDeviceModal 
          isOpen={isEditModalOpen} 
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedDeviceToEdit(null);
          }} 
          device={selectedDeviceToEdit}
        />
      )}
    </div>
  );
};

export default DevicesPage;