import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from '../features/customerSlice';
import ResizablePanes from '../components/TwoPaneLayout';
import Header from '../components/SearchHeader';
import Button from '../components/Button';
import GlobalTable from '../components/GlobalTable';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';
import CustomerDetails from '../components/CustomerDetails';
import Badge from '../components/Badge';

const statusOptions = [
  { value: "all", label: "All Customers" },
  { value: "corporate", label: "Corporate Only" }
];

const CustomersPage = () => {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.customers);
  const { addToast } = useToast();

  const [selectedCustomer, setSelectedCustomer] = useState(undefined);
  const [editId, setEditId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Device Registration states

  const [form, setForm] = useState({
    name: '',
    firstName: '',
    lastName: '',
    phone: '',
    customerType: 'Individual',
    address: '',
    pan: '',
    gst: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [customerFilter, setCustomerFilter] = useState(statusOptions[0]);
  const [currentSortBy, setCurrentSortBy] = useState('newest'); // 'newest' | 'name' | 'type'
  const [currentSortOrder, setCurrentSortOrder] = useState('desc');

  useEffect(() => {
    dispatch(getCustomers());
  }, [dispatch]);

  const handleSortToggle = (targetField) => {
    if (currentSortBy === targetField) {
      setCurrentSortOrder(currentSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setCurrentSortBy(targetField);
      setCurrentSortOrder('asc');
    }
  };

  const handleSelectCustomer = (customer) => {
    setIsAddingNew(false);
    setSelectedCustomer(customer);
    setForm({
      name: customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      phone: customer.phone || '',
      customerType: customer.customerType || 'Individual',
      address: customer.address || (customer.addresses?.[0] ? `${customer.addresses[0].address1}, ${customer.addresses[0].city}` : ''),
      pan: customer.pan || '',
      email: customer.email || '',
      gst: customer.gst || ''
    });
    setEditId(customer._id);
  };

  const handleAddNewClick = () => {
    setIsAddingNew(true);
    setSelectedCustomer(null);
    setForm({
      name: '',
      firstName: '',
      lastName: '',
      phone: '',
      customerType: 'Individual',
      address: '',
      email:'',
      pan: '',
      gst: ''
    });
    setEditId(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      name: form.name.trim(),
    };

    if (editId) {
      dispatch(updateCustomer({ id: editId, data: payload }))
        .unwrap()
        .then(() => {
          addToast("Customer updated successfully!", "success");
          refreshDataLogs();
          setSelectedItem(null)
        })
        .catch((err) => addToast(error || "Failed to update customer.", "error"));
    } else {
      dispatch(addCustomer(payload))
        .unwrap()
        .then(() => {
          addToast("Customer registered successfully!", "success");
          refreshDataLogs();
          setIsAddingNew(false);
          setForm({
          name: '',
          firstName: '',
          lastName: '',
          phone: '',
          email:'',
          customerType: 'Individual',
          address: '',
          pan: '',
          gst: ''
        })
        })
        .catch((err) => addToast(error || "Failed to register customer.", "error"));
    }
  };

  const promptDeleteCustomer = (customer) => {
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteCustomer(customerToDelete._id)).unwrap();
      addToast(`Deleted "${customerToDelete.name || 'Customer'}" successfully.`, "success");
      setIsDeleteModalOpen(false);
      setCustomerToDelete(null);
      if (editId === customerToDelete._id) {
        setSelectedCustomer(undefined);
        setEditId(null);
      }
      refreshDataLogs();
    } catch (err) {
      addToast(error || "Failed to delete customer record.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const refreshDataLogs = () => {
    dispatch(getCustomers());
  };

  // Filter and Sort Logic
  const filteredAndSortedCustomers = useMemo(() => {
    if (!items) return [];

    const filtered = items.filter((c) => {
      const term = searchTerm.toLowerCase();
      const name = (c.name || `${c.firstName || ''} ${c.lastName || ''}`).toLowerCase();
      const phone = c.phone?.toLowerCase() || '';
      const address = c.address?.toLowerCase() || '';
      const gst = c.gst?.toLowerCase() || '';
      const pan = c.pan?.toLowerCase() || '';

      const matchesSearch = name.includes(term) || phone.includes(term) || address.includes(term) || gst.includes(term) || pan.includes(term);
      const matchesFilter = customerFilter.value === 'all' || (customerFilter.value === 'corporate' && c.customerType === 'Corporate');

      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      if (currentSortBy === 'name') {
        const nameA = a.name || `${a.firstName || ''} ${a.lastName || ''}`;
        const nameB = b.name || `${b.firstName || ''} ${b.lastName || ''}`;
        return currentSortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      } else if (currentSortBy === 'type') {
        const typeA = a.customerType || '';
        const typeB = b.customerType || '';
        return currentSortOrder === 'asc' ? typeA.localeCompare(typeB) : typeB.localeCompare(typeA);
      } else {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return currentSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });
  }, [items, searchTerm, customerFilter, currentSortBy, currentSortOrder]);

  const customerTableHead = [
    { label: '#', value: 'sno', class: "text-xs px-3 py-2 w-4 max-w-4 min-w-4", onClick: () => {} },
    { label: 'Customer Name', value: 'name', class: "text-xs px-3 py-2 w-38 min-w-38 max-w-38 cursor-pointer", onClick: () => handleSortToggle('name') },
    { label: 'Phone', value: 'phone', class: "text-xs px-3 py-2 w-26 min-w-26 max-w-26", onClick: () => {} },
    { label: 'Email', value: 'phone', class: "text-xs px-3 py-2 w-32 min-w-32 max-w-32", onClick: () => {} },
    { label: 'Type', value: 'type', class: "text-xs px-3 py-2 w-22 min-w-22 max-w-22", onClick: () => {handleSortToggle('type')} },
    { label: 'Address', value: 'devices', class: "text-xs px-3 py-2 w-42 min-w-42 max-w-42", onClick: () => {} },
    { label: 'Devices ', value: 'devices', class: "text-xs px-3 py-2 w-16 min-w-16 max-w-16", onClick: () => {} },
    { label: 'Orders ', value: 'devices', class: "text-xs px-3 py-2 w-16 min-w-16 max-w-16", onClick: () => {} },
    { label: 'GST', value: 'gst', class: "text-xs px-3 py-2 w-16 min-w-16 max-w-16 cursor-pointer", onClick: () => {} },
    { label: 'PAN', value: 'pan', class: "text-xs px-3 py-2 w-28 min-w-28 max-w-28", onClick: () => {} },
  ];

  function customerTableData(c) {
    const displayName = c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unnamed Customer';
    const displayAddress = c.address || (c.addresses?.[0] ? `${c.addresses[0].address1}, ${c.addresses[0].city}` : 'No address');

    return [
      { label: '#', value: c.sno || '', class: "text-xs pl-3 pr-0 py-2 rounded-l-md w-4 max-w-4 min-w-4" },
      { label: 'Customer Name', value: displayName, class: "text-xs px-3 py-2 w-38 min-w-38 max-w-38"
      },
      { label: 'Phone', value: c.phone || "-", class: "text-xs px-3 py-2 w-26 min-w-26 max-w-26" },
      { label: 'Email', value: c.email || "-", class: "text-xs px-3 py-2 w-32 min-w-32 max-w-32" },
      { label: 'Type', value: <Badge type={c?.customerType === 'Corporate' ? 'light' : 'dark'} title={c?.customerType || 'Individual'}></Badge>,
        class: "text-xs px-3 py-2 w-22 min-w-22 max-w-22"
      },
      { label: 'Address', value: displayAddress ,class: "text-xs px-3 py-2 w-42 min-w-42 max-w-42" },
      { label: 'Devices', value: c.devices?.length || 0 ,class: "text-xs px-3 py-2 w-16 min-w-16 max-w-16" },
      { label: 'Orders', value: c.orders?.length || 0 ,class: "text-xs px-3 py-2 w-16 min-w-16 max-w-16" },
      { label: 'GST', value: c.gst || "-" ,class: "text-xs px-3 py-2 w-28 min-w-28 max-w-28" },
      { label: 'PAN', value: c?.pan || "-" ,class: "text-xs px-3 py-2 w-20 min-w-20 max-w-20" }
    ];
  }

  const leftPaneContent = (
    <div className="p-6 w-full h-full flex flex-col pr-1">
      <div className='flex flex-row gap-3 h-fit items-center'>
        <Header 
          placeholder="Search by name, phone, address, GST, or PAN..."
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
          statusFilter={[customerFilter.label]}
          setStatusFilter={[setCustomerFilter]}
          statusOptions={[statusOptions]}
        />
        {!isAddingNew && (
          <Button 
            onClick={handleAddNewClick} 
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            } 
            label="Register Customer" 
          />
        )}
      </div>

      <GlobalTable
        title="Customer Directory"
        tableHead={customerTableHead}
        filteredList={filteredAndSortedCustomers.map((c, idx) => ({ ...c, sno: idx + 1 }))}
        status={status}
        selectedItem={selectedCustomer}
        setSelectedItem={handleSelectCustomer}
        tableData={customerTableData}
      />
    </div>
  );

  return (
    <>
      <ResizablePanes
        animationKey={editId || (isAddingNew ? 'new-customer' : 'empty')}
        leftPane={leftPaneContent}
        rightPane={
          (selectedCustomer !== undefined || isAddingNew) ? (
            <CustomerDetails
              customer={selectedCustomer}
              form={form}
              setForm={setForm}
              editId={editId}
              handleSave={handleSave}
              promptDeleteCustomer={() => promptDeleteCustomer(selectedCustomer)}
            />
          ) : null
        }
        defaultLeftWidth="68%"
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={`Delete "${customerToDelete?.name || 'Customer'}"?`}
        description="This action cannot be undone. This will permanently remove the customer record from your active system database."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDestructive={true}
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default CustomersPage;