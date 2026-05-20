import React, { useRef } from 'react';
import logourl from '../assets/icon.png';

const RefundVoucherTemplate = ({ refundData }) => {
  const printRef = useRef();

  if (!refundData) return null;

  // Compute total post-discount cash values from the returned array entries
  const absoluteGrandRefund = (refundData.items || []).reduce((sum, item) => sum + (item.subTotal || 0), 0);

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto my-4 p-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl text-zinc-100">
      
      {/* Action Header bar */}
      <div className="flex justify-between items-center mb-3 border-b border-zinc-800 pb-2 px-2">
        <span className="text-xs text-red-400 font-bold tracking-wider uppercase font-mono">⚠️ Reverse POS Voucher Engine</span>
        <button 
          onClick={handlePrint} 
          className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-md font-semibold text-xs transition-all shadow-md"
        >
          🖨️ Print Refund Voucher
        </button>
      </div>

      {/* --- PRINT CONTAINER START --- */}
      <div ref={printRef} className="bg-white text-zinc-900 p-5 rounded-md font-sans tracking-tight text-[11px]">
        <style dangerouslySetInnerHTML={{__html: `
          @media print { 
            @page { size: A5 landscape; margin: 4mm; } 
            body { color: #000000 !important; background: #ffffff !important; padding: 0; margin: 0; } 
            .print\\:bg-red-50 { background-color: #fef2f2 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        `}} />

        {/* Corporate Header Identity */}
        <div className="flex justify-between items-start border-b border-red-300 pb-2.5">
          <div className="flex items-center gap-3">
            <img src={logourl} alt="Logo" className="w-10 h-10 object-contain mix-blend-multiply" />
            <div>
              <h1 className="text-sm font-black text-zinc-950 tracking-tighter leading-none">ELECTROLYTE SOLUTIONS</h1>
              <p className="text-[9px] text-zinc-500 mt-1 leading-tight">
                Nahar Bala Ganj, Balrampur, UP, 271201<br />
                <span className="font-semibold font-mono text-zinc-700 text-[8px]">Contact No.: 9648146167, 8081111867</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-[10px] font-black text-white bg-red-600 px-2 py-0.5 rounded inline-block uppercase tracking-wider">Return Receipt</h2>
            <div className="text-[9px] text-zinc-600 font-mono mt-1.5">Processed: {new Date(refundData.createdAt || Date.now()).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Complete un-truncated Full Token Reference IDs for auditing trail tracking accuracy */}
        <div className="bg-red-50/50 border-b border-red-100 px-2 py-1 space-y-0.5 text-[9px] font-mono text-zinc-800">
          <div className="flex justify-between">
            <span className="text-zinc-400 font-sans font-bold uppercase text-[8px]">Return Bill Reference ID:</span>
            <span className="font-bold text-zinc-950 select-all">{refundData._id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400 font-sans font-bold uppercase text-[8px]">Original Invoice Linked ID:</span>
            <span className="font-bold text-zinc-700 select-all">{refundData.originalInvoiceId}</span>
          </div>
        </div>

        {/* Customer Profile Manifest block card metadata row */}
        <div className="my-2.5 p-2 bg-red-50/20 border border-red-100/40 rounded text-[10px] flex justify-between items-center">
          <div>
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Refund Target Customer:</span>
            <div className="font-bold text-zinc-900 text-xs">{refundData.customer?.name || 'Walk-in Client'}</div>
            <div className="text-zinc-600 font-mono text-[9px] mt-0.5">Ph: {refundData.customer?.phone || 'N/A'}</div>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-red-700 bg-red-50 font-bold px-2 py-0.5 rounded uppercase border border-red-100 tracking-wide font-sans">
              Purpose: return
            </span>
          </div>
        </div>

        {/* Returned Items Matrix Table row display lists layout block */}
        <table className="w-full text-left border-collapse my-3 text-[10px]">
          <thead>
            <tr className="bg-red-50 text-red-800 font-bold border-b border-red-200 print:bg-red-50">
              <th className="px-2 py-1.5 w-6">#</th>
              <th className="px-2 py-1.5">Returned Item / Component Manifest</th>
              <th className="px-2 py-1.5 text-right w-20">Price Rate</th>
              <th className="px-2 py-1.5 text-center w-16">Qty Returned</th>
              <th className="px-2 py-1.5 text-right w-24">Refund Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-800">
            {(refundData.items || []).map((item, idx) => (
              <tr key={item.productId || idx} className="bg-red-50/5">
                <td className="px-2 py-2 font-mono text-zinc-400">{idx + 1}</td>
                <td className="px-2 py-2 font-bold text-red-950">{item.name}</td>
                <td className="px-2 py-2 text-right font-mono">Rs.{Number(item.price || 0).toFixed(2)}</td>
                <td className="px-2 py-2 text-center font-bold text-red-600 font-mono">+{item.orderedQuantity}</td>
                <td className="px-2 py-2 text-right font-bold text-zinc-950 font-mono">Rs.{Number(item.subTotal || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Calculation Summary & Signoff Area */}
        <div className="flex justify-between items-end mt-4 pt-2.5 border-t border-zinc-200">
          <div className="w-1/2 text-[8px] text-zinc-400 italic leading-tight">
            * This document verifies an absolute reverse return entry flow. Listed items have been successfully checked back into stock databases. Cash value has been distributed to customer profile.
          </div>
          <div className="w-1/2 space-y-1 text-zinc-600 text-right">
            <div className="flex justify-between pl-12 text-[10px]">
              <span>Taxable Refund Base:</span>
              <span className="text-zinc-900 font-mono">Rs.{absoluteGrandRefund.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center bg-red-600 text-white px-3 py-1.5 rounded text-[11px] font-bold mt-1.5 shadow-sm">
              <span>Total Cash Refunded:</span>
              <span className="font-black font-mono text-xs">Rs.{absoluteGrandRefund.toFixed(2)}</span>
            </div>

            {/* Signature Block space boundary layout line components */}
            <div className="pt-4 flex flex-col items-end">
              <div className="w-24 h-0.5 bg-zinc-300 mb-0.5"></div>
              <div className="text-[7px] uppercase font-bold text-zinc-400 tracking-wider">Store Disbursment Stamp</div>
            </div>
          </div>
        </div>

      </div>
      {/* --- PRINT CONTAINER END --- */}

    </div>
  );
};

export default RefundVoucherTemplate;