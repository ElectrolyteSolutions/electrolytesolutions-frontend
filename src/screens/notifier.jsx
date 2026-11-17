import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDevices,
  deleteDeviceById,
  deleteAllDevices,
  sendBroadcastNotification,
  sendToUser,
  sendToAdmin,
  clearMessages
} from '../features/androidSlice';
import ResizablePanes from '../components/table.extralarge';
import Header from '../components/SearchHeader';
import GlobalTable from '../components/table.large';
import { useToast } from '../context/ToastContext';
import Badge from '../components/badge';
import Button from '../components/button';
import ConfirmModal from '../components/modal.prompt';

const filterOptions = [
  { label: 'All Devices', value: 'all' },
  { label: 'Admin', value: 'admin' },
  { label: 'Regular User', value: 'user' }
];

const sortOptions = [
  { label: 'Latest Updated', value: 'newest' },
  { label: 'Device Model', value: 'model' }
];

const AndroidManagementPage = () => {
  const dispatch = useDispatch();
  const { devices, loading, actionLoading, error, successMessage } = useSelector((state) => state.android);
  const { addToast } = useToast();

  const [selectedDevice, setSelectedDevice] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(filterOptions[0]);
  const [sortBy, setSortBy] = useState(sortOptions[0]);

  // States for creating broadcast vs viewing device
  const [isCreatingBroadcast, setIsCreatingBroadcast] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Notification form states
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationBody, setNotificationBody] = useState('');
  const [broadcastAudience, setBroadcastAudience] = useState('all'); // 'all', 'admin', 'customer'

  useEffect(() => {
    dispatch(fetchDevices());
  }, [dispatch]);

  // Handle toast notifications for success/error states from Redux
  useEffect(() => {
    if (error) {
      addToast(error, 'error');
      dispatch(clearMessages());
    }
    if (successMessage) {
      addToast(successMessage, 'success');
      dispatch(clearMessages());
    }
  }, [error, successMessage, addToast, dispatch]);

  const handleConfirmDelete = () => {
    if (selectedDevice) {
      dispatch(deleteDeviceById(selectedDevice._id));
      addToast('Device token revoked successfully', 'success');
      setSelectedDevice(undefined);
      setIsDeleteModalOpen(false);
    }
  };

  const handleCreateBroadcastClick = () => {
    setIsCreatingBroadcast(true);
    setSelectedDevice(undefined);
  };

  function handleClose() {
    setSelectedDevice(undefined);
    setIsCreatingBroadcast(false);
  }

  const filteredAndSortedDevices = useMemo(() => {
    if (!devices) return [];

    const filtered = devices.filter((dev) => {
      const term = searchTerm.toLowerCase();
      const model = dev.deviceData?.deviceModel?.toLowerCase() || dev.userData?.deviceModel?.toLowerCase() || '';
      const user = dev.user?.toLowerCase() || dev.userId?.toLowerCase() || '';
      const token = dev.token?.toLowerCase() || '';

      const matchesSearch = model.includes(term) || user.includes(term) || token.includes(term);
      const matchesFilter =
        statusFilter.value === 'all' ||
        (statusFilter.value === 'admin' && dev.user?.toLowerCase() === 'admin') ||
        (statusFilter.value === 'user' && dev.user?.toLowerCase() !== 'admin');

      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      if (sortBy.value === 'model') {
        const modelA = a.deviceData?.deviceModel || a.userData?.deviceModel || '';
        const modelB = b.deviceData?.deviceModel || b.userData?.deviceModel || '';
        return modelA.localeCompare(modelB);
      } else {
        return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
      }
    });
  }, [devices, searchTerm, statusFilter, sortBy]);

  const deviceTableHead = [
    { label: '#', value: 'sno', width: 12 * 4, class: 'rounded-l-md', onClick: () => {} },
    { label: 'Role / User', value: 'user', width: 35 * 4, onClick: () => {} },
    { label: 'User Id', value: 'id', width: 50 * 4, onClick: () => {} },
    { label: 'Device Model', value: 'model', width: 50 * 4, onClick: () => {} },
    { label: 'FCM Token', value: 'fcm', width: 50 * 4, onClick: () => {} },
    { label: 'Android OS', value: 'os', width: 30 * 4, onClick: () => {} },
    { label: 'Push Token Status', value: 'token', width: 4 * 25, onClick: () => {} },
    { label: 'Last Active', value: 'updatedAt', width: 4 * 28, class: 'rounded-r-md', onClick: () => {} }
  ];

  function deviceTableData(dev) {
    const modelName = dev.deviceData?.deviceModel || dev.userData?.deviceModel || 'Unknown Device';
    const osVersion = dev.deviceData?.androidVersion || dev.userData?.androidVersion || 'N/A';
    const role = dev.user || dev.userId || 'Guest';

    return [
      { value: dev.sno || '' },
      { value: role },
      { value: dev.userId },
      { value: modelName },
      { value: dev?.token },
      { value: `Android ${osVersion}` },
      { value: <Badge type={dev.token ? 'dark' : 'light'} title={dev.token ? 'Active Token' : 'No Token'} /> },
      { value: new Date(dev.updatedAt || dev.createdAt).toLocaleDateString() }
    ];
  }

  const handleSendNotification = (e) => {
    e.preventDefault();
    if (!notificationTitle || !notificationBody) return;

    if (selectedDevice?.user === "customer") {
      const targetUserId =  selectedDevice.userId 
      if (targetUserId) {
        dispatch(sendToUser({ userId: targetUserId, title: notificationTitle, body: notificationBody }));
      } else {
        addToast('Selected device does not have an associated user ID.', 'error');
      }
    }
    if (selectedDevice?.user === "admin") {
      const targetUserId =  selectedDevice.userId 
      if (targetUserId) {
        dispatch(sendToAdmin({  title: notificationTitle, body: notificationBody }));
      } else {
        addToast('Selected device does not have an associated user ID.', 'error');
      }
    } else if (isCreatingBroadcast) {
        // 'all' or 'customer' dispatch mechanism
        dispatch(sendBroadcastNotification({ title: notificationTitle, body: notificationBody, audience: broadcastAudience }));
      
    }

    setNotificationTitle('');
    setNotificationBody('');
  };

  const leftPaneContent = (
    <div className="p-6 w-full h-full flex flex-col bg-vercel-black text-vercel-primary">
      <div className="flex flex-row justify-between items-center mb-4">
          <Header
            placeholder="Search devices by model, user ID, or token..."
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={[statusFilter.label, sortBy.label]}
            setStatusFilter={[setStatusFilter, setSortBy]}
            statusOptions={[filterOptions, sortOptions]}
            extra= {!isCreatingBroadcast && (
            <Button 
              onClick={handleCreateBroadcastClick} 
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              } 
              label="Create Broadcast" 
            />
          )}/>
      </div>

      <GlobalTable
        title="Registered Android Devices"
        tableHead={deviceTableHead}
        filteredList={filteredAndSortedDevices.map((d, idx) => ({ ...d, sno: idx + 1 }))}
        status={loading ? 'loading' : 'succeeded'}
        selectedItem={selectedDevice}
        setSelectedItem={(item) => {
          setSelectedDevice(item);
          if (item) setIsCreatingBroadcast(false);
        }}
        tableData={deviceTableData}
      />
    </div>
  );

  // Right pane opens when a device is selected OR isCreatingBroadcast is true
  const rightPaneContent = (selectedDevice || isCreatingBroadcast) ? (
    <div className="p-6 h-full flex flex-col bg-vercel-black text-vercel-primary overflow-y-auto border-l border-zinc-800">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-800 mb-6">
        <div>
          <h2 className="txt-sm font-medium text-vercel-primary">
            {selectedDevice ? 'Device Inspector' : 'Create Broadcast'}
          </h2>
          <p className="txt-xs text-zinc-400">
            {selectedDevice ? `ID: ${selectedDevice._id}` : 'Target specific user groups or broadcast globally'}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedDevice && (
            <Button
              type="danger"
              onClick={() => setIsDeleteModalOpen(true)}
              label="Revoke"
            />
          )}
          <Button
            type="button"
            onClick={handleClose}
            label="Close"
          />
        </div>
      </div>

      {selectedDevice && (
        <div className="space-y-2 mb-6 txt-sm bg-vercel-surface p-3 rounded-md border-1 border-zinc-800">
          <div><strong className="text-zinc-400">User / Role:</strong> <span className="text-vercel-primary">{selectedDevice.user || selectedDevice.userId || 'Unassigned'}</span></div>
          <div><strong className="text-zinc-400">Device Model:</strong> <span className="text-vercel-primary">{selectedDevice.deviceData?.deviceModel || selectedDevice.userData?.deviceModel || 'Unknown'}</span></div>
          <div><strong className="text-zinc-400">Android Version:</strong> <span className="text-vercel-primary">{selectedDevice.deviceData?.androidVersion || selectedDevice.userData?.androidVersion || 'N/A'}</span></div>
          <div><strong className="text-zinc-400">FCM Token:</strong> <code className="bg-zinc-900 border-1 border-zinc-800 px-1 py-0.5 rounded txt-xs text-zinc-300 break-all">{selectedDevice.token}</code></div>
        </div>
      )}

      {/* Broadcast Creation Form or Targeted Notification Form */}
      <div className={selectedDevice ? "mt-0" : ""}>
        <h3 className="txt-xs font-semibold text-zinc-300 mb-3">
          {selectedDevice ? 'Send Targeted Push Notification' : 'Broadcast Configuration'}
        </h3>
        
        <form onSubmit={handleSendNotification} className="space-y-3 bg-vercel-surface p-3 rounded-md border-1 border-zinc-800">
          {/* Audience selection option if creating broadcast */}
          {isCreatingBroadcast && (
            <div>
              <label >Target Audience</label>
              <select
                value={broadcastAudience}
                onChange={(e) => setBroadcastAudience(e.target.value)}
                
              >
                <option value="all">All Registered Devices</option>
                <option value="admin">Admin Group Only</option>
                <option value="customer">Customers Only</option>
              </select>
            </div>
          )}

          <div>
            <label >Notification Title</label>
            <input
              type="text"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              placeholder="e.g., Flash Sale Announcement"
              
              required
            />
          </div>
          <div>
            <label >Message Body</label>
            <textarea
              value={notificationBody}
              onChange={(e) => setNotificationBody(e.target.value)}
              placeholder="Enter broadcast message here..."
              
              required
            />
          </div>
          <Button
            disabled={actionLoading}
            loading={actionLoading}
            buttontype="submit"
            label={
              actionLoading
                ? 'Sending...'
                : selectedDevice
                ? `Send to ${selectedDevice.user || 'User'}`
                : `Dispatch Broadcast (${broadcastAudience.toUpperCase()})`
            }
          />
        </form>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={`Revoke Device Token?`}
        description="This action cannot be undone. This will permanently remove the registered Android push token record from your database ledger."
        confirmText="Yes, Revoke"
        cancelText="Cancel"
        isDestructive={true}
        loading={actionLoading}
        onConfirm={handleConfirmDelete}
      />
    </div>
  ) : null;

  return (
    <ResizablePanes
      animationKey={selectedDevice?._id || (isCreatingBroadcast ? 'create-broadcast' : 'empty-pane')}
      leftPane={leftPaneContent}
      rightPane={rightPaneContent}
      defaultLeftWidth={"58%"}
    />
  );
};

export default AndroidManagementPage;