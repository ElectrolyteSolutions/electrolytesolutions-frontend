import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import logourl from '../assets/icon.png';

const InvoiceTemplate = ({ billData }) => {
  const printRef = useRef();

  // Pull complete system records collections for hot data validation and linking
  const storeCustomers = useSelector((state) => state.customers.items);
  const storeDevices = useSelector((state) => state.devices.items);

  
  
  // Fallback structural mock data configuration matching structural database schemas perfectly
  const invoice = billData ;

  // --- DYNAMIC LINKING DEEP-RESOLVER LOGIC ---
  
  // Resolve Billed Customer details (handles populated object or plain string reference ID)
  const resolvedCustomer = typeof invoice.customer === 'object' && invoice.customer !== null
    ? invoice.customer
    : storeCustomers.find(c => c._id === invoice.customer) || {
        name: "Walk-in Client",
        phone: "N/A",
        address: "Counter Sale Transaction Log",
        customerType: "Individual"
      };

  // Resolve Linked Hardware Target details (handles populated object or plain string reference ID)
  let resolvedDevice = null;
  if (invoice.device) {
    if (typeof invoice.device === 'object' && invoice.device !== null) {
      resolvedDevice = invoice.device;
    } else {
      resolvedDevice = storeDevices.find(d => d._id === invoice.device) || null;
    }
  }

  // Cross-reference customer fields if device payload structure dropped active issue arrays
  if (invoice.purpose === 'repair' && resolvedCustomer?.devices && !resolvedDevice?.issues) {
    const targetId = typeof invoice.device === 'object' ? invoice.device?._id : invoice.device;
    const directMatch = resolvedCustomer.devices.find(d => d._id === targetId);
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

  const baseAmount = (invoice.items || []).reduce((sum, item) => sum + item.subTotal, 0) + (invoice.serviceCharge || 0);
  const grossTotal = baseAmount;

  return (
    <div className="max-w-2xl mx-auto my-4 p-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl text-zinc-100">
      
      {/* Control Actions bar */}
      <div className="flex justify-between items-center mb-3 border-b border-zinc-800 pb-2 px-2">
        <span className="text-xs text-zinc-400 font-medium">Invoice Printing Engine Preview</span>
        <button 
          onClick={handlePrint}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-md font-semibold text-xs transition-all shadow"
        >
          🖨️ Print Invoice Sheet
        </button>
      </div>

      {/* --- PRINTABLE BOUNDARY WRAPPER START --- */}
      <div ref={printRef} className="bg-white text-zinc-900 p-5 rounded-md shadow-inner font-sans tracking-tight text-[11px]">
        
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            @page { size: A4 portrait; margin: 4mm; }
            body { color: #000000 !important; background: #ffffff !important; padding: 0; margin: 0; }
            .print\\:bg-zinc-100 { background-color: #f4f4f5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
          }
        `}} />

        {/* Branded Identity Header Block */}
        <div className="flex justify-between items-start border-b border-zinc-300 pb-3">
          <div className="flex items-center gap-3">
            {/* Embedded Company Logo Container */}
            <div className="w-12 h-12 rounded bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center p-0.5 shrink-0">
              <img 
                src={logourl} 
                alt="Company Identity Logo" 
                className="w-full h-full object-contain mix-blend-multiply" 
              />
            </div>
            <div>
              <h1 className="text-base font-black text-zinc-950 tracking-tighter leading-none">ELECTROLYTE SOLUTIONS</h1>
              <p className="text-[10px] text-zinc-500 leading-tight mt-1">
                Nahar Bala Ganj, Balrampur, UP, 271201<br />
                <span className="font-semibold font-mono text-zinc-700 text-[9px]">Contact No.: 9648146167, 8081111867</span><br/>
                <span className="font-semibold font-mono text-zinc-700 text-[9px]">Email: contact.electolytesolutions@gmail.com</span>
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-xs font-black text-zinc-950 uppercase tracking-wider bg-zinc-100 px-2 py-0.5 rounded inline-block">Tax Invoice</h2>
            <div className="text-[10px] text-zinc-600 space-y-0.5 mt-1.5 font-mono">
              <div className="text-[9px] text-zinc-900 bg-zinc-100 font-bold px-1.5 py-0.5 rounded uppercase tracking-wide inline-block mb-1">Purpose: {invoice.purpose}</div>
              <div>Date: {invoice.lastUpdated ? invoice.lastUpdated.split(',')[0] : 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Un-truncated Full 24-char MongoDB ID row for reverse POS lookups and returns handling */}
        <div className="bg-zinc-100 border-b border-zinc-200 px-2 py-1 flex justify-between items-center text-[9px] font-mono text-zinc-800">
          <span className="font-sans font-bold uppercase tracking-wider text-zinc-500">System Bill Reference Token:</span>
          <span className="font-bold select-all tracking-wide text-zinc-950">{invoice._id}</span>
        </div>

        {/* Address & Detailed Customer/Device Breakdown Grid */}
        <div className="grid grid-cols-2 gap-4 my-3 pb-3 border-b border-zinc-100">
          <div>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Billed To:</span>
            <div className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
              {resolvedCustomer.name}
              <span className="text-[8px] bg-zinc-100 text-zinc-600 border px-1 rounded font-normal uppercase tracking-tight">
                {resolvedCustomer.customerType || 'Individual'}
              </span>
            </div>
            <div className="text-zinc-600 text-[10px] leading-tight mt-0.5" title={resolvedCustomer.address}>
              {resolvedCustomer.address}
            </div>
            <div className="text-zinc-700 font-mono font-medium text-[10px] mt-0.5">Ph: {resolvedCustomer.phone}</div>
          </div>
          
          <div className="text-right flex flex-col items-end justify-start">
            {invoice.purpose === 'repair' && resolvedDevice ? (
              <div className="bg-zinc-50 p-2 rounded text-left border border-zinc-200 w-full max-w-[260px] space-y-1">
                <div className="font-bold text-zinc-400 text-[8px] uppercase tracking-wide leading-none">Hardware Asset Profile</div>
                <div className="text-zinc-900 text-[11px] font-black leading-none">{resolvedDevice.deviceName}</div>
                <div className="text-zinc-600 font-mono text-[9px]">HWID: {resolvedDevice.deviceHardwareId}</div>
                
                {/* Dynamic Repair Diagnostics Issue List Badging mapping section */}
                {resolvedDevice.issues && resolvedDevice.issues.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-1 border-t border-zinc-200/60 mt-1">
                    {resolvedDevice.issues.map((issue, idx) => (
                      <span key={idx} className="bg-red-50 text-red-700 border border-red-100 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tight">
                        ⚠️ {issue}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-zinc-500 bg-zinc-50 px-2 py-1.5 border border-zinc-200/60 rounded italic font-medium text-[10px]">
                📦 Standard Product Sale Manifest
              </span>
            )}
          </div>
        </div>

        {/* Line Items Matrix Table */}
        <table className="w-full text-left border-collapse my-3 text-[10px]">
          <thead>
            <tr className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-300">
              <th className="px-2 py-1.5 w-6">#</th>
              <th className="px-2 py-1.5">Item Description / Variant Details</th>
              <th className="px-2 py-1.5 text-right w-20">Rate</th>
              <th className="px-2 py-1.5 text-center w-12">Qty</th>
              <th className="px-2 py-1.5 text-right w-24">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-800">
            {invoice.items?.map((item, idx) => (
              <tr key={item._id || idx}>
                <td className="px-2 py-2 font-mono text-zinc-400">{idx + 1}</td>
                <td className="px-2 py-2">
                  <div className="font-bold text-zinc-950">
                    {item.brand ? `[${item.brand.toUpperCase()}] ` : ''}{item.name}
                  </div>
                  {item.modelName && (
                    <div className="text-[9px] text-zinc-400 font-mono mt-0.5">Model ref: {item.modelName}</div>
                  )}
                </td>
                <td className="px-2 py-2 text-right font-mono">Rs.{item.price.toFixed(2)}</td>
                <td className="px-2 py-2 text-center font-mono">{item.orderedQuantity}</td>
                <td className="px-2 py-2 text-right font-bold text-zinc-950 font-mono">Rs.{item.subTotal.toFixed(2)}</td>
              </tr>
            ))}

            {invoice.purpose === 'repair' && invoice.serviceCharge > 0 && (
              <tr className="bg-amber-50/40 border-t border-dashed border-zinc-200">
                <td className="px-2 py-2 font-mono text-amber-600">*</td>
                <td className="px-2 py-2 font-medium text-zinc-900">
                  <div>Technical Service Labor / Diagnostic Fee</div>
                  <div className="text-[8px] text-zinc-400 italic">Non-refundable labor line charge</div>
                </td>
                <td className="px-2 py-2 text-right font-mono">Rs.{invoice.serviceCharge.toFixed(2)}</td>
                <td className="px-2 py-2 text-center font-mono">1</td>
                <td className="px-2 py-2 text-right font-bold text-zinc-950 font-mono">Rs.{invoice.serviceCharge.toFixed(2)}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Lower Summarization Sign-off Area */}
        <div className="flex justify-between items-end mt-4 pt-3 border-t border-zinc-200">
          <div className="w-1/2 text-[9px] text-zinc-400 pr-4 leading-normal">
            <span className="font-bold text-zinc-600 block mb-0.5">Terms & Conditions:</span>
            Computer generated system document. Valid for processing item-return requests over reverse POS counters when full Token reference ID is supplied.
          </div>

          <div className="w-1/2 space-y-1 font-medium text-zinc-600 text-right">
            <div className="flex justify-between items-center bg-zinc-950 text-white print:bg-zinc-100 print:text-zinc-950 px-3 py-1.5 rounded text-[11px] font-bold mt-2">
              <span>Grand Net Total:</span>
              <span className="font-black font-mono text-xs">Rs.{grossTotal.toFixed(2)}</span>
            </div>

            {/* Signature space */}
            <div className="pt-5 flex flex-col items-end">
              <div className="w-28 h-0.5 bg-zinc-300 mb-0.5"></div>
              <div className="text-[8px] uppercase font-bold text-zinc-400 tracking-wider">Authorized Signature</div>
            </div>
          </div>
        </div>

      </div>
      {/* --- PRINTABLE BOUNDARY WRAPPER END --- */}

    </div>
  );
};

export default InvoiceTemplate;