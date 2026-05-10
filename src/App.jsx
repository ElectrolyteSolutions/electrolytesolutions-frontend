import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import CustomerTable from './components/CustomerTable';
import RegistrationModal from './components/RegistrationModal';
import BillingPage from './components/BillingPage';
import { Users, Zap, Plus } from 'lucide-react';

function App() {
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  const addCustomer = (newCustomer) => {
    setCustomers([...customers, { ...newCustomer, id: Date.now(), status: 'in progress' }]);
    setIsModalOpen(false);
  };

  const removeCustomer = (id) => {
    if(window.confirm("Are you sure you want to remove this record?")) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white border-b px-8 py-0 flex justify-between items-center sticky top-0 z-40 h-16">
        <div className="flex items-center gap-8 h-full">
          <div className="flex items-center gap-2 text-brand-dark font-bold text-xl pr-4 border-r">
            <Zap className="fill-brand-primary text-brand-primary" size={24} />
            <span>Electrolyte Solutions</span>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex h-full gap-1">
            <Link 
              to="/" 
              className={`flex items-center gap-2 px-4 h-full border-b-2 transition-all font-medium ${
                location.pathname === '/' 
                ? 'border-brand-primary text-brand-primary bg-blue-50/50' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users size={18} />
              Customers
            </Link>
          </div>
        </div>

        {location.pathname === '/' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-primary hover:bg-brand-dark text-black px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <Plus size={18} /> New Customer
          </button>
        )}
      </nav>

      {/* Page Content */}
      <main className="p-8 flex-1">
        <Routes>
          <Route path="/" element={
            <CustomerTable 
              customers={customers} 
              setCustomers={setCustomers} 
              onRemove={removeCustomer}
            />
          } />
          <Route path="/billing/:id" element={
            <BillingPage customers={customers} />
          } />
        </Routes>
      </main>

      {/* Registration Modal */}
      {isModalOpen && (
        <RegistrationModal 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={addCustomer} 
        />
      )}
    </div>
  );
}

export default App;