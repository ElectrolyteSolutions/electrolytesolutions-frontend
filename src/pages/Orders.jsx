import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getOrders, updateOrderStatus, deleteOrder } from '../features/orderSlice'; // Adjust import paths to match your project

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { items:orders, status } = useSelector((state) => state.order);

  // Modal / Detail states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Search and Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Paid' | 'Pending' | 'Completed'

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  // Handle status updates directly from table
  const handleStatusChange = (orderId, newFulfillmentStatus) => {
    dispatch(updateOrderStatus({ id: orderId, data: { fulfillmentStatus: newFulfillmentStatus } }));
  };

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders.filter((order) => {
      const term = searchTerm.toLowerCase();
      const orderNum = String(order.orderNumber || order._id || '').toLowerCase();
      const customerName = (order.customer?.name || `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`).toLowerCase();
      const paymentId = String(order.paymentInfo?.razorpayPaymentId || '').toLowerCase();

      const matchesSearch = orderNum.includes(term) || customerName.includes(term) || paymentId.includes(term);
      const matchesStatus = statusFilter === 'all' || order.financialStatus?.toLowerCase() === statusFilter.toLowerCase() || order.fulfillmentStatus?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [orders, searchTerm, statusFilter]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto w-full">
      
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Orders Management</h1>
          <p className="text-xs text-zinc-400 mt-1">Monitor transactions, update fulfillment status, and inspect orders.</p>
        </div>
      </header>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-zinc-900 p-4 rounded-xl shadow-md border border-zinc-800">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by order number, customer name, or payment ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 text-zinc-100 placeholder-zinc-500 px-4 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:border-emerald-500 text-xs sm:text-sm transition-all"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 text-zinc-200 text-xs sm:text-sm px-3 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Orders</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending / COD</option>
            <option value="Fulfilled">Fulfilled</option>
            <option value="Unfulfilled">Unfulfilled</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-xl w-full border border-zinc-800">
        <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-zinc-800">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-zinc-800/50 border-b border-zinc-800">
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Order ID</th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Customer</th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Amount</th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Payment</th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Fulfillment</th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {status === 'loading' ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-zinc-500 italic">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
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

                  return (
                    <tr key={order._id} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-mono font-bold text-zinc-200">
                        #{String(orderNum).slice(-8)}
                        <div className="text-[10px] text-zinc-500 font-normal">{new Date(order.createdAt || Date.now()).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm text-zinc-100">
                        <div className="font-semibold">{customerName}</div>
                        <div className="text-[11px] text-zinc-400">{order.customer?.email || order.shippingAddress?.city}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold text-emerald-400 font-mono">
                        ₹{order.totalAmount || order.totalPrice || 0}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                          (order.financialStatus || '').toLowerCase() === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {order.financialStatus || 'Paid'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm">
                        <select
                          value={order.fulfillmentStatus || 'Unfulfilled'}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="bg-zinc-950 text-zinc-300 text-xs px-2 py-1.5 rounded border border-zinc-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="Unfulfilled">Unfulfilled</option>
                          <option value="Processing">Processing</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-medium">
                        <button
                          onClick={() => { setSelectedOrder(order); setIsDetailModalOpen(true); }}
                          className="text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 px-3 py-1.5 rounded text-xs font-semibold"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= ORDER DETAILS MODAL ================= */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col border border-zinc-800">
            
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/30 shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">Order Details #{selectedOrder.orderNumber || selectedOrder._id}</h3>
                <p className="text-xs text-zinc-400">Placed on {new Date(selectedOrder.createdAt || Date.now()).toLocaleString()}</p>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-zinc-500 hover:text-white text-2xl leading-none">&times;</button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-thin">
              
              {/* Status overview */}
              <div className="grid grid-cols-2 gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <div>
                  <span className="text-[11px] font-bold text-zinc-500 uppercase">Payment Status</span>
                  <div className="text-sm font-extrabold text-emerald-400 mt-0.5">{selectedOrder.financialStatus || 'Paid'}</div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-zinc-500 uppercase">Fulfillment Status</span>
                  <div className="text-sm font-extrabold text-amber-400 mt-0.5">{selectedOrder.fulfillmentStatus || 'Unfulfilled'}</div>
                </div>
              </div>

              {/* Items Ordered */}
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Items Purchased</h4>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                      <div>
                        <div className="text-xs font-bold text-zinc-100">{item.productId?.name || 'Product Item'}</div>
                        <div className="text-[11px] text-zinc-400">Qty: {item.quantity} × ₹{item.price}</div>
                      </div>
                      <div className="text-xs font-bold text-zinc-200 font-mono">₹{item.quantity * item.price}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Shipping Address</h4>
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs text-zinc-300 space-y-1">
                  <div className="font-bold text-zinc-100">{selectedOrder.shippingAddress?.address1}</div>
                  {selectedOrder.shippingAddress?.address2 && <div>{selectedOrder.shippingAddress?.address2}</div>}
                  <div>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.province} - {selectedOrder.shippingAddress?.zip}</div>
                  <div>{selectedOrder.shippingAddress?.country || 'India'}</div>
                </div>
              </div>

              {/* Payment info */}
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
                      <span className="font-mono">{selectedOrder.paymentInfo.razorpayPaymentId}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-zinc-800 font-bold text-white text-sm">
                    <span>Total Amount:</span>
                    <span className="text-emerald-400 font-mono">₹{selectedOrder.totalAmount || selectedOrder.totalPrice || 0}</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-800/30 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2 rounded-lg text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default OrdersPage;