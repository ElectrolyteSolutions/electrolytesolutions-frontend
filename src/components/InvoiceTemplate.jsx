import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import BillReceiptCore from './BillReceiptCore';

const InvoiceTemplate = ({ billData }) => {
  const printRef = useRef();
  const [isGstinMasked, setIsGstinMasked] = useState(true);

  const storeCustomers = useSelector((state) => state.customers.items);
  const storeDevices = useSelector((state) => state.devices.items);

  const invoice = billData || {
    _id: "6a0617fe2fca22443dd500d8",
    purpose: "purchase",
    lastUpdated: new Date().toLocaleString(),
    serviceCharge: 0,
    totalAmount: 0,
    items: []
  };

  const resolvedCustomer = typeof invoice.customer === 'object' && invoice.customer !== null
    ? invoice.customer
    : storeCustomers.find(c => c._id?.toString() === invoice.customer?.toString()) || {
        name: "Walk-in Client",
        phone: "N/A",
        address: "Counter Sale Transaction Log",
        customerType: "Individual",
        gst: "none",
        pan: "none"
      };

  let resolvedDevice = null;
  if (invoice.device) {
    if (typeof invoice.device === 'object' && invoice.device !== null) {
      resolvedDevice = invoice.device;
    } else {
      resolvedDevice = storeDevices.find(d => d._id?.toString() === invoice.device?.toString()) || null;
    }
  }

  if (invoice.purpose === 'repair' && resolvedCustomer?.devices && !resolvedDevice?.issues) {
    const targetId = typeof invoice.device === 'object' ? invoice.device?._id : invoice.device;
    const directMatch = resolvedCustomer.devices.find(d => d._id?.toString() === targetId?.toString());
    if (directMatch && typeof directMatch === 'object') {
      resolvedDevice = { ...resolvedDevice, ...directMatch };
    }
  }

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); 
  };

  const fullGstin = "09EYOPR0179F1ZV";
  const getMaskedGstin = (gstin) => {
    if (!gstin || gstin.length <= 5) return gstin;
    const visiblePart = gstin.slice(-5);
    const maskedPart = 'x'.repeat(gstin.length - 5);
    return maskedPart + visiblePart;
  };
  const displayedGstin = isGstinMasked ? getMaskedGstin(fullGstin) : fullGstin;

  return (
    <div className="max-w-4xl mx-auto my-4 p-3 sm:p-4 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl text-zinc-100 w-full">
      <div ref={printRef}>
        <BillReceiptCore 
          invoice={invoice}
          resolvedCustomer={resolvedCustomer}
          resolvedDevice={resolvedDevice}
          displayedGstin={displayedGstin}
          isGstinMasked={isGstinMasked}
          setIsGstinMasked={setIsGstinMasked}
          showControls={true}
          onPrint={handlePrint}
        />
      </div>
    </div>
  );
};

export default InvoiceTemplate;