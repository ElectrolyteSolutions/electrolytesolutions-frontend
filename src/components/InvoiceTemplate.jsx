import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import BillReceiptCore from './BillReceiptCore';

const InvoiceTemplate = ({ billData, onClose }) => {
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
    window.print();
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Strict 1-Page Single-Target Print Engine CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm;
          }
          body, html {
            background: #ffffff !important;
            color: #000000 !important;
            height: 100% !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Hide everything in body */
          body * {
            visibility: hidden !important;
          }
          /* Reveal target element and its children exclusively */
          #printable-invoice-receipt, 
          #printable-invoice-receipt * {
            visibility: visible !important;
          }
          /* Pin exactly to page 1 top-left with zero overflow duplication */
          #printable-invoice-receipt {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            max-height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
            overflow: hidden !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <div className="bg-zinc-900 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-zinc-800">
        
        {/* Modal Header Bar with Controls */}
        <div className="px-4 sm:px-6 py-3 border-b border-zinc-800 flex flex-wrap justify-between items-center gap-3 bg-zinc-900 shrink-0">
          <div className="min-w-0 pr-2">
            <h3 className="text-base sm:text-lg font-bold text-white truncate">Print Invoice</h3>
            <p className="text-[10px] sm:text-xs text-zinc-500 font-mono uppercase mt-0.5 truncate">Invoice ID: {billData?.billNumber || billData?._id}</p>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button 
              onClick={() => setIsGstinMasked(!isGstinMasked)}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md font-medium text-xs transition-all shadow border border-zinc-700 cursor-pointer no-print"
              title="Toggle GSTIN Masking"
            >
              {isGstinMasked ? '👁️ Unmask GSTIN' : '🔒 Mask GSTIN'}
            </button>

            <button 
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-md font-semibold text-xs transition-all shadow cursor-pointer no-print"
            >
              🖨️ Print Invoice Sheet
            </button>

            {onClose && (
              <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors text-2xl shrink-0 leading-none cursor-pointer ml-2 no-print">&times;</button>
            )}
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="overflow-y-auto flex-1 text-zinc-900 scrollbar-thin bg-zinc-950 p-4">
          <div className="w-full overflow-x-hidden flex justify-center">
            <div ref={printRef} id="printable-invoice-receipt" className="w-full  overflow-hidden bg-white rounded-lg shadow-inner p-2">
              <BillReceiptCore 
                invoice={invoice}
                resolvedCustomer={resolvedCustomer}
                resolvedDevice={resolvedDevice}
                displayedGstin={displayedGstin}
                isGstinMasked={isGstinMasked}
                setIsGstinMasked={setIsGstinMasked}
                showControls={false}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InvoiceTemplate;