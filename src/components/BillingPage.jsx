import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Printer, Globe, Phone, Mail, MapPin } from 'lucide-react';

const BillingPage = ({ customers }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  
  // Firm Details - You can later move these to a config file or .env
  const firmDetails = {
    name: "Electrolyte Solutions",
    proprietor: "Your Name Here",
    address: "123 Energy Street, Battery Hub, City - 000000",
    phone: "+91 98765 43210",
    email: "contact@electrolytesolutions.com",
    website: "www.electrolytesolutions.com"
  };

  const [items, setItems] = useState([{ id: 1, description: '', price: 0, qty: 1 }]);

  useEffect(() => {
    const found = customers.find(c => c.id.toString() === id);
    if (found) setCustomer(found);
    else navigate('/');
  }, [id, customers, navigate]);

  const addItem = () => setItems([...items, { id: Date.now(), description: '', price: 0, qty: 1 }]);
  const removeItem = (id) => items.length > 1 && setItems(items.filter(item => item.id !== id));
  const updateItem = (id, field, value) => setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);

  if (!customer) return <div className="p-8 text-center font-mono">Accessing Records...</div>;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-brand-primary mb-6 transition-colors print:hidden">
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-2xl border p-10 print:shadow-none print:border-none print:p-0">
        
        {/* HEADER: Firm Info & Branding */}
        <div className="flex justify-between items-start border-b-4 border-brand-primary pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{firmDetails.name}</h1>
            <p className="text-brand-primary font-bold uppercase tracking-widest text-sm mb-4">Power & Energy Experts</p>
            
            <div className="space-y-1 text-slate-600 text-sm">
              <div className="flex items-center gap-2"><MapPin size={14}/> {firmDetails.address}</div>
              <div className="flex items-center gap-2"><Phone size={14}/> {firmDetails.phone}</div>
              <div className="flex items-center gap-2"><Mail size={14}/> {firmDetails.email}</div>
              <div className="flex items-center gap-2"><Globe size={14}/> {firmDetails.website}</div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="bg-slate-900 text-white px-6 py-2 rounded-bl-3xl font-bold mb-4 inline-block">RETAIL INVOICE</div>
            <p className="text-slate-500 text-xs font-bold uppercase">Proprietor</p>
            <p className="font-serif italic text-lg text-slate-800">{firmDetails.proprietor}</p>
          </div>
        </div>

        {/* CUSTOMER & INVOICE DETAILS */}
        <div className="grid grid-cols-2 gap-12 mb-10">
          <div className="border-l-4 border-slate-200 pl-4">
            <h3 className="text-xs uppercase font-black text-slate-400 mb-2">Billing To:</h3>
            <p className="text-xl font-bold text-slate-900">{customer.name}</p>
            <p className="text-slate-600 text-sm">{customer.address}</p>
            <p className="text-slate-800 font-semibold mt-1">Phone: {customer.phone}</p>
          </div>
          
          <div className="space-y-1 text-right">
            <p className="text-sm"><span className="text-slate-400 font-bold uppercase">Invoice No:</span> <span className="font-mono font-bold">ES-{id.toString().slice(-6)}</span></p>
            <p className="text-sm"><span className="text-slate-400 font-bold uppercase">Date:</span> <span className="font-bold">{new Date().toLocaleDateString('en-IN')}</span></p>
            {customer.serviceType === 'repairing' && (
              <div className="mt-4 text-xs bg-slate-50 p-2 rounded inline-block text-left">
                <p><strong>Device:</strong> {customer.deviceName} ({customer.deviceHardwareId})</p>
                <p><strong>Type:</strong> {customer.deviceType}</p>
              </div>
            )}
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="mb-10">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-left">
                <th className="p-3 text-xs uppercase w-16">S.No</th>
                <th className="p-3 text-xs uppercase">Description of Goods/Services</th>
                <th className="p-3 text-xs uppercase w-32 text-right">Price</th>
                <th className="p-3 text-xs uppercase w-20 text-center">Qty</th>
                <th className="p-3 text-xs uppercase w-32 text-right">Total</th>
                <th className="p-3 w-10 print:hidden"></th>
              </tr>
            </thead>
            <tbody className="border-b-2 border-slate-900">
              {items.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                  <td className="p-3 font-mono text-slate-400 text-sm">{index + 1}</td>
                  <td className="p-3">
                    <input 
                      type="text" placeholder="Enter product or service name..."
                      className="w-full bg-transparent outline-none focus:text-brand-primary font-medium"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    />
                  </td>
                  <td className="p-3 text-right">
                    <input 
                      type="number" className="w-full bg-transparent outline-none text-right"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input 
                      type="number" className="w-full bg-transparent outline-none text-center"
                      value={item.qty}
                      onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 1)}
                    />
                  </td>
                  <td className="p-3 text-right font-bold text-slate-800">
                    ₹{(item.price * item.qty).toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right print:hidden">
                    <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button 
            onClick={addItem} 
            className="mt-4 flex items-center gap-2 text-brand-primary font-black text-xs uppercase tracking-widest hover:opacity-70 print:hidden"
          >
            <Plus size={16} /> Add Another Item
          </button>
        </div>

        {/* SUMMARY SECTION */}
        <div className="flex justify-between items-end">
          <div className="text-[10px] text-slate-400 max-w-xs uppercase font-bold leading-relaxed italic">
            * All repairs carry a 30-day warranty unless specified otherwise.<br/>
            * Goods once sold will not be taken back.
          </div>
          
          <div className="w-full max-w-xs">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-500 font-bold text-xs uppercase">No. of Items</span>
              <span className="font-bold text-slate-800">{items.length}</span>
            </div>
            <div className="flex justify-between items-center py-4 text-3xl font-black text-slate-900">
              <span className="text-sm uppercase text-slate-400">Total</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="mt-6 space-y-3 print:hidden">
              <button 
                onClick={() => window.print()} 
                className="w-full bg-brand-primary text-white py-4 rounded-lg flex items-center justify-center gap-3 hover:bg-brand-dark transition-all font-black uppercase tracking-widest shadow-xl shadow-blue-100"
              >
                <Printer size={20} /> Print Invoice
              </button>
            </div>
          </div>
        </div>

        {/* SIGNATURE SECTION */}
        <div className="hidden print:flex justify-between mt-20 pt-10">
          <div className="text-center w-48 border-t border-slate-200 pt-2 text-[10px] text-slate-400 uppercase font-bold">
            Customer Signature
          </div>
          <div className="text-center w-64 border-t-2 border-slate-900 pt-2 text-[10px] text-slate-900 uppercase font-black">
            For {firmDetails.name}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;