import React from 'react';
import CustomList from './CustomList';
import VercelDropdown from './DropdownBox';

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


const Table = ({ tableData, tableHeadData }) => {
  return (<div>
    <h3 className='text-vercel-primary text-sm font-medium pb-2'>Product/Service List</h3>
    <div className='border-1 border-zinc-800 rounded-md bg-vercel-hover'>
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-zinc-800 text-xs font-medium text-zinc-400 bg-vercel-hover">
          {tableHeadData.map((head, idx) => (
            <th key={idx} className="px-3 py-2">{head}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-800/80">
        {tableData?.map((rowCells, rowIdx) => (
          <tr key={rowIdx} className="text-xs text-zinc-200 hover:bg-zinc-900/40 transition-colors">
            {rowCells.map((cell, cellIdx) => (
              <td 
                key={cellIdx} 
                className={`px-3 py-2.5 ${
                  cell.align === 'center' ? 'text-center' : cell.align === 'right' ? 'text-right font-mono' : 'text-left font-medium'
                } ${cell.bold ? 'font-bold text-vercel-primary' : 'text-zinc-400'}`}
              >
                <div>{cell.text}</div>
                {cell.subtext && <div className="text-[10px] text-zinc-500">{cell.subtext}</div>}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table></div></div>
  );
};

   

  return (
    <div className="flex flex-col h-fit w-full overflow-x-none">
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
        <Table tableHeadData={tableHeadData} tableData={getTableData(selectedOrder)}/>

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