import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import iconUrl from './assets/icon.png'

// Then use it in your component


// Lazy loading the page
const ProductsPage = lazy(() => import('./pages/ProductsPage'));

const Navbar = () => (
    <div className='h-18 m-0 p-0 flex bg-zinc-300 shadow-2xl justify-between items-center'>
        <img src={iconUrl} alt="Icon" className='h-12 w-12 p-0' ></img>
        <nav className='h-18 flex justify-between items-center'>
            <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Dashboard</Link>
            <Link to="/products" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Products</Link>
        </nav>
    </div>
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