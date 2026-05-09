import React, { useState } from 'react';
import CustomerTable from './components/CustomerTable';
import RegistrationModal from './components/RegistrationModal';
import BillingPage from './components/BillingPage'; // Import the new billing page
import { Plus, Zap } from 'lucide-react';

function App() {
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'billing'
  const [activeCustomer, setActiveCustomer] = useState(null);

  // Function to register a new customer
  const addCustomer = (newCustomer) => {
    const customerWithId = { 
      ...newCustomer, 
      id: Date.now(), 
      status: 'in progress' 
    };
    setCustomers([...customers, customerWithId]);
    setIsModalOpen(false);
  };

  // Switch to billing view for a specific customer
  const handleCreateBill = (customer) => {
    setActiveCustomer(customer);
    setView('billing');
  };

  // Return to dashboard
  const handleBackToDashboard = () => {
    setView('dashboard');
    setActiveCustomer(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar - Only show "Register" button when on dashboard */}
      <nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-40">
        <div 
          className="flex items-center gap-2 text-brand-dark font-bold text-xl cursor-pointer"
          onClick={handleBackToDashboard}
        >
          <Zap className="fill-brand-primary text-brand-primary" />
          <span>Electrolyte Solutions</span>
        </div>
        
        {view === 'dashboard' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-primary hover:bg-brand-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={20} /> Register Customer
          </button>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="p-8">
        {view === 'dashboard' ? (
          <CustomerTable 
            customers={customers} 
            setCustomers={setCustomers} 
            handleCreateBill={handleCreateBill} 
          />
        ) : (
          <BillingPage 
            customer={activeCustomer} 
            onBack={handleBackToDashboard} 
          />
        )}
      </main>

      {/* Modals */}
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