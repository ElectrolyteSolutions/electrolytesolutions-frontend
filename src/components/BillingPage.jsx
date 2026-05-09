import React, { useState } from 'react';
import { Plus, Trash2, ArrowLeft, Printer } from 'lucide-react';

const BillingPage = ({ customer, onBack }) => {
  const [items, setItems] = useState([{ id: 1, description: '', price: 0, qty: 1 }]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: '', price: 0, qty: 1 }]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-brand-primary mb-6 transition-colors">
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-lg border p-8">
        {/* Invoice Header */}
        <div className="flex justify-between border-b pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">INVOICE</h1>
            <p className="text-slate-500 mt-1">Electrolyte Solutions | Service Record</p>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p className="font-bold text-slate-800">Date: {new Date().toLocaleDateString()}</p>
            <p>Invoice #: {Math.floor(1000 + Math.random() * 9000)}</p>
          </div>
        </div>

        {/* Customer & Device Info */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">Customer Details</h3>
            <p className="font-bold text-lg">{customer.name}</p>
            <p className="text-slate-600">{customer.address}</p>
            <p className="text-slate-600">Ph: {customer.phone}</p>
          </div>
          {customer.serviceType === 'repairing' && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">Device Specification</h3>
              <p><span className="font-medium">Device:</span> {customer.deviceName}</p>
              <p><span className="font-medium">Type:</span> {customer.deviceType}</p>
              <p><span className="font-medium">Serial/HID:</span> {customer.deviceHardwareId}</p>
            </div>
          )}
        </div>

        {/* Dynamic Item Entry */}
        <div className="mb-8">
          <table className="w-full mb-4">
            <thead>
              <tr className="text-left border-b text-slate-400 text-sm">
                <th className="pb-2 font-medium">Description (Spare Part / Service)</th>
                <th className="pb-2 font-medium w-32">Price</th>
                <th className="pb-2 font-medium w-24">Qty</th>
                <th className="pb-2 font-medium w-32">Total</th>
                <th className="pb-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => (
                <tr key={item.id} className="group">
                  <td className="py-4">
                    <input 
                      type="text" placeholder="e.g. 12V Battery or Repair Charge"
                      className="w-full outline-none focus:text-brand-primary"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    />
                  </td>
                  <td className="py-4">
                    <input 
                      type="number" className="w-full outline-none"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td className="py-4">
                    <input 
                      type="number" className="w-full outline-none"
                      value={item.qty}
                      onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 1)}
                    />
                  </td>
                  <td className="py-4 font-semibold">
                    ₹{(item.price * item.qty).toLocaleString()}
                  </td>
                  <td className="py-4 text-right">
                    <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={addItem} className="flex items-center gap-2 text-brand-primary font-semibold text-sm hover:opacity-80">
            <Plus size={18} /> Add Line Item
          </button>
        </div>

        {/* Calculation Summary */}
        <div className="border-t pt-6 flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t pt-3">
              <span>Total Amount</span>
              <span className="text-brand-primary">₹{subtotal.toLocaleString()}</span>
            </div>
            <button 
              onClick={() => window.print()} 
              className="w-full bg-slate-900 text-white py-3 rounded-xl mt-4 flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
            >
              <Printer size={20} /> Print Invoice (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;