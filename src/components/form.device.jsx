import React, { useState } from 'react';
import Button from './button';
import CustomList from './list';
import { formatIsoDate } from '../functions/formatIsoDate';

const DeviceDetails = ({
  page=null,
  form,
  setForm,
  editId,
  handleSave,
  handleAddNewClick,
  handleDeleteRecord,
  availableCustomers = [],
  availableTypes = [],
  selectedDevice
}) => {
  const [currentIssueInput, setCurrentIssueInput] = useState('');
  const isCustomer = page === "customer"? true :false
  const handleAddIssue = (e) => {
    if (e) e.preventDefault();
    const trimmedInput = currentIssueInput.trim();
    if (trimmedInput && !form.issues.includes(trimmedInput)) {
      setForm({ ...form, issues: [...form.issues, trimmedInput] });
      setCurrentIssueInput('');
    }
  };

  const handleRemoveIssue = (indexToRemove) => {
    setForm({
      ...form,
      issues: form.issues.filter((_, idx) => idx !== indexToRemove)
    });
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col h-full w-full overflow-x-none">
      <div className='flex flex-row justify-between items-center border-b border-zinc-800 pb-3'>
        <h3 className="text-sm font-medium text-vercel-primary line-clamp-2 w-2/4">
          {editId ? (
            <>Edit Mode: <span className='text-vercel-secondary'>{form.deviceName || 'Device'}</span></>
          ) : (
            'Add Service'
          )}
        </h3>
      
        <div className="flex gap-2">
          <button
            type="submit"
            className="w-fit bg-white hover:opacity-50 text-black px-3 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer"
          >
            {editId ? 'Save Changes' : 'Register Repair Record'}
          </button>
          {editId && (
            <button
              type='button'
              onClick={(e) => handleDeleteRecord(editId, e)}
              className="w-fit bg-red-500 hover:opacity-50 text-white px-3 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer"
            >
              Delete Device
            </button>
          )}
        </div>
      </div>

      {/* Form Body */}
      <div className="mt-3 h-screen bg-vercel-surface rounded-md border-1 border-zinc-800 px-2 py-2 overflow-y-auto space-y-2 custom-scrollbar max-h-[calc(100vh-20%)]">
        <p className='text-xs'>Device Overview</p>

        <div className='bg-vercel-black p-2 border-1 border-zinc-800 rounded-md space-y-2'>
          <div>
            <label >Device Name</label>
            <input 
              maxLength={50}
              placeholder="e.g. MacBook Pro M2" 
              value={form.deviceName}
              onChange={e => setForm({...form, deviceName: e.target.value})} 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label >Hardware ID (SN / IMEI)</label>
              <input 
                placeholder="SN / IMEI"
                max={40}
                className='uppercase'
                value={form.deviceHardwareId}
                onChange={e => setForm({...form, deviceHardwareId: e.target.value})} 
                required 
              />
            </div>
            <div>
              <label >Device Type</label>
              <select
                value={form.deviceType}
                onChange={(e) => setForm({ ...form, deviceType: e.target.value })}
                className=" capitalize "
              >
                {availableTypes?.map((item, index) => (
                  <option key={index} value={item?.value}>{item?.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          {form.deviceType === 'other' && (
            <div>
              <label >Specify Custom Device Type</label>
              <input
                maxLength={30}
                type="text"
                placeholder="e.g., Smartwatch, Console..."
                value={form.customDeviceType}
                onChange={(e) => setForm({ ...form, customDeviceType: e.target.value })}
                required
                
              />
            </div>
          )}
        </div>

        <p className='text-xs'>Customer Details</p>
        <div className='bg-vercel-black p-2 border-1 border-zinc-800 rounded-md'>
          <label >Assigned Customer</label>
          <select 
            onChange={e => setForm({...form, owner: e.target.value})} 
            value={form.owner}
            required
            
          >
            <option value="">Select a customer...</option>
            {availableCustomers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
          </select>
        </div>

        <p className='text-xs'>Service Details</p>
        <div className='bg-vercel-black p-2 border-1 border-zinc-800 rounded-md space-y-2'>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-3 w-full">
              <div>
                <label >Service Status</label>
                <select
                  value={form.deviceRepairingStatus}
                  onChange={(e) => setForm({ ...form, deviceRepairingStatus: e.target.value })}
                  
                >
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className='w-full'>
                <label >Reported Issues / Faults</label>
                <div className="flex gap-2 w-full">
                  <input 
                    placeholder="Type fault & click add (e.g. Broken Glass)"
                    value={currentIssueInput}
                    onChange={e => setCurrentIssueInput(e.target.value)}
                    onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); handleAddIssue(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleAddIssue}
                    className="bg-white w-fit flex items-center justify-center text-black hover:bg-zinc-200 px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label >Added Issues List</label>
              <div className='rounded-md flex-row border-1 border-zinc-800 bg-vercel-surface p-2'>
                {form.issues.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {form.issues.map((issue, idx) => (
                      <div key={idx} className="flex items-center justify-center gap-2 bg-red-950 pl-2.5 pr-1.5 py-1 rounded-md">
                        <span className="text-[11px] font-normal text-vercel-primary">{issue}</span>
                        <button type="button" onClick={() => handleRemoveIssue(idx)} className="text-sm px-1 cursor-pointer">&times;</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-zinc-500 italic">No faults reported yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {editId && <CustomList 
          title="Customer Info"
          items={[
            { key: "Registration TimeStamp", value: formatIsoDate(selectedDevice?.createdAt) },
            { key: "Updated TimeStamp", value: formatIsoDate(selectedDevice?.updatedAt) },
            { key: "Bill Count:", value: selectedDevice?.bills?.length || 0 }
          ]}
        />}
      </div>
    </form>
  );
};

export default DeviceDetails;