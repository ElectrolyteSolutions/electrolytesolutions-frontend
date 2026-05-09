// Customer Object Structure
{
  id: string,
  name: string,
  address: string,
  phone: string,
  serviceType: 'repairing' | 'purchase',
  status: 'in progress' | 'resolved' | 'rejected',
  // Conditional fields for repairing
  deviceDetails: {
    name: string,
    id: string,
    type: string,
    hardwareId: string
  },
  billItems: [
    { name: string, price: number, qty: number, total: number }
  ]
}