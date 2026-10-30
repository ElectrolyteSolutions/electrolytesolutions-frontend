import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBills, deleteBill } from '../features/billingSlice';
import ResizablePanes from '../components/TwoPaneLayout';
import Header from '../components/SearchHeader';
import GlobalTable from '../components/GlobalTable';
import InvoiceTemplate from '../components/InvoiceModal';
import { useToast } from '../context/ToastContext';
import BillDetail from '../components/BillDetail';
import Badge from '../components/Badge';
import InvoiceWrapper from '../components/InvoiceViewer';

const statusOptions = [
  { label: 'All Invoices', value: 'all' },
  { label: 'Repair', value: 'repair' },
  { label: 'Purchase', value: 'purchase' },
  { label: 'Quotation', value: 'quotation' }
];
const statusOptions2 = [
  { label: 'Latest', value: 'newest' },
  { label: 'Amount', value: 'amount' },
  { label: 'Intent', value: 'purpose' },
];

const Invoices = () => {
  const dispatch = useDispatch();
  const { items: bills, status } = useSelector(state => state.billings);
  const { addToast } = useToast();

  const [selectedBill, setSelectedBill] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(statusOptions[0]);
  const [billSortBy, setBillSortBy] = useState(statusOptions2[0]);

  function handleDeleteBill(){
         if(window.confirm('Revoke and delete this invoice?')) { 
            dispatch(deleteBill(selectedBill._id)); 
            setSelectedBill(undefined); 
            addToast("Invoice deleted successfully", "success"); 
        }
}
function handleClose(){
    setSelectedBill(undefined)
}

  useEffect(() => {
    dispatch(getBills());
  }, [dispatch]);

  const filteredAndSortedBills = useMemo(() => {
    if (!bills) return [];

    const filtered = bills.filter((bill) => {
      const term = searchTerm.toLowerCase();
      const id = bill.billNumber?.toLowerCase() || bill._id?.toLowerCase() || '';
      const customerName = bill.customer?.name?.toLowerCase() || '';
      const customerPhone = bill.customer?.phone?.toLowerCase() || '';
      const purpose = bill.purpose?.toLowerCase() || '';

      const matchesSearch = id.includes(term) || customerName.includes(term) || customerPhone.includes(term) || purpose.includes(term);
      const matchesFilter = statusFilter.value === 'all' || bill.purpose?.toLowerCase() === statusFilter.value.toLowerCase();

      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      if (billSortBy.value === 'amount') {
        return (Number(b.totalAmount) || 0) - (Number(a.totalAmount) || 0);
      } else if (billSortBy.value === 'purpose') {
        return (a.purpose || '').localeCompare(b.purpose || '');
      } else {
        return new Date(b.lastUpdated || b.createdAt || 0) - new Date(a.lastUpdated || a.createdAt || 0);
      }
    });
  }, [bills, searchTerm, statusFilter, billSortBy]);

  const billsTableHead = [
    { label: '#', value: 'sno',width:12*4, class: "rounded-l-md", onClick: () => {} },
    { label: 'Invoice ID', value: 'billNumber',width:29*4, onClick: () => {} },
    { label: 'Customer/Party Name ', value: 'customer',width:58 * 4, onClick: () => {} },
    { label: 'Phone', value: 'customer', width:35*4, onClick: () => {} },
    { label: 'Intent', value: 'purpose', width:4*22, class: "text-capitalize", onClick: () => {} },
    { label: 'Payment', value: 'isPaid', width:4*18, onClick: () => {} },
    { label: 'Bill Count', value: '', width:4*22, onClick: () => {} },
    { label: 'Service Charge', value: '', width:4*16, onClick: () => {} },
    { label: 'Total Amount', value: 'totalAmount', width:4*22, onClick: () => {} },
    { label: 'Profit', value: 'profit', width:4*22, class:"rounded-r-md", onClick: () => {} }
  ];

  function billsTableData(bill) {
    return [
      { value: bill.sno || ''},
      { value: bill?.billNumber || "-"},
      { value: bill.customer?.name || 'Walk-in',},
      { value: `+91-${bill.customer?.phone}` || bill.customer?.email},
      { value: bill.purpose },
      { value: <Badge type={bill.isPaid ?"dark":"light"} title={bill.isPaid ? 'Paid' : 'Unpaid'}></Badge>},
      { value: `${bill?.items?.length} items`},
      { value: `₹${bill?.serviceCharge}.00`},
      { value: `₹${bill?.totalAmount}.00` },
      {value: `₹${bill?.profit}.00` }
    ];
  }
  console.log(selectedBill)

  const leftPaneContent = (
    <div className="p-6 w-full h-full flex flex-col">
        <Header 
          placeholder="Search history by ID, customer name, phone, or purpose..."
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
          statusFilter={[statusFilter.label,billSortBy.label]}
          setStatusFilter={[setStatusFilter,setBillSortBy]}
          statusOptions={[statusOptions,statusOptions2]}
        />

      <GlobalTable
        title="Invoice "
        tableHead={billsTableHead}
        filteredList={filteredAndSortedBills.map((b, idx) => ({ ...b, sno: idx + 1 }))}
        status={status}
        selectedItem={selectedBill}
        setSelectedItem={setSelectedBill}
        tableData={billsTableData}
      />
    </div>
  );

  return <>
      <ResizablePanes
        animationKey={selectedBill?._id || 'empty-bill'}
        leftPane={leftPaneContent}
        rightPane={selectedBill !== undefined && selectedBill !== null ? (<InvoiceWrapper
            onClose={handleClose}
            handleDeleteBill={handleDeleteBill}
            billData={selectedBill}
        />) : null}
        defaultLeftWidth="58%"
      />
    </>
};

export default Invoices;