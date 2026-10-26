import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getOrders, updateOrderStatus } from '../features/orderSlice';
import ResizablePanes from '../components/TwoPaneLayout';
import Header from '../components/SearchHeader';
import SkeletonLoader from '../components/SkeletonLoaderTable';
import Badge from '../components/Badge';
import GlobalTable from '../components/GlobalTable';
import OrderDetails from '../components/OrderDetails';

const statusOptions = [
  { label: 'All Orders', value: 'all' },
  { label: 'Paid', value: 'Paid' },
  { label: 'Pending / COD', value: 'Pending' },
  { label: 'Fulfilled', value: 'Fulfilled' },
  { label: 'Unfulfilled', value: 'Unfulfilled' }
];

const ordersTableHead = [
  { label: '#Orders', value: 'orders',class:"w-20 max-w-20 min-w-20" },
  { label: 'Customer', value: 'Paid',class:"w-32 max-w-32 min-w-32" },
  { label: 'Date', value: 'date',class:"w-18 max-w-18 min-w-18" },
  { label: 'Financial', value: 'financial',class:"w-18 max-w-18 min-w-18" },
  { label: 'Fulfillment', value: 'fulfillment',class:"w-20 max-w-20 min-w-20" },
  { label: 'Amount', value: 'amount',class:"w-18 max-w-18 min-w-18" }
];

function ordersTableData (order) {
  return [
    { label: '#Orders', value: `#${String(order.orderNumber || order._id)?.slice(-8)}` ,class:"rounded-l-md font-medium w-20 max-w-20 min-w-20" },
    { label: 'Customer', value: order.customer?.name || `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Guest Customer',class: "w-32 max-w-32 min-w-32 font-medium max-w-[180px]" },
    { label: 'Date', value: new Date(order.createdAt || Date.now()).toLocaleDateString() ,class:"w-18 max-w-18 min-w-18" },
    { label: 'Financial', value: <Badge type={order?.financialStatus?.toLowerCase() === "paid" ? "dark":"light"} title={order?.financialStatus || 'Paid'}/> ,class:"w-18 max-w-18 min-w-18"},
    { label: 'Fulfillment', value: order?.fulfillmentStatus || 'Unfulfilled',class:"w-20 max-w-20 min-w-20 text-[10px] uppercase font-bold text-zinc-400" },
    { label: 'Amount', value: `Rs ${order?.totalAmount || order?.totalPrice || 0}` ,class:"w-18 max-w-18 min-w-18 font-medium text-white rounded-r-md" },
  ];
}
 
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
      // if (!selectedOrder || !isStillPresent) {
      //   setSelectedOrder(filteredOrders[0]);
      // }
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
            placeholder="Search by order number, customer name, or payment ID..."
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            statusFilter={statusFilter} 
            setStatusFilter={setStatusFilter}
            statusOptions={statusOptions} 
          />
          <GlobalTable
            title='Orders' 
            tableHead={ordersTableHead}
            filteredList={filteredOrders} 
            status={status} 
            selectedItem={selectedOrder} 
            setSelectedItem={setSelectedOrder} 
            tableData={ordersTableData}
          />
        </div>
      } 
      rightPane={selectedOrder && 
        <OrderDetails
          selectedOrder={selectedOrder} 
          handleStatusChange={handleStatusChange} 
        />
      } 
    />
  );
};

export default OrdersPage;