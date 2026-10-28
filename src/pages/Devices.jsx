import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; 
import { getDevices, addDevice, updateDevice, deleteDevice, getDeviceByType } from '../features/deviceSlice'; 
import { getCustomers } from '../features/customerSlice';
import ResizablePanes from '../components/TwoPaneLayout';
import Header from '../components/SearchHeader';
import Button from '../components/Button';
import GlobalTable from '../components/GlobalTable';
import Badge from '../components/Badge';
import DeviceDetails from '../components/Devicedetails';
import { useToast } from '../context/ToastContext'; // Imported Toast Context

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" }
];

const deviceTypeTabs = [
  { value: 'all', label: 'All Devices' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'printer', label: 'Printer' },
  { value: 'speaker', label: 'Speaker' },
  { value: 'other', label: 'Other' },
];

const DevicesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToast(); // Initialized Toast Hook
  const { items, groupedItems, error, status } = useSelector(state => state.devices);
  const customers = useSelector(state => state.customers.items);
  
  const [selectedDevice, setSelectedDevice] = useState(undefined); 
  const [editId, setEditId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Search, Status Filter, Type Tab, and Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(statusOptions[0]); 
  const [selectedDeviceTypeTab, setSelectedDeviceTypeTab] = useState(deviceTypeTabs[0]); 
  const [availableDeviceTypeList, setAvailableDeviceTypeList] = useState([]); 
  const [sortBy, setSortBy] = useState('newest'); 

  // Form state
  const [form, setForm] = useState({ 
    owner: '',
    deviceName: '',
    deviceType: 'mobile',
    customDeviceType: '',
    issues: [],
    deviceHardwareId: '',
    deviceRepairingStatus: 'in-progress'
  });

  useEffect(() => {
    dispatch(getDevices());
    dispatch(getDeviceByType());
    if (customers.length === 0) {
      dispatch(getCustomers());
    }
  }, [dispatch, customers.length]);

  useEffect(() => {
    if (groupedItems && Array.isArray(groupedItems)) {
      setAvailableDeviceTypeList(groupedItems.map((item) => ({
        value: item.type, 
        label: item.type
      })));
    }
  }, [groupedItems]);

  const handleDeleteRecord = (deviceId, e) => {
    if (e) e.stopPropagation();
    if (window.confirm("Are you sure you want to completely remove this device from repair tracking?")) {
      dispatch(deleteDevice(deviceId))
        .unwrap()
        .then(() => {
          dispatch(getDevices());
          dispatch(getDeviceByType());
          addToast("Device record deleted successfully.", "success");
          if (editId === deviceId) {
            setSelectedDevice(undefined);
            setEditId(null);
          }
        })
        .catch((err) => {
          const errMsg = err.message || err;
          addToast(`Failed to delete device: ${errMsg}`, "error");
        });
    }
  };

  const handleProceedToBilling = (device, e) => {
    e.stopPropagation();
    if (!device.owner) {
      addToast("Cannot bill an unassigned customer account asset.", "warning");
      return;
    }
    
    navigate('/billing', { 
      state: { 
        autoCustomerId: device.owner._id,
        autoPurpose: 'repair',
        autoDeviceId: device._id
      } 
    });
  };

  const handleSelectDevice = (device) => {
    setIsAddingNew(false);
    setSelectedDevice(device);
    setForm({
      owner: device.owner?._id || device.owner || '',
      deviceName: device.deviceName || '',
      deviceType: device.deviceType || 'mobile',
      customDeviceType: device.customDeviceType || '',
      issues: device.issues ? [...device.issues] : [],
      deviceHardwareId: device.deviceHardwareId || '',
      deviceRepairingStatus: device.deviceRepairingStatus || 'in-progress'
    });
    setEditId(device._id);
  };

  const handleAddNewClick = () => {
    setIsAddingNew(true);
    setSelectedDevice(null);
    setForm({ 
      owner: '',
      deviceName: '',
      deviceType: 'mobile',
      customDeviceType: '',
      issues: [],
      deviceHardwareId: '',
      deviceRepairingStatus: 'in-progress'
    });
    setEditId(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.owner) {
      addToast('Please assign a customer profile', "warning");
      return;
    }
    if (form.deviceType === 'other' && !form.customDeviceType.trim()) {
      addToast('Please specify a custom device type name.', "warning");
      return;
    }
    if (form.issues.length === 0) {
      addToast('Please describe at least one device fault or hardware issue.', "warning");
      return;
    }

    const payload = { 
      ...form, 
      deviceType: form.deviceType === 'other' ? form.customDeviceType.trim() : ''
    };

    if (editId) {
      dispatch(updateDevice({ id: editId, data: payload }))
        .unwrap()
        .then(() => {
          dispatch(getDevices());
          dispatch(getDeviceByType());
          addToast("Device repair record updated successfully!", "success");
        })
        .catch((err) => {
          const errMsg = err.message || err;
          addToast(`Failed to update device: ${errMsg}`, "error");
        });
    } else {
      dispatch(addDevice(payload))
        .unwrap()
        .then(() => {
          dispatch(getDevices());
          dispatch(getDeviceByType());
          addToast("Device registered successfully!", "success");
          setIsAddingNew(false);
        })
        .catch((err) => {
          const errMsg = err.message || err;
          addToast(`Failed to add device: ${errMsg}`, "error");
        });
    }
  };

  const filteredAndSortedDevices = useMemo(() => {
    if (!items) return [];

    const filtered = items.filter((device) => {
      if (selectedDeviceTypeTab?.value !== 'all' && device.deviceType !== selectedDeviceTypeTab?.value) {
        return false;
      }

      if (statusFilter?.value !== 'all' && device.deviceRepairingStatus !== statusFilter?.value) {
        return false;
      }

      const term = searchTerm.toLowerCase();
      const deviceName = device.deviceName?.toLowerCase() || '';
      const hwId = device.deviceHardwareId?.toLowerCase() || '';
      const customerName = device.owner?.name?.toLowerCase() || '';
      const deviceType = device.deviceType?.toLowerCase() || '';
      const customType = device.customDeviceType?.toLowerCase() || '';
      const issues = device.issues?.join(', ').toLowerCase() || '';

      return (
        deviceName.includes(term) || 
        hwId.includes(term) || 
        customerName.includes(term) || 
        deviceType.includes(term) ||
        customType.includes(term) ||
        issues.includes(term)
      );
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return (a.deviceName || '').localeCompare(b.deviceName || '');
      } else if (sortBy === 'status') {
        return (a.deviceRepairingStatus || '').localeCompare(b.deviceRepairingStatus || '');
      } else if (sortBy === 'type') {
        return (a.deviceType || '').localeCompare(b.deviceType || '');
      } else {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });
  }, [items, searchTerm, statusFilter, selectedDeviceTypeTab, sortBy]);

  const deviceTableHead = [
    { label: '#', value: 'sno', class: "text-xs px-3 py-2 w-2 max-w-2 min-w-2" },
    { label: 'Device Name', value: 'name', class: "text-xs px-3 py-2 w-24 max-w-24 min-w-24" },
    { label: 'Hardware ID', value: 'name', class: "text-xs px-3 py-2 w-12 max-w-12 min-w-12" },
    { label: 'Device Type', value: 'type', class: "text-xs px-3 py-2 w-8 max-w-8 min-w-8" },
    { label: 'Customer Name', value: 'customer', class: "text-xs px-3 py-2 w-20 max-w-20 min-w-20" },
    { label: 'Faults /Issues', value: 'issues', class: "text-xs px-3 py-2 w-12 max-w-12 min-w-12" },
    { label: 'Status', value: 'status', class: "text-xs px-3 py-2 w-4 max-w-4 min-w-4" },
  ];

  function deviceTableData(d) {
    return [
      { label: '#', value: d.sno || '', class: "text-xs px-3 py-2 w-2 max-w-2 min-w-2 rounded-l-md" },
      { label: 'DeviceHWID', value: d.deviceName, class: "text-xs px-3 py-2 w-24 max-w-24 min-w-24" },
      { label: 'HWID', value: d.deviceHardwareId, class: "text-xs px-3 py-2 w-12 max-w-12 min-w-12" },
      { label: 'Type', value: d?.deviceType || "-", class: "text-xs px-3 py-2 w-8 max-w-8 min-w-8 capitalize"},
      { label: 'Customer', value: d.owner?.name || "-", class: "text-xs px-3 py-2 w-20 max-w-20 min-w-20" },
      { 
        label: 'Faults /Issues', 
        value: d.issues && d.issues.length > 0 ? d.issues.slice(0, 2).join(", ") + (d.issues.length > 2 ? "..." : "") : <span>No faults</span>, 
        class: "text-[10px] px-3 py-2 w-12 max-w-12 min-w-12" 
      },
      { 
        label: 'Status', 
        value: <Badge title={d?.deviceRepairingStatus} type={d?.deviceRepairingStatus === ("resolved") ? "dark" : "light"}></Badge>,
        class: "text-xs px-3 py-2 w-4 max-w-4 min-w-4" 
      }
    ];
  }

  const leftPaneContent = (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-row gap-2 h-fit items-center">
        <Header 
          placeholder="Search by device name, hardware ID, customer..."
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          statusFilter={[statusFilter.label, selectedDeviceTypeTab?.label]} 
          setStatusFilter={[setStatusFilter, setSelectedDeviceTypeTab]}
          statusOptions={[statusOptions, deviceTypeTabs]}
        />
        {!isAddingNew && (
          <Button 
            onClick={handleAddNewClick}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            }
            label="Add Device" 
          />
        )}
      </div>

      <GlobalTable
        title="Service Device"
        tableHead={deviceTableHead}
        filteredList={filteredAndSortedDevices.map((d, idx) => ({ ...d, sno: idx + 1 }))}
        status={status}
        selectedItem={selectedDevice}
        setSelectedItem={handleSelectDevice}
        tableData={deviceTableData}
      />
    </div>
  );

  return (
    <div className='h-full w-full p-6'>
      <ResizablePanes
        animationKey={editId || (isAddingNew ? 'new-device' : 'empty')}
        leftPane={leftPaneContent}
        rightPane={
          (selectedDevice !== undefined || isAddingNew) ? (
            <DeviceDetails 
              selectedDevice={selectedDevice}
              form={form}
              setForm={setForm}
              editId={editId}
              handleSave={handleSave}
              handleAddNewClick={handleAddNewClick}
              handleDeleteRecord={handleDeleteRecord}
              availableCustomers={customers}
              availableTypes={availableDeviceTypeList}
            />
          ) : null
        }
        defaultLeftWidth="58%"
      />
    </div>
  );
};
export default DevicesPage