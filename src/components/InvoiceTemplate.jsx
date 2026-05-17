import React, { useRef } from 'react';
import logourl from '../assets/icon.png';

const InvoiceTemplate = ({ billData }) => {
  const printRef = useRef();

  // Fallback data configuration matching structural database arrays
  const invoice = billData || {
    _id: "6a0617fe2fca22443dd500d8",
    purpose: "repair",
    lastUpdated: new Date().toLocaleString(),
    createdAt: new Date().toISOString(),
    serviceCharge: 250,
    totalAmount: 1740,
    customer: {
      name: "Akash Srivastav",
      phone: "8081111867",
      address: "Nahar Bala Ganj, Lucknow, UP - 226003",
      customerType: "Individual"
    },
    device: {
      deviceName: "iPhone 13",
      deviceHardwareId: "HWID-99211-A"
    },
    items: [
      { _id: "1", name: "Premium Display Panel", brand: "OLED", modelName: "i13-Replacement", price: 1200, orderedQuantity: 1, subTotal: 1200 },
      { _id: "2", name: "Waterproof Adhesive Strip", brand: "3M", modelName: "WP-02", price: 290, orderedQuantity: 1, subTotal: 290 }
    ]
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reinitializes state securely post-print execution
  };

  const baseAmount = invoice.items.reduce((sum, item) => sum + item.subTotal, 0) + (invoice.serviceCharge || 0);
  const grossTotal = baseAmount

  return (
    <div className="max-w-2xl mx-auto my-4 p-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl text-zinc-100">
      
      {/* Control Actions bar */}
      <div className="flex justify-between items-center mb-3 border-b border-zinc-800 pb-2 px-2">
        <span className="text-xs text-zinc-400 font-medium">Invoice</span>
        <button 
          onClick={handlePrint}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-md font-semibold text-xs transition-all"
        >
          🖨️ Print Invoice
        </button>
      </div>

      {/* --- PRINTABLE BOUNDARY WRAPPER START --- */}
      <div ref={printRef} className="bg-white text-zinc-900 p-5 rounded-md shadow-inner font-sans tracking-tight text-[11px]">
        
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            @page { size: A5 landscape; margin: 4mm; }
            body { color: #000000 !important; background: #ffffff !important; padding: 0; margin: 0; }
            .print\\:bg-zinc-100 { background-color: #f4f4f5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
          }
        `}} />

        {/* Branded Identity Header Block */}
        <div className="flex justify-between items-center border-b border-zinc-300 pb-3">
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
              <div>Invoice: #{invoice._id.slice(-6).toUpperCase()}</div>
              <div>Date: {invoice.lastUpdated.split(',')[0]}</div>
              <div className="font-sans font-bold text-zinc-950 uppercase text-[8px] tracking-wide">Purpose: {invoice.purpose}</div>
            </div>
          </div>
        </div>

        {/* Address Information Layout */}
        <div className="grid grid-cols-2 gap-4 my-3 pb-3 border-b border-zinc-100">
          <div>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Billed To:</span>
            <div className="font-bold text-zinc-900 text-xs">{invoice.customer.name}</div>
            <div className="text-zinc-600 text-[10px] leading-tight truncate" title={invoice.customer.address}>
              {invoice.customer.address}
            </div>
            <div className="text-zinc-700 font-mono font-medium text-[10px] mt-0.5">Ph: {invoice.customer.phone}</div>
          </div>
          
          <div className="text-right flex flex-col items-end justify-center">
            {invoice.purpose === 'repair' && invoice.device ? (
              <div className="bg-zinc-100 p-2 rounded text-left border border-zinc-200 w-full max-w-[220px]">
                <div className="font-bold text-zinc-800 text-[9px] uppercase tracking-wide">Asset Record</div>
                <div className="text-zinc-700 text-[10px] font-semibold truncate mt-0.5">{invoice.device.deviceName}</div>
                <div className="text-zinc-500 font-mono text-[9px] truncate">HWID: {invoice.device.deviceHardwareId}</div>
              </div>
            ) : (
              <span className="text-zinc-400 bg-zinc-50 px-2 py-1 border border-zinc-200/60 rounded italic text-[10px]">Product Purchase Manifest</span>
            )}
          </div>
        </div>

        {/* Line Items Matrix Table */}
        <table className="w-full text-left border-collapse my-3 text-[10px]">
          <thead>
            <tr className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-300">
              <th className="px-2 py-1.5 w-6">#</th>
              <th className="px-2 py-1.5">Item Description</th>
              <th className="px-2 py-1.5 text-right w-20">Rate</th>
              <th className="px-2 py-1.5 text-center w-12">Qty</th>
              <th className="px-2 py-1.5 text-right w-24">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-800">
            {invoice.items.map((item, idx) => (
              <tr key={item._id || idx}>
                <td className="px-2 py-2 font-mono text-zinc-400">{idx + 1}</td>
                <td className="px-2 py-2">
                  <span className="font-bold text-zinc-950">{item.brand ? `${item.brand} ` : ''}{item.modelName || item.name}</span>
                </td>
                <td className="px-2 py-2 text-right font-mono">Rs.{item.price.toFixed(2)}</td>
                <td className="px-2 py-2 text-center font-mono">{item.orderedQuantity}</td>
                <td className="px-2 py-2 text-right font-bold text-zinc-950 font-mono">Rs.{item.subTotal.toFixed(2)}</td>
              </tr>
            ))}

            {invoice.purpose === 'repair' && invoice.serviceCharge > 0 && (
              <tr className="bg-amber-50/40">
                <td className="px-2 py-2 font-mono text-zinc-400">*</td>
                <td className="px-2 py-2 font-medium text-zinc-900">Technical Labor / Service Fee</td>
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
            <span className="font-bold text-zinc-600 block mb-0.5">Declarations:</span>
            Computer generated system invoice. Immature transactional updates are subject to backend sync protocols.
          </div>

          <div className="w-1/2 space-y-1 font-medium text-zinc-600 text-right">
            
            
            <div className="flex justify-between items-center bg-zinc-900 text-white print:bg-zinc-100 print:text-zinc-950 px-3 py-1.5 rounded text-[11px] font-bold mt-2">
              <span>Grand Total:</span>
              <span className="font-black font-mono text-xs">Rs.{grossTotal.toFixed(2)}</span>
            </div>

            {/* Signature space */}
            <div className="pt-4 flex flex-col items-end">
              <div className="w-28 h-0.5 bg-zinc-300 mb-0.5"></div>
              <div className="text-[8px] uppercase font-bold text-zinc-400 tracking-wider">Authorized Signatory</div>
            </div>
          </div>
        </div>

      </div>
      {/* --- PRINTABLE BOUNDARY WRAPPER END --- */}

    </div>
  );
};

export default InvoiceTemplate;