import React from 'react';
import logourl from '../assets/icon.png';
import signUrl from '../assets/sign.png';

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
    <div className="w-full">
      <head>
        <title>{invoice.billNumber}</title>
      </head>
      {/* Optional Control Actions bar (Print/Mask toggles) */}
      {showControls && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-3 border-b border-zinc-800 pb-3 px-2 no-print">
          <span className="text-xs text-zinc-400 font-medium text-center sm:text-left">Invoice Printing Engine Preview</span>
          <div className="flex items-center gap-2">
            {setIsGstinMasked && (
              <button 
                onClick={() => setIsGstinMasked(!isGstinMasked)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 sm:py-1.5 rounded-md font-medium text-xs transition-all shadow border border-zinc-700"
                title="Toggle GSTIN Masking"
              >
                {isGstinMasked ? '👁️ Unmask GSTIN' : '🔒 Mask GSTIN'}
              </button>
            )}
            
            {onPrint && (
              <button 
                onClick={onPrint}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 sm:py-1.5 rounded-md font-semibold text-xs transition-all shadow"
              >
                🖨️ Print Invoice Sheet
              </button>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-zinc-700 pb-2">
        <div className="bg-white text-zinc-900 p-5 rounded-md shadow-inner font-sans tracking-tight text-[11px] min-w-[760px]">
          
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              @page { size: A4 portrait; margin: 8mm; }
              body { color: #000000 !important; background: #ffffff !important; padding: 0; margin: 0; }
              .print\\:bg-zinc-100 { background-color: #f4f4f5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .no-print { display: none !important; }
            }
          `}} />

          {/* Branded Identity Header Block */}
          <div className="flex justify-between items-start border-b border-zinc-300 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center p-0.5 shrink-0">
                <img 
                  src={logourl} 
                  alt="Company Identity Logo" 
                  className="w-full h-full object-contain mix-blend-multiply rounded" 
                />
              </div>
              <div>
                <h1 className="text-lg font-black text-zinc-950 tracking-tighter leading-none">ELECTROLYTE SOLUTIONS</h1>
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
              <h2 className="text-xs font-black text-zinc-950 uppercase tracking-wider bg-zinc-100 py-0.5 rounded inline-block">Tax Invoice</h2>
              <div className="text-[10px] text-zinc-600 space-y-0.5 mt-1.5 font-mono">
                <div className="text-[9px] text-zinc-900 bg-zinc-100 font-bold  py-0.5 rounded uppercase tracking-wide inline-block mb-1">Purpose: {invoice.purpose}</div>
                <div>Date: {invoice.lastUpdated ? invoice.lastUpdated.split(',')[0] : new Date(invoice.createdAt || Date.now()).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-100 border-b border-zinc-200 py-1 flex justify-between items-center text-[9px] font-mono text-zinc-800">
            <span className="font-sans font-bold uppercase tracking-wider text-zinc-500">Bill Id:</span>
            <span className="font-bold select-all tracking-wide text-zinc-950">{invoice.billNumber || invoice._id}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 my-3 pb-3 border-b border-zinc-100">
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
              {resolvedCustomer?.gst && <div className="text-zinc-700 font-mono font-medium text-[10px] ">GSTIN: {resolvedCustomer?.gst}</div>}
              {resolvedCustomer?.pan && <div className="text-zinc-700 font-mono font-medium text-[10px] ">PAN: {resolvedCustomer?.pan}</div>}
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
          <table className="w-full text-left border-collapse my-3 text-[10px]">
            <thead>
              <tr className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-300">
                <th className="px-2 py-1.5 w-6">#</th>
                <th className="px-2 py-1.5">Item Description</th>
                <th className="px-2 py-1.5 text-right w-14">
                  <div>HSN</div>
                </th>
                <th className="px-2 py-1.5 text-right w-14">
                  <div>Rate</div>
                </th>
                <th className="px-2 py-1.5 text-right w-12 text-amber-600">Discount</th>
                <th className="px-2 py-1.5 text-right w-16 font-mono text-zinc-600">
                  <div>CGST<span className="text-[7px] font-normal ml-1">(9%)</span></div>
                </th>
                <th className="px-2 py-1.5 text-right w-16 font-mono text-zinc-600">
                  <div>SGST<span className="text-[7px] font-normal ml-1">(9%)</span></div>
                </th>
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
                    <td className={`px-2 py-2 text-right font-mono font-medium ${itemDiscount > 0 ? 'text-amber-600 bg-amber-50/40 print:bg-amber-50' : 'text-zinc-400'}`}>
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
                      <div>Technical Service Labor / Diagnostic Fee</div>
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
          <div className="flex justify-between items-end mt-4 pt-3 border-t border-zinc-200">
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
                    className="w-14 h-14 object-contain border border-zinc-200 rounded p-0.5 bg-white shrink-0"
                  />
                  <div className="text-[9px] text-zinc-500 leading-tight">
                    <span className="font-bold text-zinc-700 block uppercase tracking-tight">Scan to View Web Bill</span>
                    <span className="text-[8px] text-zinc-400">Instant digital access</span>
                  </div>
                </div>
              )}
            </div>

            <div className="w-1/2 space-y-1 font-medium text-zinc-600 text-right">
              <div className="flex justify-between items-center bg-zinc-950 text-white px-3 py-1.5 rounded text-[11px] font-bold mt-2">
                <span>Grand Net Total:</span>
                <span className="font-black font-mono text-xs">₹{grossTotal.toFixed(2)}</span>
              </div>

              {/* Signature space */}
              <div className="pt-5 flex flex-col items-end">
                <img 
                  src={signUrl} 
                  alt="Authorized Signature" 
                  className="h-12 w-28 object-contain mix-blend-multiply mb-1 mr-2" 
                />
                <div className="w-36 h-0.5 bg-zinc-300 mb-0.5"></div>
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