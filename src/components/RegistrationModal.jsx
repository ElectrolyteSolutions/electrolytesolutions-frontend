import React, { useState } from 'react';
import { X } from 'lucide-react';

const RegistrationModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '', address: '', phone: '', problem: '',
    serviceType: 'repairing',
    deviceName: '', deviceId: '', deviceType: '', deviceHardwareId: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">New Customer Registration</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input name="name" placeholder="Customer Name" required onChange={handleChange} className="border p-2 rounded w-full" />
            <input name="phone" type="number" placeholder="Phone Number" required onChange={handleChange} className="border p-2 rounded w-full" />
          </div>
          
          <textarea name="address" placeholder="Full Address" required onChange={handleChange} className="border p-2 rounded w-full h-20" />
          
          <div className="grid grid-cols-2 gap-4">
            <select name="serviceType" onChange={handleChange} className="border p-2 rounded w-full">
              <option value="repairing">Repairing</option>
              <option value="purchase">New Purchase</option>
            </select>
            <input name="problem" placeholder="Problem Description / Notes" onChange={handleChange} className="border p-2 rounded w-full" />
          </div>

          {/* Conditional Device Fields */}
          {formData.serviceType === 'repairing' && (
            <div className="bg-slate-50 p-4 rounded-lg grid grid-cols-2 gap-4 animate-in fade-in duration-300">
              <input name="deviceName" placeholder="Device Name (e.g. Inverter)" onChange={handleChange} className="border p-2 rounded bg-white" />
              <input name="deviceType" placeholder="Device Type" onChange={handleChange} className="border p-2 rounded bg-white" />
              <input name="deviceId" placeholder="Device ID / Model" onChange={handleChange} className="border p-2 rounded bg-white" />
              <input name="deviceHardwareId" placeholder="Hardware Serial No." onChange={handleChange} className="border p-2 rounded bg-white" />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600">Cancel</button>
            <button type="submit" className="bg-brand-primary text-white px-6 py-2 rounded-lg font-medium">Save Customer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationModal;