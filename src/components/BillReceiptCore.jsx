import React from 'react';
import logourl from '../assets/icon.png';
import signUrl from '../assets/sign.png';
import stampUrl from '../assets/stamp.png';

const BillReceiptCore = ({ 
  invoice, 
  resolvedCustomer, 
  resolvedDevice, 
  displayedGstin, 
  isGstinMasked, 
  setIsGstinMasked, 
  showControls = false, 
  onPrint 
}) => {
  // Base total calculation uses post-discount line subtotals + service fees
  const grossTotal = (invoice.items || []).reduce((sum, item) => sum + (item.subTotal || 0), 0) + (invoice.serviceCharge || 0);

  return (
    <div className="w-full bg-white text-zinc-900 overflow-x-hidden">
      <head><title>{invoice?.billNumber}</title></head>
      {/* Optional Control Actions bar */}
      {showControls && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-3 border-b border-zinc-200 pb-3 px-2 no-print">
          <span className="text-xs text-zinc-500 font-medium text-center sm:text-left">Invoice Printing Engine Preview</span>
          <div className="flex items-center gap-2">
            {setIsGstinMasked && (
              <button 
                onClick={() => setIsGstinMasked(!isGstinMasked)}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-3 py-1.5 rounded-md font-medium text-xs transition-all shadow border border-zinc-300 cursor-pointer"
              >
                {isGstinMasked ? '👁️ Unmask GSTIN' : '🔒 Mask GSTIN'}
              </button>
            )}
            
            {onPrint && (
              <button 
                onClick={onPrint}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-md font-semibold text-xs transition-all shadow cursor-pointer"
              >
                🖨️ Print Invoice Sheet
              </button>
            )}
          </div>
        </div>
      )}

      <div className="w-full pb-2 bg-white">
        <div className="bg-white text-zinc-900 p-4 sm:p-5 rounded-md font-sans tracking-tight text-[11px] w-full">
          
          {/* Branded Identity Header Block */}
          <div className="flex justify-between items-start border-b border-zinc-300 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded bg-white border border-zinc-200 overflow-hidden flex items-center justify-center p-0.5 shrink-0">
                <img 
                  src={logourl} 
                  alt="Company Identity Logo" 
                  className="w-full h-full object-contain mix-blend-multiply rounded" 
                />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-zinc-950 tracking-tighter leading-none">ELECTROLYTE SOLUTIONS</h1>
                <p className="text-[10px] text-zinc-500 leading-tight mt-1">
                  Nahar Bala Ganj, Balrampur, UP, 271201<br />
                  <span className="font-semibold font-mono text-zinc-700 text-[9px]">Contact No.: 9648146167, 8081111867</span><br/>
                  <span className="font-semibold font-mono text-zinc-700 text-[9px]">Email: contact.electolytesolutions@gmail.com</span><br/>
                  <span className="font-semibold font-mono text-zinc-700 text-[9px]">Website: www.electrolytesolutions.in</span>
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-bold font-mono text-zinc-900 text-[11px] uppercase">GSTIN: {displayedGstin}</p>
              <h2 className="text-xs font-black text-zinc-950 uppercase tracking-wider   rounded inline-block mt-1">Tax Invoice</h2>
              <div className="text-[10px] text-zinc-600  font-mono">
                <div className="text-[9px] text-zinc-900  font-bold  rounded uppercase tracking-wide inline-block mb-1">Purpose: {invoice.purpose}</div>
                <div>Date: {invoice.lastUpdated ? invoice.lastUpdated.split(',')[0] : new Date(invoice.createdAt || Date.now()).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-200 border-b border-zinc-200 p-1.5 flex justify-between items-center text-[9px] font-mono text-zinc-800 ">
            <span className="font-sans font-bold uppercase tracking-wider text-zinc-500">Bill Id:</span>
            <span className="font-bold select-all tracking-wide text-zinc-950">{invoice.billNumber || invoice._id}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 my-2 border-b border-zinc-100">
            <div>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Billed To:</span>
              <div className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                {resolvedCustomer?.name || 'Walk-in Client'}
                <span className="text-[8px] bg-zinc-100 text-zinc-600 border px-1 rounded font-normal uppercase tracking-tight">
                  {resolvedCustomer?.customerType || 'Individual'}
                </span>
              </div>
              <div className="text-zinc-600 text-[10px] leading-tight mt-0.5" title={resolvedCustomer?.address}>
                {resolvedCustomer?.address || 'Counter Sale Transaction Log'}
              </div>
              <div className="text-zinc-700 font-mono font-medium text-[10px] mt-0.5">Phone: {resolvedCustomer?.phone || 'N/A'}</div>
              {resolvedCustomer?.gst && <div className="text-zinc-700 font-mono font-medium text-[10px]">GSTIN: {resolvedCustomer?.gst}</div>}
              {resolvedCustomer?.pan && <div className="text-zinc-700 font-mono font-medium text-[10px]">PAN: {resolvedCustomer?.pan}</div>}
            </div>
            
            <div className="text-right flex flex-col items-end justify-start">
              {invoice.purpose === 'repair' && resolvedDevice ? (
                <div className="bg-zinc-50 p-2 rounded text-left border border-zinc-200 w-full max-w-[260px] space-y-1">
                  <div className="font-bold text-zinc-400 text-[8px] uppercase tracking-wide leading-none">Hardware Asset Profile</div>
                  <div className="text-zinc-900 text-[11px] font-black leading-none">{resolvedDevice.deviceName}</div>
                  <div className="text-zinc-600 font-mono text-[9px]">HWID: {resolvedDevice.deviceHardwareId}</div>
                  
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
          <table className="w-full text-left border-collapse my-2 text-[10px]">
            <thead>
              <tr className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-300">
                <th className="px-2 py-1.5 w-6">#</th>
                <th className="px-2 py-1.5">Item Description</th>
                <th className="px-2 py-1.5 text-right w-14">HSN</th>
                <th className="px-2 py-1.5 text-right w-14">Rate</th>
                <th className="px-2 py-1.5 text-right w-12 text-amber-600">Discount</th>
                <th className="px-2 py-1.5 text-right w-16 font-mono text-zinc-600">CGST<span className="text-[7px] font-normal ml-1">(9%)</span></th>
                <th className="px-2 py-1.5 text-right w-16 font-mono text-zinc-600">SGST<span className="text-[7px] font-normal ml-1">(9%)</span></th>
                <th className="px-2 py-1.5 text-center w-8">Qty</th>
                <th className="px-2 py-1.5 text-right w-16">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-800">
              {invoice.items?.map((item, idx) => {
                const itemPrice = Number(item.price) || 0;
                const itemDiscount = Number(item.discount) || 0;
                const itemQty = Number(item.orderedQuantity) || 1;

                const calculatedRate = itemPrice - (0.18 * itemPrice);
                const taxableValuePerUnit = calculatedRate - itemDiscount;
                const lineTaxableTotal = taxableValuePerUnit * itemQty;
                
                const cgst = lineTaxableTotal * 0.09;
                const sgst = lineTaxableTotal * 0.09;
                const calculatedTotal = (itemPrice - itemDiscount) * itemQty;

                return (
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
                    <td className="px-2 py-2 text-right font-mono">{item?.hsn || "-"} </td>
                    <td className="px-2 py-2 text-right font-mono">₹{calculatedRate.toFixed(2)}</td>
                    <td className={`px-2 py-2 text-right font-mono font-medium ${itemDiscount > 0 ? 'text-amber-600 bg-amber-50/40' : 'text-zinc-400'}`}>
                      {itemDiscount > 0 ? `-${itemDiscount.toFixed(2)}` : '0.00'}
                    </td>
                    <td className="px-2 py-2 text-right font-mono text-zinc-600">₹{cgst.toFixed(2)}</td>
                    <td className="px-2 py-2 text-right font-mono text-zinc-600">₹{sgst.toFixed(2)}</td>
                    <td className="px-2 py-2 text-center font-mono">{itemQty}</td>
                    <td className="px-2 py-2 text-right font-bold text-zinc-950 font-mono">₹{calculatedTotal.toFixed(2)}</td>
                  </tr>
                );
              })}

              {invoice.purpose === 'repair' && invoice.serviceCharge > 0 && (() => {
                const sCharge = Number(invoice.serviceCharge);

                return (
                  <tr className="bg-amber-50/40 border-t border-dashed border-zinc-200">
                    <td className="px-2 py-2 font-mono text-amber-600">*</td>
                    <td className="px-2 py-2 font-medium text-zinc-900">
                      <div>Diagnostic /On-Site Convenience Fee /Technical Service Fee /Installation Charge</div>
                      <div className="text-[8px] text-zinc-400 italic">Non-refundable labor line charge</div>
                    </td>
                    <td className="px-2 py-2 text-right font-mono">-</td>
                    <td className="px-2 py-2 text-right font-mono">₹{sCharge.toFixed(2)}</td>
                    <td className="px-2 py-2 text-right font-mono text-zinc-400">0.00</td>
                    <td className="px-2 py-2 text-center font-mono">-</td>
                    <td className="px-2 py-2 text-right font-mono text-zinc-600">-</td>
                    <td className="px-2 py-2 text-right font-mono text-zinc-600">-</td>
                    <td className="px-2 py-2 text-right font-bold text-zinc-950 font-mono">₹{sCharge.toFixed(2)}</td>
                  </tr>
                );
              })()}
            </tbody>
          </table>

          {/* Lower Summarization Sign-off Area */}
          <div className="flex justify-between items-end  border-t border-zinc-200">
            <div className="w-1/2 text-[9px] text-zinc-400 pr-4 leading-normal flex flex-col justify-between h-full">
              <div>
                <span className="font-bold text-zinc-600 block mb-0.5">Terms & Conditions:</span>
                <span className="block text-zinc-400">Computer generated system document. Valid for processing item-return requests over reverse POS counters when full Token reference ID is supplied.</span>
              </div>

              {/* Scan-to-View Web Bill QR Code Block */}
              {invoice.publicToken && (
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-zinc-100">
                  <img 
                    src={invoice.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://shop.electrolytesolutions.in/bills/${invoice.publicToken}`} 
                    alt="Scan to view bill" 
                    className="w-12 h-12 sm:w-14 sm:h-14 object-contain border border-zinc-200 rounded p-0.5 bg-white shrink-0"
                  />
                  <div className="text-[9px] text-zinc-500 leading-tight">
                    <span className="font-bold text-zinc-700 block uppercase tracking-tight">Scan to View Web Bill</span>
                    <span className="text-[8px] text-zinc-400">Instant digital access</span>
                  </div>
                </div>
              )}
            </div>

            <div className="w-1/2 space-y-1 font-medium text-zinc-600 text-right">
              <div className="flex justify-between items-center bg-zinc-950 text-white print:text-black px-3 py-1.5 rounded text-[11px] font-bold mt-2">
                <span>Grand Net Total:</span>
                <span className="font-black font-mono text-xs print:text-black">₹{grossTotal.toFixed(2)}</span>
              </div>

              {/* Signature space */}
              <div className="pt-4 flex flex-col items-end relative">
                {/* Stamp positioned behind the signature area */}
                <img 
                  src={stampUrl} 
                  alt="Company Seal Stamp" 
                  className="absolute bottom- right-16 w-52 sm:w-52 h-auto object-contain mix-blend-multiply opacity-90 pointer-events-none transform -rotate-6" 
                />

                {/* Authorized Signature */}
                <img 
                  src={signUrl} 
                  alt="Authorized Signature" 
                  className="relative z-10 h-10 sm:h-18 w-32 sm:w-28 object-contain mix-blend-multiply mb-1 mr-2" 
                />

                <div className="w-32 sm:w-36 h-0.5 bg-zinc-300 mb-0.5"></div>
                <div className="text-[8px] uppercase font-bold text-zinc-400 tracking-wider">Authorized Signature</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BillReceiptCore;