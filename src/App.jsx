import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom';
import Navbar from './components/navbar';
import Footer from './components/footer';
import InvoiceTemplate from './components/InvoiceTemplate';
import ReturnsPage from './pages/Returns';
const DashboardPage = lazy(()=> import("./pages/Dashboard"))
const BillingPage =lazy(()=> import('./pages/Billing'));
const DevicesPage = lazy(() => import('./pages/Devices'));
const CustomersPage = lazy(() => import('./pages/Customers'));
const ProductsPage = lazy(() => import('./pages/Products'));

function App() {
    return (
        <BrowserRouter basename="/erp/console">
        <Router>
            {/* 1. The wrapper ensures the footer is pushed to the bottom */}
            <div className="flex flex-col min-h-screen bg-zinc-950">
                
                <Navbar />

                {/* 2. flex-grow makes this section take up all available middle space */}
                <main className="flex-grow">
                    <Suspense 
                        fallback={
                            <div className="flex items-center justify-center h-64 text-zinc-400">
                                <div className="animate-pulse">Loading Modules...</div>
                            </div>
                        }
                    >
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                            <Routes>
                                <Route 
                                    path="/" 
                                    element={
                                        <DashboardPage/>
                                    } 
                                />
                                <Route path="/products" element={<ProductsPage />} />
                                <Route path="/customers" element={<CustomersPage />} />
                                <Route path="/devices" element={<DevicesPage />} />
                                <Route path="/billing" element={<BillingPage />} />
                                <Route path="/invoice" element={<InvoiceTemplate />} />
                                <Route path="/returns" element={<ReturnsPage />} />
                            </Routes>
                        </div>
                    </Suspense>
                </main>

                <Footer />
            </div>
        </Router>
        </BrowserRouter>
    );
}

export default App;