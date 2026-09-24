import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import BillReceiptCore from '../components/BillReceiptCore';

const PublicBillView = () => {
  const { token } = useParams();
  const printRef = useRef();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGstinMasked, setIsGstinMasked] = useState(true);

  useEffect(() => {
    const fetchPublicBill = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}billings/public/${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load bill.');
        }

        setBill(data.bill);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicBill();
  }, [token]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono text-zinc-400">Loading your secure bill...</p>
        </div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg max-w-md w-full text-center space-y-3">
          <div className="text-2xl">⚠️</div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-red-400">Access Error</h2>
          <p className="text-xs text-zinc-400">{error || 'Bill not found or link has expired.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-6 px-2 sm:px-4 flex flex-col items-center justify-start">
      
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

      <div className="w-full max-w-[800px] bg-white rounded-xl shadow-2xl overflow-hidden p-2 sm:p-4">
        <div ref={printRef} id="printable-invoice-receipt" className="w-full bg-white">
          <BillReceiptCore 
            invoice={bill}
            resolvedCustomer={bill.customer}
            resolvedDevice={bill.device}
            displayedGstin={displayedGstin}
            isGstinMasked={isGstinMasked}
            setIsGstinMasked={setIsGstinMasked}
            showControls={true}
            onPrint={handlePrint}
          />
        </div>
      </div>
    </div>
  );
};

export default PublicBillView;