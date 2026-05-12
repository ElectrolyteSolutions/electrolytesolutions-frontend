import React, { useState, useContext } from 'react';
import { ERPContext } from '../context/ERPContext';
import axios from 'axios';
import { Printer, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const POS = () => {
  const { products, customers, refreshData } = useContext(ERPContext);
  const [cart, setCart] = useState([]);
  const [selectedCust, setSelectedCust] = useState(null);
  const [serviceType, setServiceType] = useState('purchase'); // 'repairing' or 'purchase'
  const [selectedDevice, setSelectedDevice] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Paid');

  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert("Warning: Product out of stock. Item will be added to the Order List.");
    }
    const existing = cart.find(i => i.productId === product._id);
    if (existing) {
      setCart(cart.map(i => i.productId === product._id ? { ...i, qty: i.qty + 1, total: (i.qty + 1) * i.price } : i));
    } else {
      setCart([...cart, { productId: product._id, name: product.name, qty: 1, price: product.price, total: product.price }]);
    }
  };

  const submitInvoice = async () => {
    if (!selectedCust) return alert("Please select a customer");
    
    const payload = {
      customerId: selectedCust._id,
      deviceId: serviceType === 'repairing' ? selectedDevice : null,
      items: cart,
      grandTotal: cart.reduce((sum, i) => sum + i.total, 0),
      paymentStatus,
      serviceType
    };

    try {
      await axios.post('http://localhost:5000/api/billing', payload);
      alert("Bill Created Successfully!");
      setCart([]);
      refreshData(); // Updates the Inventory list and Dashboard alerts automatically
    } catch (err) {
      alert("Error processing transaction");
    }
  };

  return (
    <div className="flex gap-8 h-[calc(100vh-120px)]">
      {/* Product Catalog */}
      <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm border overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black">Shop Items</h2>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setServiceType('purchase')}
              className={`px-4 py-2 rounded-lg font-bold text-sm ${serviceType === 'purchase' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >Purchase</button>
            <button 
              onClick={() => setServiceType('repairing')}
              className={`px-4 py-2 rounded-lg font-bold text-sm ${serviceType === 'repairing' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >Repairing</button>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map(p => (
            <button 
              key={p._id} onClick={() => addToCart(p)}
              className="p-4 border-2 border-slate-50 rounded-2xl hover:border-blue-500 hover:bg-blue-50/30 text-left transition-all relative group"
            >
              {p.stock <= 0 && <span className="absolute top-2 right-2 bg-red-100 text-red-600 text-[10px] font-black px-2 py-1 rounded-md">OUT OF STOCK</span>}
              <p className="font-bold text-slate-800">{p.name}</p>
              <p className="text-brand-primary font-black mt-1">₹{p.price}</p>
              <p className={`text-[10px] font-bold mt-2 ${p.stock <= 0 ? 'text-red-400' : 'text-slate-400'}`}>QTY AVAILABLE: {p.stock}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Checkout Sidebar */}
      <div className="w-96 bg-slate-900 rounded-3xl p-6 text-white flex flex-col shadow-2xl">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 italic">
          <Printer size={20} className="text-blue-400"/> New Invoice
        </h2>

        {/* Customer Select */}
        <div className="space-y-4 mb-6">
          <select 
            className="w-full bg-slate-800 border-none rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setSelectedCust(customers.find(c => c._id === e.target.value))}
          >
            <option value="">Choose Customer...</option>
            {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
          </select>

          {serviceType === 'repairing' && selectedCust && (
            <select 
              className="w-full bg-slate-800 border-none rounded-xl p-3 text-sm outline-none animate-in fade-in"
              onChange={(e) => setSelectedDevice(e.target.value)}
            >
              <option value="">Select Customer Device...</option>
              {selectedCust.devices?.map(d => <option key={d._id} value={d._id}>{d.name} ({d.serialNumber})</option>)}
            </select>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2">
          {cart.map(item => (
            <div key={item.productId} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700">
              <div className="text-sm">
                <p className="font-bold">{item.name}</p>
                <p className="text-xs text-slate-500">{item.qty} x ₹{item.price}</p>
              </div>
              <p className="font-bold text-blue-400">₹{item.total}</p>
            </div>
          ))}
        </div>

        {/* Payment Status Toggle */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <button 
            onClick={() => setPaymentStatus('Paid')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${paymentStatus === 'Paid' ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            <CheckCircle2 size={14}/> PAID
          </button>
          <button 
            onClick={() => setPaymentStatus('Pending')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${paymentStatus === 'Pending' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            <Clock size={14}/> PENDING
          </button>
        </div>

        {/* Final Total */}
        <div className="border-t border-slate-700 pt-4 mt-auto">
          <div className="flex justify-between text-2xl font-black mb-6">
            <span className="text-slate-500 text-sm uppercase">Total</span>
            <span>₹{cart.reduce((sum, i) => sum + i.total, 0).toLocaleString()}</span>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={submitInvoice}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 py-4 rounded-2xl font-black transition-all shadow-lg shadow-blue-900/20"
          >
            GENERATE BILL
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;