import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import InvoiceTemplate from './InvoiceTemplate';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import Button from './Button';

const InvoiceWrapper = ({ billData, onClose,promptDeleteBill }) => {
  const printRef = useRef();
  const [isGstinMasked, setIsGstinMasked] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

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

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) return;

    try {
      const clone = element.cloneNode(true);
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '794px';
      clone.style.height = 'auto';
      clone.style.transform = 'none';
      clone.style.zIndex = '999999';
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const fileName = `Invoice-${billData?.billNumber || billData?._id || 'receipt'}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert(`Could not generate direct PDF file (${err.message}). Falling back to print dialog.`);
      window.print();
    }
  };

  const handleShareLink = () => {
    const billId = invoice?.publicToken;
    const publicUrl = `${window.location.origin}/bills/${billId}`;
    
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    }).catch(() => {
      alert("Failed to copy link to clipboard.");
    });
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
    <div className="flex flex-col h-full w-full overflow-x-none px-3 py-6">
      <div className='d-flex flex-row justify-between align-items-center border-b-1 border-zinc-800 pb-3'>
      <h3 className="text-sm font-medium text-vercel-primary line-clamp-2 ">
        {billData?.billNumber}
      </h3>
      <div className="flex flex-wrap items-center gap-2 ml-auto">
            <Button 
              label="Delete" 
              type='danger' 
              onClick={()=>promptDeleteBill()}/>
            <Button 
              type={isGstinMasked ? 'secondary' : 'Success'} onClick={()=>setIsGstinMasked(!isGstinMasked)} label={isGstinMasked ? 'Unmask GSTIN' : 'Mask GSTIN'}/>
            <Button type='' onClick={()=>handleShareLink()} label={copyFeedback ? 'Link Copied!' : 'Share'}/>
            <Button type="primary" onClick={()=>handleDownloadPdf()} label="Download"/>
            <Button type='secondary' onClick={()=>handlePrint()} label="Print"/>
          </div>
    </div>
      
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
          body * {
            visibility: hidden !important;
          }
          #printable-invoice-receipt, 
          #printable-invoice-receipt * {
            visibility: visible !important;
          }
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
      <InvoiceTemplate
        printRef={printRef}
        id="printable-invoice-receipt"
        invoice={invoice}
        resolvedCustomer={resolvedCustomer}
        resolvedDevice={resolvedDevice}
        displayedGstin={displayedGstin}
        isGstinMasked={isGstinMasked}
        setIsGstinMasked={setIsGstinMasked}
        showControls={false}
      />
    </div>
  );
};

export default InvoiceWrapper;