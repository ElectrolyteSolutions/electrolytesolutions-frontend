import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getOrders, updateOrderStatus } from '../features/orderSlice';
import ResizablePanes from '../components/TwoPaneLayout';
import Header from '../components/SearchHeader';

const statusOptions = [
  { label: 'All Orders', value: 'all' },
  { label: 'Paid', value: 'Paid' },
  { label: 'Pending / COD', value: 'Pending' },
  { label: 'Fulfilled', value: 'Fulfilled' },
  { label: 'Unfulfilled', value: 'Unfulfilled' }
];


const OrdersList = ({ filteredOrders, status, selectedOrder, setSelectedOrder }) => {
  return (
    <div className="w-full bg-transparent ">
      <div className="py-3 text-sm font-semibold text-vercel-primary flex justify-between items-center">
        <span>Orders List </span>
        {/* <span>Total - {filteredOrders.length}</span> */}
      </div>

        <div className="bg-vercel-card rounded-md overflow-hidden shadow-xl border-1 border-zinc-800 w-full">
          <div className="overflow-x-auto w-full custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className=''>
                <tr className="border-b border-zinc-800 text-sm font-semibold text-vercel-secondary text-left">
                  <th className="px-3 py-2">#Order</th>
                  <th className="px-2 py-2">Customer</th>
                  <th className="px-2 py-2">Date</th>
                  <th className="px-2 py-2">Financial</th>
                  <th className="px-2 py-2">Fulfillment</th>
                  <th className="px-2 py-2 ">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {status === 'loading' ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-zinc-500 italic">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Loading orders database...
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-zinc-500 text-sm italic">
                      No orders found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const customerName = order.customer?.name || `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Guest Customer';
                    const orderNum = order.orderNumber || order._id;
                    const isSelected = selectedOrder?._id === order._id;

                    return (
                      <tr
                        key={order._id}
                        onClick={() => setSelectedOrder(order)}
                        className={`transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-vercel-selected text-vercel-primary' 
                            : 'hover:bg-vercel-hover text-vercel-secondary'
                        }`}
                      >
                        <td className="px-3 py-2 font-medium text-xs rounded-l-md">
                          #{String(orderNum).slice(-8)}
                        </td>
                        <td className="p-2 text-xs font-medium max-w-[180px]">
                          {customerName}
                        </td>
                        <td className="p-2 text-xs">
                          {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                        </td>
                        <td className="p-2 text-xs">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            (order.financialStatus || '').toLowerCase() === 'paid'
                              ? 'bg-yellow-500 text-vercel-black '
                              : 'bg-vercel-blue text-vercel-primary'
                          }`}>
                            {order.financialStatus || 'Paid'}
                          </span>
                        </td>
                        <td className="p-2 text-[10px] uppercase font-bold text-zinc-400">
                          {order.fulfillmentStatus || 'Unfulfilled'}
                        </td>
                        <td className="px-2 py-2 text-xs font-medium text-white rounded-r-md">
                          ₹{order.totalAmount || order.totalPrice || 0}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
};

// 3. Move OrderDetails OUTSIDE
const OrderDetails = ({ selectedOrder, handleStatusChange }) => {
  return (
    <div className="bg-vercel-black rounded-xl overflow-hidden shadow-xl border border-zinc-800 h-full">
      {selectedOrder ? (
        <div className="flex flex-col h-full">
          <div className="px-6 py-4 border-b border-zinc-800 bg-vercel-secondary/60 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white">
                Order #{selectedOrder.orderNumber || selectedOrder._id?.slice(-8)}
              </h3>
              <p className="text-[11px] text-zinc-400">
                Placed on {new Date(selectedOrder.createdAt || Date.now()).toLocaleString()}
              </p>
            </div>
            <span className="font-mono font-bold text-xs text-white bg-vercel-secondary px-2.5 py-1 rounded-md border border-zinc-700">
              ₹{selectedOrder.totalAmount || selectedOrder.totalPrice || 0}
            </span>
          </div>

          <div className="p-6 space-y-6 max-h-[750px] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-2 gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <div>
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Payment Status</span>
                <div className="text-sm font-extrabold text-zinc-200 mt-0.5">
                  {selectedOrder.financialStatus || 'Paid'}
                </div>
              </div>
              <div>
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Fulfillment</span>
                <div className="mt-1">
                  <select
                    value={selectedOrder.fulfillmentStatus || 'Unfulfilled'}
                    onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                    className="bg-vercel-black text-zinc-200 font-medium text-xs px-2 py-1.5 rounded-lg border border-zinc-800 focus:outline-none focus:border-white cursor-pointer w-full"
                  >
                    <option value="Unfulfilled">Unfulfilled</option>
                    <option value="Processing">Processing</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Items Purchased</h4>
              <div className="space-y-2">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <div>
                      <div className="text-xs font-bold text-zinc-100">{item.productId?.name || 'Product Item'}</div>
                      <div className="text-[11px] text-zinc-400">Qty: {item.quantity} × ₹{item.price}</div>
                    </div>
                    <div className="text-xs font-bold text-zinc-200 font-mono">
                      ₹{(item.quantity || 1) * (item.price || 0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Shipping Address</h4>
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs text-zinc-300 space-y-1">
                <div className="font-bold text-zinc-100">{selectedOrder.shippingAddress?.address1}</div>
                {selectedOrder.shippingAddress?.address2 && <div>{selectedOrder.shippingAddress?.address2}</div>}
                <div>
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.province} {selectedOrder.shippingAddress?.zip}
                </div>
                <div>{selectedOrder.shippingAddress?.country || 'India'}</div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Transaction Info</h4>
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs text-zinc-300 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Gateway:</span>
                  <span className="font-bold">Razorpay</span>
                </div>
                {selectedOrder.paymentInfo?.razorpayPaymentId && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Payment ID:</span>
                    <span className="font-mono text-zinc-200">{selectedOrder.paymentInfo.razorpayPaymentId}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-zinc-800 font-bold text-white text-sm">
                  <span>Total Amount:</span>
                  <span className="text-white font-mono">₹{selectedOrder.totalAmount || selectedOrder.totalPrice || 0}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="p-16 text-center text-zinc-500 flex flex-col items-center justify-center h-[400px]">
          <p className="text-sm">Select an order from the list to view full inspection details.</p>
        </div>
      )}
    </div>
  );
};

// Main Component
const OrdersPage = () => {
  const dispatch = useDispatch();
  const { items: orders, status } = useSelector((state) => state.order);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(statusOptions[0]);

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders.filter((order) => {
      const term = searchTerm.toLowerCase();
      const orderNum = String(order.orderNumber || order._id || '').toLowerCase();
      const customerName = (order.customer?.name || `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`).toLowerCase();
      const paymentId = String(order.paymentInfo?.razorpayPaymentId || '').toLowerCase();

      const matchesSearch = orderNum.includes(term) || customerName.includes(term) || paymentId.includes(term);
      const matchesStatus = statusFilter.value === 'all' || 
        order.financialStatus?.toLowerCase() === statusFilter.value.toLowerCase() || 
        order.fulfillmentStatus?.toLowerCase() === statusFilter.value.toLowerCase();

      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [orders, searchTerm, statusFilter]);

  useEffect(() => {
    if (filteredOrders.length > 0) {
      const isStillPresent = filteredOrders.some(o => o._id === selectedOrder?._id);
      if (!selectedOrder || !isStillPresent) {
        setSelectedOrder(filteredOrders[0]);
      }
    } else {
      setSelectedOrder(null);
    }
  }, [filteredOrders]);

  const handleStatusChange = (orderId, newFulfillmentStatus) => {
    dispatch(updateOrderStatus({ id: orderId, data: { fulfillmentStatus: newFulfillmentStatus } }));
    if (selectedOrder && selectedOrder._id === orderId) {
      setSelectedOrder(prev => ({ ...prev, fulfillmentStatus: newFulfillmentStatus }));
    }
  };

  return (
    <ResizablePanes 
      leftPane={
        <div className="space-y-4 w-full h-full flex flex-col">
          <Header 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            statusFilter={statusFilter} 
            setStatusFilter={setStatusFilter}
            statusOptions={statusOptions} 
          />
          <OrdersList 
            filteredOrders={filteredOrders} 
            status={status} 
            selectedOrder={selectedOrder} 
            setSelectedOrder={setSelectedOrder} 
          />
        </div>
      } 
      rightPane={
        <OrderDetails 
          selectedOrder={selectedOrder} 
          handleStatusChange={handleStatusChange} 
        />
      } 
    />
  );
};

export default OrdersPage;