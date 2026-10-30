import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { checkEmailAvailability } from '../features/customerSlice';
import { formatIsoDate } from '../functions/formatIsoDate';
import CustomList from './list';

const CustomerDetails = ({
  form,
  setForm,
  editId,
  handleSave,
  promptDeleteCustomer,
  customer
}) => {
  const dispatch = useDispatch();
  const [emailStatus, setEmailStatus] = useState(null); // 'checking' | 'available' | 'taken' | null
  const [emailMsg, setEmailMsg] = useState('');

  const handleEmailValidity = async (inputEmail) => {
    const email = (inputEmail !== undefined ? inputEmail : form?.email)?.trim()?.toLowerCase();
    
    // Check if email is empty or doesn't meet basic criteria
    if (!email) {
      setEmailStatus(null);
      return;
    }

    // If we are in edit mode and the email hasn't changed from the user's existing email, it's valid
    if (editId && customer?.email && email === customer.email.trim().toLowerCase()) {
      setEmailStatus('available');
      setEmailMsg("Email is available");
      return;
    }

    // Regex check: must contain '@', have text before it, have text between '@' and '.com', and end with '.com'
    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
    if (!emailRegex.test(email)) {
      setEmailStatus('taken');
      setEmailMsg("Invalid Email!");
      return;
    }

    setEmailStatus('checking');
    if (email?.endsWith('.com')){
        try {
        const res = await dispatch(checkEmailAvailability(email)).unwrap();
        
        // Ensure we explicitly check the boolean availability returned from the backend
        if (res.available === true) {
            setEmailStatus('available');
            setEmailMsg("Email is available");
        } else {
            setEmailStatus('taken');
            setEmailMsg("Sorry ! You can't use this email");
        }
        } catch (err) {
        setEmailStatus('taken');
        setEmailMsg(typeof err === 'string' ? err : 'Email check failed');
        }
    }
  };

  const isFormInvalid = emailStatus === 'taken' || emailStatus === 'checking';

  return (
    <form onSubmit={handleSave} className="flex flex-col h-full w-full overflow-x-none px-3 py-6">
      <div className='flex flex-row justify-between items-center border-b border-zinc-800 pb-3'>
        <h3 className="text-sm font-bold text-vercel-primary line-clamp-2 w-2/4">
          {editId ? (
            <>Edit Mode: <span className='text-vercel-secondary'>{form.name || `${form.firstName || ''} ${form.lastName || ''}`.trim() || 'Customer'}</span></>
          ) : (
            'New Customer Registration'
          )}
        </h3>
        <div className="flex gap-2">
          <button
            disabled={isFormInvalid}
            type="submit"
            className={`w-fit px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
              isFormInvalid ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed opacity-50' : 'bg-white hover:opacity-80 text-black cursor-pointer'
            }`}
          >
            {editId ? 'Update Customer' : 'Add Customer'}
          </button>
          {editId && (
            <button
              type='button'
              onClick={() => promptDeleteCustomer()}
              className="w-fit bg-red-500 hover:opacity-80 text-white px-3 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 h-screen bg-vercel-surface rounded-md border-1 border-zinc-800 p-2 overflow-y-auto space-y-2 custom-scrollbar max-h-[calc(100vh-20%)]">
        {/* Customer Category & Info */}
        <p className='text-xs font-medium'>Customer Profile & Classification</p>
        <div className='bg-vercel-black p-2 border-1 border-zinc-800 rounded-md space-y-2'>
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Customer Category</label>
            <select
              value={form.customerType}
              onChange={e => setForm({ ...form, customerType: e.target.value })}
              required
            >
              <option value="Individual">Individual</option>
              <option value="Corporate">Corporate</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">
              {form.customerType === "Corporate" ? "Corporate Name" : "Full Name"}
            </label>

            {form.customerType === "Corporate" ? (
              <div className="space-y-2">
                <input
                  type="text"
                  maxLength={100}
                  placeholder="e.g. Acme Corp Pvt Ltd"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Company GST</label>
                    <input
                      type="text"
                      maxLength={20}
                      placeholder="GSTIN Number..."
                      value={form.gst || ''}
                      onChange={e => setForm({ ...form, gst: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">PAN</label>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="PAN Number..."
                      value={form.pan || ''}
                      onChange={e => setForm({ ...form, pan: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  maxLength={50}
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  required
                />
                <input
                  type="text"
                  maxLength={50}
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Contact & Address */}
        <p className='text-xs font-medium'>Contact & Location Details</p>
        <div className='bg-vercel-black px-2 py-2 border-1 border-zinc-800 rounded-md space-y-3'>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label>Phone Number</label>
              <div className="flex flex-row gap-2">
                <input
                  className="w-10"
                  type="text"
                  value="+91"
                  disabled
                />
                <input
                  type="text"
                  maxLength={10}
                  placeholder="00000 00000"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <div>
                <label>Email Address</label>
                <input
                  type="email"
                  maxLength={100}
                  placeholder="e.g. john@example.com"
                  value={form.email || ''}
                  onChange={e => {
                      setForm({ ...form, email: e.target.value });
                      handleEmailValidity(e.target.value);
                      setEmailStatus(null);
                  }}
                  onBlur={() => handleEmailValidity()}
                  className={`w-full focus:outline-none ${
                    emailStatus === 'taken' ? 'border-red-500' : emailStatus === 'available' ? 'border-emerald-500' : 'border-zinc-800 focus:border-emerald-500'
                  }`}
                />
              </div>
              <div className="flex justify-between items-center pt-1">
                {emailStatus === 'checking' && <span className="text-[10px] text-amber-400 animate-pulse">Checking for availability...</span>}
                {emailStatus === 'taken' && <span className="text-[10px] text-red-400">{emailMsg}</span>}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Full Address</label>
            <textarea
              maxLength={300}
              rows={3}
              placeholder="Street, City, Zip Code"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              required
            />
          </div>
        </div>
        {editId && <>
        {customer?.addresses?.length>0 && <><p className='text-sm font-medium'>Address and Location</p>
        {customer?.addresses?.map((add,index)=>{
            return  <CustomList 
                        title={`Addresses ${index + 1}`}        
                        items={[
                        { key: "Address Line 1", value: add?.address1 || "-" },
                        { key: "Address Line 2", value: add?.address2 || "-" },
                        { key: "City", value: add?.city || "-" },
                        { key: "State", value: add?.provice || "-" },
                        { key: "PIN Code", value: add?.zip || "-" },
                        { key: "Is Default", value: add?.isDefault || "-" },
                    ]}
                />})
                }</>}

        <div className=''>
        {customer?.authProvider && 
          <CustomList title="Authentication, Credentials and Core Details"        
                items={[
                { key: "Authentication Type", value: customer?.authProvider || "-" },
                { key: "Devices", value: customer?.devices.length > 0 ? customer?.devices?.map((device)=> device?.deviceName).join(", ") : 0  },
                { key: "Orders", value: customer?.orders.length > 0 ? customer?.orders?.map((device)=> device?.orderNumber).join(", ") : 0  },
                ]}
            />
            }
        </div>

      
        
        </>}
      </div>
    </form>
  );
};

export default CustomerDetails;