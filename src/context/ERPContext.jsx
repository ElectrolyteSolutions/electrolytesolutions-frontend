import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const ERPContext = createContext();

export const ERPProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const refreshData = async () => {
    try {
      const prodRes = await axios.get('http://localhost:5000/api/products');
      const custRes = await axios.get('http://localhost:5000/api/customers');
      const alertRes = await axios.get('http://localhost:5000/api/inventory/alerts');
      
      setProducts(prodRes.data);
      setCustomers(custRes.data);
      setAlerts(alertRes.data);
    } catch (err) {
      console.error("ERP Data Sync Failed:", err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <ERPContext.Provider value={{ products, customers, alerts, refreshData }}>
      {children}
    </ERPContext.Provider>
  );
};