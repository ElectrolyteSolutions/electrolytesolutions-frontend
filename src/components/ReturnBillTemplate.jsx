import React, { useRef } from 'react';
import logourl from '../assets/icon.png';

const RefundVoucherTemplate = ({ refundData }) => {
  const printRef = useRef();

  if (!refundData) return null;

  const baseAmount = refundData.items.reduce((sum, item) => sum + item.subTotal, 0);
  const absoluteGrandRefund = baseAmount;

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
      <div className="flex justify-between items-center mb-3 border-b border-zinc-800 pb-2 px-2">
        <span className="text-xs text-red-400 font-medium font-mono">⚠️ Credit Note/Return Voucher Engine</span>
        <button onClick={handlePrint} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-md font-semibold text-xs transition-all">
          🖨️ Print Refund Voucher
        </button>
      </div>

      {/* --- PRINT CONTAINER START --- */}
      <div ref={printRef} className="bg-white text-zinc-900 p-5 rounded-md font-sans tracking-tight text-[11px]">
        <style dangerouslySetInnerHTML={{__html: `@media print { @page { size: A5 landscape; margin: 4mm; } body { color: #000000 !important; background: #ffffff !important; } }`}} />

        {/* Corporate Header Identity */}
        <div className="flex justify-between items-center border-b border-red-300 pb-3">
          <div className="flex items-center gap-3">
            <img src={logourl} alt="Logo" className="w-10 h-10 object-contain mix-blend-multiply" />
            <div>
              <h1 className="text-sm font-black text-zinc-950 tracking-tighter leading-none">ELECTROLYTE SOLUTIONS</h1>
              <p className="text-[9px] text-zinc-500 mt-0.5">Nahar Bala Ganj, Balrampur, UP, 271201</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xs font-black text-white bg-red-600 px-2 py-0.5 rounded inline-block uppercase tracking-wider">Credit Note</h2>
            <div className="text-[9px] text-zinc-600 font-mono mt-1">Ref ID: #{refundData._id?.slice(-6).toUpperCase()}</div>
          </div>
        </div>

        {/* Customer Manifest Block */}
        <div className="my-3 text-[10px] bg-red-500/5 p-2 rounded border border-red-200/40">
          <div className="font-bold text-zinc-900">Refund Target Customer: {refundData.customer?.name}</div>
          <div className="text-zinc-600 mt-0.5">Original Invoice Linkage ref: #{refundData.originalInvoiceId?.slice(-8).toUpperCase()}</div>
        </div>

        {/* Returned Items Matrix */}
        <table className="w-full text-left border-collapse my-3 text-[10px]">
          <thead>
            <tr className="bg-red-50 text-red-800 font-semibold border-b border-red-200">
              <th className="px-2 py-1 w-6">#</th>
              <th className="px-2 py-1">Returned Item Manifest</th>
              <th className="px-2 py-1 text-right">Rate</th>
              <th className="px-2 py-1 text-center">Qty Returned</th>
              <th className="px-2 py-1 text-right">Refund Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-800">
            {refundData.items.map((item, idx) => (
              <tr key={item.productId || idx} className="bg-red-50/20">
                <td className="px-2 py-2 font-mono text-zinc-400">{idx + 1}</td>
                <td className="px-2 py-2 font-bold text-red-950">{item.name}</td>
                <td className="px-2 py-2 text-right font-mono">Rs.{item.price.toFixed(2)}</td>
                <td className="px-2 py-2 text-center font-mono font-bold text-red-600">+{item.orderedQuantity}</td>
                <td className="px-2 py-2 text-right font-bold text-zinc-950 font-mono">Rs.{item.subTotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="flex justify-between items-end mt-4 pt-3 border-t border-zinc-200">
          <div className="w-1/2 text-[9px] text-zinc-400 italic">
            This credit voucher verifies item intake restock loops. Value can be refunded or used for future balance adjustments.
          </div>
          <div className="w-1/2 space-y-1 text-zinc-600 text-right">
            <div className="flex justify-between pl-12 text-[10px]">
              <span>Taxable Total:</span>
              <span className="text-zinc-900 font-mono">Rs.{baseAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center bg-red-600 text-white px-3 py-1.5 rounded text-[11px] font-bold mt-2">
              <span>Total Refund Due:</span>
              <span className="font-black font-mono text-xs">Rs.{absoluteGrandRefund.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
      {/* --- PRINT CONTAINER END --- */}
    </div>
  );
};

export default RefundVoucherTemplate;