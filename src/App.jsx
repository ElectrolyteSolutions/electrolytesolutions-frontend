import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import POS from './pages/POS';

function App() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 ml-64 p-8"> {/* ml-64 for sidebar space */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/pos" element={<POS />} />
        </Routes>
      </div>
    </div>
  );
}
export default App