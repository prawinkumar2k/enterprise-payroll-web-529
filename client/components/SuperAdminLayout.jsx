import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Building2, CreditCard, LogOut, ShieldCheck, Menu
} from 'lucide-react';
import { useState } from 'react';

const NAV = [
    { to: '/superadmin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/superadmin/companies', icon: Building2,        label: 'Companies' },
    { to: '/superadmin/plans',     icon: CreditCard,       label: 'Plans'     },
];

function Sidebar({ onClose, onLogout, adminUsername }) {
    const location = useLocation();
    return (
        <aside className="flex flex-col w-64 bg-gray-900 text-white h-full min-h-screen">
            {/* Brand */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
                <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="font-bold text-sm leading-tight">Super Admin</p>
                    <p className="text-xs text-gray-400">Platform Control</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV.map(({ to, icon: Icon, label }) => {
                    const active = location.pathname === to;
                    return (
                        <Link
                            key={to}
                            to={to}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                ${active ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* User + Logout */}
            <div className="px-3 py-4 border-t border-gray-700">
                <p className="text-xs text-gray-500 px-3 mb-2 truncate">👤 {adminUsername || 'superadmin'}</p>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </aside>
    );
}

export default function SuperAdminLayout({ children }) {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('sa_token');
        localStorage.removeItem('sa_admin');
        navigate('/superadmin/login');
    };

    const adminUsername = (() => {
        try { return JSON.parse(localStorage.getItem('sa_admin') || '{}').username; } catch { return ''; }
    })();

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex flex-shrink-0">
                <Sidebar onClose={() => {}} onLogout={handleLogout} adminUsername={adminUsername} />
            </div>

            {/* Mobile Sidebar Overlay */}
            {open && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="fixed inset-0 bg-black/60" onClick={() => setOpen(false)} />
                    <div className="relative z-10">
                        <Sidebar onClose={() => setOpen(false)} onLogout={handleLogout} adminUsername={adminUsername} />
                    </div>
                </div>
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar (mobile) */}
                <header className="md:hidden flex items-center gap-4 bg-white border-b px-4 py-3">
                    <button onClick={() => setOpen(true)} className="text-gray-600">
                        <Menu className="w-5 h-5" />
                    </button>
                    <span className="font-semibold text-gray-800">Super Admin</span>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
