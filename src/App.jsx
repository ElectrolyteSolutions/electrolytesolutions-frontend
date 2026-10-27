import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Navbar from './components/navbar';
import InvoiceTemplate from './components/InvoiceTemplate';
import { getUserProfile, logout } from './features/authSlice';
import PublicBillView from './pages/PublicBillView';
import OrdersPage from './pages/Orders';

// Lazy loaded pages
const AuthLandingPage = lazy(() => import('./auth/landing'));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const BillingPage = lazy(() => import('./pages/Billing'));
const DevicesPage = lazy(() => import('./pages/Devices'));
const CustomersPage = lazy(() => import('./pages/Customers'));
const ProductsPage = lazy(() => import('./pages/Products'));
const ReturnsPage = lazy(() => import('./pages/Returns'));
const ProfilePage = lazy(() => import('./pages/Profile'));

// ⚡ SECURITY WRAPPER: Enforces login AND Role permissions
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { role } = useSelector(state => state?.auth);
    const dispatch = useDispatch();
 
    if (!role) {
        dispatch(logout());
        return <Navigate to="/" replace />; 
    }

    if (allowedRoles && !allowedRoles?.includes(role)) {
        if (role === 'admin') return <Navigate to="/dashboard" replace />;
        if (role === 'store') return <Navigate to="/billing" replace />;
        return <Navigate to="/products" replace />;
    }
    
    return children;
};

// LAYOUT WRAPPER: Adjusts margins for sidebar vs auth screen
const AppLayout = ({ children }) => {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const curLoc = location.pathname.split('/')[1] || 'Dashboard';
    const isAuthPage = location.pathname === '/' || curLoc === 'bills';

    return (
        <div className="flex min-h-screen bg-vercel-black text-white">
            {/* Vercel-style Sidebar (Hidden on auth/public bill views) */}
            {!isAuthPage && <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />}

            {/* Main Content Area: Automatically adjusts left padding based on whether the sidebar is collapsed or expanded */}
            <div className={`flex flex-col flex-grow min-h-screen transition-all duration-300 ${
                !isAuthPage 
                    ? (isCollapsed ? 'lg:pl-20 pt-16 lg:pt-0' : 'lg:pl-64 pt-16 lg:pt-0') 
                    : 'w-full'
            }`}>
                <main className={`flex flex-col flex-grow h-screen overflow-hidden ${!isAuthPage ? 'w-full' : 'w-full'}`}>
                    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full border-b border-zinc-800 px-6 py-4 overflow-hidden shrink-0 bg-vercel-black">
                        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight capitalize">{curLoc}</h1>
                    </header>
                    
                    {/* Only scrollable section */}
                    <div className='flex-grow p-6 overflow-none h-[calc(100vh-120px)] custom-scrollbar bg-vercel-black '>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

function App() {
    const { token, role } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getUserProfile());
    }, [dispatch]);

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
                        <Route path="/bills/:token" element={<PublicBillView />} />

                        <Route 
                            path="/" 
                            element={
                                token ? (
                                    <Navigate to={role === 'admin' ? '/dashboard' : role === 'store' ? '/billing' : '/products'} replace />
                                ) : (
                                    <AuthLandingPage />
                                )
                            } 
                        />

                        {/* ADMIN ONLY Routes */}
                        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><DashboardPage /></ProtectedRoute>} />
                        <Route path="/customers" element={<ProtectedRoute allowedRoles={['admin','store']}><CustomersPage /></ProtectedRoute>} />

                        {/* ADMIN & STORE Routes */}
                        <Route path="/devices" element={<ProtectedRoute allowedRoles={['admin', 'store']}><DevicesPage /></ProtectedRoute>} />
                        <Route path="/billing" element={<ProtectedRoute allowedRoles={['admin', 'store']}><BillingPage /></ProtectedRoute>} />
                        <Route path="/returns" element={<ProtectedRoute allowedRoles={['admin', 'store']}><ReturnsPage /></ProtectedRoute>} />
                        <Route path="/invoice" element={<ProtectedRoute allowedRoles={['admin', 'store']}><InvoiceTemplate /></ProtectedRoute>} />

                        {/* EVERYONE Routes */}
                        <Route path="/products" element={<ProtectedRoute allowedRoles={['admin', 'store', 'customer']}><ProductsPage /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute allowedRoles={['admin', 'store', 'customer']}><ProfilePage /></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute allowedRoles={['admin', 'store', 'customer']}><OrdersPage /></ProtectedRoute>} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </AppLayout>
        </BrowserRouter>
    );
}

export default App;