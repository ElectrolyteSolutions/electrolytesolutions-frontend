import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import Footer from './components/footer';

const ProductsPage = lazy(() => import('./pages/ProductsPage'));

function App() {
    return (
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
                                        <div className="py-10">
                                            <h1 className="text-3xl font-bold text-white">
                                                Welcome to System Dashboard
                                            </h1>
                                            <p className="mt-4 text-zinc-400">
                                                Select a module from the navigation to get started.
                                            </p>
                                        </div>
                                    } 
                                />
                                <Route path="/products" element={<ProductsPage />} />
                            </Routes>
                        </div>
                    </Suspense>
                </main>

                <Footer />
            </div>
        </Router>
    );
}

export default App;