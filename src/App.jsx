import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Lazy loading the page
const ProductsPage = lazy(() => import('./pages/ProductsPage'));

const Navbar = () => (
    <nav style={{ background: '#1e293b', padding: '15px 30px', display: 'flex', gap: '20px' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Inventory OS</Link>
        <Link to="/products" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Products</Link>
    </nav>
);

function App() {
    return (
        <Router>
            <Navbar />
            <Suspense fallback={<div style={{padding: '20px'}}>Loading Modules...</div>}>
                <Routes>
                    <Route path="/" element={<div style={{padding: '40px'}}><h1>Welcome to System Dashboard</h1></div>} />
                    <Route path="/products" element={<ProductsPage />} />
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;