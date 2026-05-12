import React, { useState, useContext } from 'react';
import { ERPContext } from '../context/ERPContext';
import axios from 'axios';
import { UserPlus, Smartphone, History, Search, MapPin, Phone, Users, X, PlusCircle } from 'lucide-react';

const Customers = () => {
  const { customers, refreshData } = useContext(ERPContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Modal States
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);

  // New Customer Form State
  const [custForm, setCustForm] = useState({ name: '', phone: '', address: '' });
  
  // New Device Form State
  const [deviceForm, setDeviceForm] = useState({ name: '', type: 'Inverter', serialNumber: '', hardwareId: '' });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm)
  );

  const handleRegisterCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/customers', custForm);
      setIsRegModalOpen(false);
      setCustForm({ name: '', phone: '', address: '' });
      refreshData();
    } catch (err) { alert("Error: Phone number must be unique."); }
  };

  const handleRegisterDevice = async (e) => {
    e.preventDefault();
    try {
      // Logic assumes backend expects { ...deviceData, owner: customerId }
      await axios.post(`http://localhost:5000/api/customers/${selectedCustomer._id}/devices`, deviceForm);
      setIsDeviceModalOpen(false);
      setDeviceForm({ name: '', type: 'Inverter', serialNumber: '', hardwareId: '' });
      refreshData();
      alert("Device added successfully!");
    } catch (err) { alert("Error adding device."); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Directory */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <button 
            onClick={() => setIsRegModalOpen(true)}
            className="w-full mb-4 bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <UserPlus size={18} /> Register Customer
          </button>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Search by name or phone..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
            {filteredCustomers.map(cust => (
              <button 
                key={cust._id}
                onClick={() => setSelectedCustomer(cust)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedCustomer?._id === cust._id 
                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                  : 'border-transparent hover:bg-slate-50'
                }`}
              >
                <p className="font-bold text-slate-800">{cust.name}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <Phone size={12}/> {cust.phone}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Details */}
      <div className="lg:col-span-2">
        {selectedCustomer ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-slate-50/50 -mr-4 -mt-4"><Users size={120}/></div>
              <h2 className="text-3xl font-black text-slate-800 mb-2">{selectedCustomer.name}</h2>
              <div className="flex flex-wrap gap-4 text-slate-600 text-sm">
                <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full font-medium">
                  <Phone size={14} className="text-blue-500"/> {selectedCustomer.phone}
                </span>
                <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full font-medium">
                  <MapPin size={14} className="text-red-500"/> {selectedCustomer.address}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Device Panel */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                    <Smartphone className="text-blue-500" size={20}/> Devices
                    </h3>
                    <button 
                        onClick={() => setIsDeviceModalOpen(true)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        <PlusCircle size={20}/>
                    </button>
                </div>
                <div className="space-y-3">
                  {selectedCustomer.devices?.length > 0 ? (
                    selectedCustomer.devices.map(device => (
                      <div key={device._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                        <p className="font-bold text-slate-800 text-sm">{device.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">SN: {device.serialNumber}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 italic py-4">No devices registered.</p>
                  )}
                </div>
              </div>

              {/* History Panel */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <History className="text-purple-500" size={20}/> History
                </h3>
                <div className="space-y-3">
                  {selectedCustomer.purchaseHistory?.length > 0 ? (
                    selectedCustomer.purchaseHistory.map(bill => (
                      <div key={bill._id} className="flex justify-between items-center p-3 border-b border-slate-50 group">
                        <div>
                          <p className="text-xs font-bold text-slate-800">INV-{bill.invoiceNo}</p>
                          <p className="text-[10px] text-slate-400">{new Date(bill.createdAt).toLocaleDateString()}</p>
                        </div>
                        <p className="font-bold text-blue-600 text-sm">₹{bill.grandTotal}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 italic py-4">No transactions found.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-300 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <Users size={64} className="mb-4 opacity-20" />
            <p className="font-bold text-lg">Select a customer to view ERP profile</p>
          </div>
        )}
      </div>

      {/* MODAL: Customer Registration */}
      {isRegModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-black">Register New Customer</h2>
                <button onClick={() => setIsRegModalOpen(false)}><X/></button>
            </div>
            <form onSubmit={handleRegisterCustomer} className="p-8 space-y-4">
              <input 
                placeholder="Full Name" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500"
                onChange={e => setCustForm({...custForm, name: e.target.value})} required 
              />
              <input 
                placeholder="Phone Number" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500"
                onChange={e => setCustForm({...custForm, phone: e.target.value})} required 
              />
              <textarea 
                placeholder="Address" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 h-24"
                onChange={e => setCustForm({...custForm, address: e.target.value})} required 
              />
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-200">
                Register Customer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Device Registration */}
      {isDeviceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-black">Link Device to {selectedCustomer.name}</h2>
                <button onClick={() => setIsDeviceModalOpen(false)}><X/></button>
            </div>
            <form onSubmit={handleRegisterDevice} className="p-8 space-y-4">
              <input 
                placeholder="Device Name (e.g., Exide Battery)" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500"
                onChange={e => setDeviceForm({...deviceForm, name: e.target.value})} required 
              />
              <select 
                className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500"
                onChange={e => setDeviceForm({...deviceForm, type: e.target.value})}
              >
                <option value="Inverter">Inverter</option>
                <option value="Battery">Battery</option>
                <option value="Solar Panel">Solar Panel</option>
                <option value="Other">Other</option>
              </select>
              <input 
                placeholder="Serial Number" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                onChange={e => setDeviceForm({...deviceForm, serialNumber: e.target.value})} required 
              />
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black">
                Link Device
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;