import React, { useState, useEffect } from 'react';
import * as api from '../services/api';

const Dashboard = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data } = await api.fetchProducts();
    setProducts(data);
  };

  // Re-use your styled table and form logic here...
  return (
    <div style={{ padding: '40px' }}>
      <h1>Inventory Dashboard</h1>
      {/* Insert your Table Component here */}
      <p>Managing {products.length} active products.</p>
    </div>
  );
};

export default Dashboard;