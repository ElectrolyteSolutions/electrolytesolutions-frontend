import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStoreInfo, updateStoreInfo, resetStoreState } from '../features/storeSlice';
import ResizablePanes from '../components/table.extralarge';

export default function StoreSettingsPage() {
  const dispatch = useDispatch();
  const { storeInfo, isLoading, isSuccess, isError, message } = useSelector((state) => state.store);

  const [formData, setFormData] = useState({
    termsOfService: '',
    privacyPolicy: '',
    shippingPolicy: '',
    refundPolicy: '',
    contactInfo: {
      gst: '',
      phones: [''],
      email: '',
      website: '',
      address: ''
    }
  });

  useEffect(() => {
    dispatch(fetchStoreInfo());
  }, [dispatch]);

  useEffect(() => {
    if (storeInfo) {
      setFormData({
        termsOfService: storeInfo.termsOfService || '',
        privacyPolicy: storeInfo.privacyPolicy || '',
        shippingPolicy: storeInfo.shippingPolicy || '',
        refundPolicy: storeInfo.refundPolicy || '',
        contactInfo: {
          gst: storeInfo.contactInfo?.gst || '',
          phones: storeInfo.contactInfo?.phones?.length ? storeInfo.contactInfo.phones : [''],
          email: storeInfo.contactInfo?.email || '',
          website: storeInfo.contactInfo?.website || '',
          address: storeInfo.contactInfo?.address || ''
        }
      });
    }
  }, [storeInfo]);

  // Handle standard text changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle nested contactInfo changes
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, [name]: value }
    }));
  };

  // Handle dynamic phone numbers array
  const handlePhoneChange = (index, value) => {
    const newPhones = [...formData.contactInfo.phones];
    newPhones[index] = value;
    setFormData(prev => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, phones: newPhones }
    }));
  };

  const addPhoneField = () => {
    setFormData(prev => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, phones: [...prev.contactInfo.phones, ''] }
    }));
  };

  const removePhoneField = (index) => {
    const newPhones = formData.contactInfo.phones.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, phones: newPhones.length ? newPhones : [''] }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateStoreInfo(formData));
  };

  const rightPaneContent = (
        <div className="p-6 w-full flex flex-col overflow-y-auto custom-scrollbar bg-vercel-black h-[90vh]">

        <div className="flex justify-between items-center mb-6 border-b-1 pb-4">
            <div>
            <h1 className="txt-2xl font-bold text-vercel-white">Store Settings & Policies</h1>
            <p className="txt-sm text-gray-500">Manage legal policies and business contact details.</p>
            </div>
            {isSuccess && (
            <span className="bg-green-100 text-green-700 txt-xs font-semibold px-3 py-1.5 rounded-full">
                {message}
            </span>
            )}
            {isError && (
            <span className="bg-red-100 text-red-700 txt-xs font-semibold px-3 py-1.5 rounded-full">
                {message}
            </span>
            )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Contact Information Section */}
            <div className="bg-gray-50 p-5 rounded-xl border-1 border-gray-800 bg-vercel-black">
            <h2 className="txt-lg font-semibold text-gray-700 mb-4">Business & Contact Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label >GST Number</label>
                <input
                    type="text"
                    name="gst"
                    value={formData.contactInfo.gst}
                    onChange={handleContactChange}
                    
                    placeholder="e.g., 27AAAAA0000A1Z5"
                />
                </div>
                <div>
                <label >Support Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.contactInfo.email}
                    onChange={handleContactChange}
                    
                    placeholder="support@electrostore.com"
                />
                </div>
                <div>
                <label >Official Website</label>
                <input
                    type="text"
                    name="website"
                    value={formData.contactInfo.website}
                    onChange={handleContactChange}
                    
                    placeholder="https://electrostore.com"
                />
                </div>
                <div>
                <label >Business Address</label>
                <input
                    type="text"
                    name="address"
                    value={formData.contactInfo.address}
                    onChange={handleContactChange}
                    
                    placeholder="Store address..."
                />
                </div>
            </div>

            {/* Multiple Phones Section */}
            <div className="mt-4">
                <label >Phone Numbers</label>
                {formData.contactInfo.phones.map((phone, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                    <input
                    type="text"
                    value={phone}
                    onChange={(e) => handlePhoneChange(idx, e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    />
                    <button
                    type="button"
                    onClick={() => removePhoneField(idx)}
                    >
                    ✕
                    </button>
                </div>
                ))}
                <button
                type="button"
                onClick={addPhoneField}
                >
                + Add Another Phone Number
                </button>
            </div>
            </div>

            {/* Policies Section */}
            <div className="space-y-4">
            <h2 className="txt-lg font-semibold text-gray-700">Store Policies (HTML / Plain Text)</h2>
            
            <div>
                <label >Terms of Service</label>
                <textarea
                name="termsOfService"
                rows={4}
                value={formData.termsOfService}
                onChange={handleChange}
                placeholder="Enter terms of service..."
                />
            </div>

            <div>
                <label >Privacy Policy</label>
                <textarea
                name="privacyPolicy"
                rows={4}
                value={formData.privacyPolicy}
                onChange={handleChange}
                placeholder="Enter privacy policy..."
                />
            </div>

            <div>
                <label >Shipping Policy</label>
                <textarea
                name="shippingPolicy"
                rows={4}
                value={formData.shippingPolicy}
                onChange={handleChange}
                placeholder="Enter shipping policy..."
                />
            </div>

            <div>
                <label >Refund Policy</label>
                <textarea
                name="refundPolicy"
                rows={4}
                value={formData.refundPolicy}
                onChange={handleChange}
                placeholder="Enter refund policy..."
                />
            </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t">
            <button
                type="submit"
                disabled={isLoading}
            >
                {isLoading ? 'Saving Changes...' : 'Save Store Policies'}
            </button>
            </div>

        </form>
        </div>
  )

  const leftPaneContent = (<div>Hello</div>)

  return <div className="h-screen w-full bg-vercel-black">
    {rightPaneContent}
    </div>
}