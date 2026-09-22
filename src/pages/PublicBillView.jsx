import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BillReceiptCore from '../components/BillReceiptCore';

const PublicBillView = () => {
  const { token } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        <BillReceiptCore 
          invoice={bill}
          resolvedCustomer={bill.customer}
          resolvedDevice={bill.device}
          displayedGstin="09EYOPR0179F1ZV"
          showControls={false}
        />
 
  );
};

export default PublicBillView;