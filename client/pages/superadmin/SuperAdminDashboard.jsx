import React, { useEffect, useState } from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { Building2, Users, ShieldOff, ShieldCheck, TrendingUp, Clock } from 'lucide-react';

const saFetch = (url, opts = {}) => fetch(url, {
    ...opts,
    headers: { 'Authorization': `Bearer ${localStorage.getItem('sa_token')}`, 'Content-Type': 'application/json', ...opts.headers }
});

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
        </div>
    </div>
);

const STATUS_BADGE = { active: 'bg-green-100 text-green-700', inactive: 'bg-gray-100 text-gray-600', expired: 'bg-red-100 text-red-700' };

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        saFetch('/api/superadmin/dashboard/stats')
            .then(r => r.json())
            .then(d => { if (d.success) setStats(d.stats); })
            .finally(() => setLoading(false));
    }, []);

    return (
        <SuperAdminLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-500 text-sm">Platform overview and key metrics</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Stat Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard icon={Building2}   label="Total Companies"  value={stats?.totalCompanies}  color="bg-indigo-500" />
                            <StatCard icon={ShieldCheck} label="Active Companies" value={stats?.activeCompanies} color="bg-green-500"  />
                            <StatCard icon={ShieldOff}   label="Expired"          value={stats?.expiredCompanies} color="bg-red-500"  />
                            <StatCard icon={Users}       label="Total Users"      value={stats?.totalUsers}       color="bg-blue-500" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Plan Distribution */}
                            <div className="bg-white rounded-xl shadow-sm border p-5">
                                <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-indigo-500" /> Plan Distribution
                                </h2>
                                <div className="space-y-3">
                                    {(stats?.planDistribution || []).map(p => (
                                        <div key={p.plan_name} className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">{p.plan_name}</span>
                                            <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                                                {p.count} {p.count === 1 ? 'company' : 'companies'}
                                            </span>
                                        </div>
                                    ))}
                                    {!stats?.planDistribution?.length && <p className="text-gray-400 text-sm">No data</p>}
                                </div>
                            </div>

                            {/* Recent Companies */}
                            <div className="bg-white rounded-xl shadow-sm border p-5">
                                <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-indigo-500" /> Recent Companies
                                </h2>
                                <div className="space-y-3">
                                    {(stats?.recentCompanies || []).map(c => (
                                        <div key={c.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">{c.company_name}</p>
                                                <p className="text-xs text-gray-400">{c.company_code} · {c.plan_name || 'Free'}</p>
                                            </div>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[c.status] || ''}`}>
                                                {c.status}
                                            </span>
                                        </div>
                                    ))}
                                    {!stats?.recentCompanies?.length && <p className="text-gray-400 text-sm">No companies yet</p>}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </SuperAdminLayout>
    );
}
