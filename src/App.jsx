import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Navbar from './components/navbar';
import Footer from './components/footer';
import InvoiceTemplate from './components/InvoiceTemplate';
import { logout } from './features/authSlice';

// Lazy loaded pages
const AuthLandingPage = lazy(() => import('./auth/landing'));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const BillingPage = lazy(() => import('./pages/Billing'));
const DevicesPage = lazy(() => import('./pages/Devices'));
const CustomersPage = lazy(() => import('./pages/Customers'));
const ProductsPage = lazy(() => import('./pages/Products'));
const ReturnsPage = lazy(() => import('./pages/Returns'));
const ProfilePage = lazy(() => import('./pages/Profile'));

// (Optional) Dummy component for the new Profile route so it doesn't crash before you build it!

// ⚡ SECURITY WRAPPER: Enforces login AND Role permissions
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { token, user } = useSelector(state => state.auth);
    const role= user?.role
    const dispatch =useDispatch()

    // 1. Not logged in? Kick to login screen.
    if (!token || !role) {
        dispatch(logout())
        return <Navigate to="/" replace />; 
    }

    
    // 2. Logged in, but wrong role? Kick to their safest default page.
    if (allowedRoles && !allowedRoles.includes(role)) {
        if (role === 'admin') return <Navigate to="/dashboard" replace />;
        if (role === 'store') return <Navigate to="/billing" replace />;
        return <Navigate to="/products" replace />; // Default for customers
    }
    
    return children;
};

// LAYOUT WRAPPER: Hides the Navbar and Footer on the Login screen
const AppLayout = ({ children }) => {
    const location = useLocation();
    const isAuthPage = location.pathname === '/';

    return (
        <div className="flex flex-col min-h-screen bg-zinc-950">
            {!isAuthPage && <Navbar />}
            <main className={`flex-grow ${!isAuthPage ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full' : 'w-full'}`}>
                {children}
            </main>
            {!isAuthPage && <Footer />}
        </div>
    );
};

function App() {
    // We grab the user here so we can auto-redirect them away from the login screen if they are already signed in.
    const { token, user } = useSelector(state => state.auth);

    return (
        <BrowserRouter>
            <AppLayout>
                <Suspense 
                    fallback={
                        <div className="flex items-center justify-center h-[80vh] text-zinc-400">
                            <div className="animate-pulse font-bold tracking-wider">Loading System Modules...</div>
                        </div>
                    }
                >
                    <Routes>
                        {/* 🔓 PUBLIC ROUTE / AUTO-REDIRECT */}
                        {/* If they have a token, automatically send them to their dashboard so they don't see the login page again */}
                        <Route 
                            path="/" 
                            element={
                                token ? (
                                    <Navigate to={user?.role === 'admin' ? '/dashboard' : user?.role === 'store' ? '/billing' : '/products'} replace />
                                ) : (
                                    <AuthLandingPage />
                                )
                            } 
                        />

                        {/* 🔒 PROTECTED ERP ROUTES */}
                        
                        {/* ADMIN ONLY Routes */}
                        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><DashboardPage /></ProtectedRoute>} />
                        <Route path="/customers" element={<ProtectedRoute allowedRoles={['admin','store']}><CustomersPage /></ProtectedRoute>} />

                        {/* ADMIN & STORE Routes */}
                        <Route path="/devices" element={<ProtectedRoute allowedRoles={['admin', 'store']}><DevicesPage /></ProtectedRoute>} />
                        <Route path="/billing" element={<ProtectedRoute allowedRoles={['admin', 'store']}><BillingPage /></ProtectedRoute>} />
                        <Route path="/returns" element={<ProtectedRoute allowedRoles={['admin', 'store']}><ReturnsPage /></ProtectedRoute>} />
                        <Route path="/invoice" element={<ProtectedRoute allowedRoles={['admin', 'store']}><InvoiceTemplate /></ProtectedRoute>} />

                        {/* EVERYONE Routes (Admin, Store, Customer) */}
                        <Route path="/products" element={<ProtectedRoute allowedRoles={['admin', 'store', 'customer']}><ProductsPage /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute allowedRoles={['admin', 'store', 'customer']}><ProfilePage /></ProtectedRoute>} />

                        {/* Fallback Catch-all: Route unknown URLs back to home */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </AppLayout>
        </BrowserRouter>
    );
}

export default App;