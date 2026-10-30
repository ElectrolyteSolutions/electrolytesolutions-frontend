import React from 'react';
import CustomList from './list';
import VercelDropdown from './dropdown';
import MiniTable from './table.small';

const OrderDetails = ({ selectedOrder, handleStatusChange }) => {
  if (!selectedOrder) return null;

  const customerName = selectedOrder.customer?.firstName && selectedOrder.customer?.lastName 
    ? `${selectedOrder.customer.firstName} ${selectedOrder.customer.lastName}` 
    : (selectedOrder.customer?.name || 'Guest Customer');

const tableHeadData = ["Item Name", "Qty", "Rate", "Total"];

  const getTableData = (selectedOrder) => {
  if (!selectedOrder?.items) return [];
  
  return selectedOrder.items.map((item) => {
    const title = item?.productId?.name || 'Product Item';
    const brand = item?.productId?.brand ? `Brand: ${item.productId.brand}` : '';
    const qty = item?.quantity || 1;
    const rate = `₹${item?.price || 0}`;
    const total = `₹${(item?.quantity || 1) * (item?.price || 0)}`;

    // Return as an array of cell values
    return [
      { text: title, subtext: brand, align: 'left' },
      { text: qty, align: 'center' },
      { text: rate, align: 'right' },
      { text: total, align: 'right', bold: true }
    ];
  });
}

  return (
    <div className="flex flex-col h-full w-full overflow-x-none">
      {/* Header */}
      <div className="pb-3 border-b border-zinc-800 flex justify-between items-center">
        <div>
          <h3 className="text-base text-sm font-bold text-vercel-primary">
            Order #{selectedOrder.orderNumber || selectedOrder._id?.slice(-8)}
          </h3>
          <p className="text-[11px] text-zinc-400">
            Placed on {new Date(selectedOrder.createdAt || Date.now()).toLocaleString()}
          </p>
        </div>
        <VercelDropdown 
          value={selectedOrder?.fulfillmentStatus || 'Unfulfilled'} 
          onSelect={(newValue) => handleStatusChange(selectedOrder._id,newValue.label)} 
          rightOptions={[
            { label: 'Unfulfilled', value: 'Unfulfilled' },
            { label: 'Processing', value: 'Processing' },
            { label: 'Dispatched', value: 'Dispatched' },
            { label: 'Delivered', value: 'Delivered' },
            { label: 'Cancelled', value: 'Cancelled' }
          ]} 
          placeholder="Filter Status"
        />
      </div>

      <div className="p-6 space-y-6 max-h-[750px] overflow-y-auto custom-scrollbar border-1 border-zinc-800 rounded-md bg-vercel-surface mt-4">
        
        {/* ================= PRODUCTS / SERVICES TABLE ================= */}
        <MiniTable tableHeadData={tableHeadData} tableData={getTableData(selectedOrder)}/>

        {/* ================= CUSTOMER INFO ================= */}
        <CustomList 
          title="Overview"
          items={[
            {key:"Payment Status:", value: selectedOrder.financialStatus || selectedOrder.paymentInfo?.status || 'Not Paid' },
            {key:"Fulfillment Status:", value: selectedOrder.fulfillmentStatus || 'Unfulfilled'},
          ]}
        />

        <CustomList 
          title="Customer Info"
          items={[
            {key:"Name:", value: customerName || '' },
            {key:"Email:", value: selectedOrder.customer?.email || 'N/A'},
            {key:"Phone:", value: selectedOrder.customer?.phone || 'N/A'},
            {key:"Customer Type:", value: selectedOrder.customer?.customerType || 'Individual'}
          ]}
        />

        <CustomList 
          title="Shipping Address"
          items={[
            {key:"Address Line #1", value: selectedOrder.shippingAddress?.address1 || '-' },
            {key:"Address Line #2", value: selectedOrder.shippingAddress?.address2|| '-'},
            {key:"City", value: selectedOrder.shippingAddress?.city || '-'},
            {key:"State", value: selectedOrder.shippingAddress?.province || '-'},
            {key:"PIN Code", value: selectedOrder.shippingAddress?.zip || '-'},
            {key:"Country", value: selectedOrder.shippingAddress?.country || '-'}
          ]}
        />

        <CustomList 
          title="Transaction & Payment Info"
          items={[
            {key:"Gateway", value: "Razorpay" },
            {key:"Order ID", value: selectedOrder?.paymentInfo?.razorpayOrderId || '-'},
            {key:"Payment ID", value: selectedOrder?.paymentInfo?.razorpayPaymentId || '-'},
            {key:"Total Amount", value: `₹${selectedOrder?.totalAmount || 0}`},
          ]}
        />   
      </div>
    </div>
  );
};

export default OrderDetails;