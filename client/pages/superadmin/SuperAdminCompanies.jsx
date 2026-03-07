import React, { useEffect, useState } from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { Plus, Trash2, ToggleLeft, ToggleRight, Key, X } from 'lucide-react';

const saFetch = (url, opts = {}) => fetch(url, {
    ...opts,
    headers: { 'Authorization': `Bearer ${localStorage.getItem('sa_token')}`, 'Content-Type': 'application/json', ...opts.headers }
});

const STATUS_BADGE = {
    active:   'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-600',
    expired:  'bg-red-100 text-red-700',
};

const empty = { company_code: '', company_name: '', plan_id: 1, expiry_days: 365, admin_user_id: '', admin_username: '', admin_password: '', org_address: '', org_phone: '', org_email: '' };

export default function SuperAdminCompanies() {
    const [companies, setCompanies] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(empty);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    const load = async () => {
        setLoading(true);
        const [cr, pr] = await Promise.all([
            saFetch('/api/superadmin/companies').then(r => r.json()),
            saFetch('/api/superadmin/plans').then(r => r.json()),
        ]);
        if (cr.success) setCompanies(cr.companies);
        if (pr.success) setPlans(pr.plans);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const notify = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const r = await saFetch('/api/superadmin/companies', { method: 'POST', body: JSON.stringify(form) });
            const d = await r.json();
            if (!d.success) throw new Error(d.message);
            notify(`✅ ${d.company.company_name} created! License: ${d.company.license_key}`);
            setShowModal(false);
            setForm(empty);
            load();
        } catch (err) {
            notify(`❌ ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (id) => {
        const r = await saFetch(`/api/superadmin/companies/${id}/toggle`, { method: 'PATCH' });
        const d = await r.json();
        if (d.success) { notify(`✅ Company ${d.status}`); load(); }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        await saFetch(`/api/superadmin/companies/${id}`, { method: 'DELETE' });
        notify('✅ Company deleted');
        load();
    };

    const handleRegenKey = async (id) => {
        const r = await saFetch(`/api/superadmin/companies/${id}/regenerate-key`, { method: 'POST' });
        const d = await r.json();
        if (d.success) { notify(`🔑 New key: ${d.license_key}`); load(); }
    };

    return (
        <SuperAdminLayout>
            <div className="max-w-6xl mx-auto space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Companies</h1>
                        <p className="text-gray-500 text-sm">Manage all client companies</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                    >
                        <Plus className="w-4 h-4" /> New Company
                    </button>
                </div>

                {msg && <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-2 rounded-lg text-sm">{msg}</div>}

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    {['Company', 'Code', 'License Key', 'Plan', 'Status', 'Expiry', 'Users', 'Actions'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-gray-600 font-semibold text-xs uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading...</td></tr>
                                ) : companies.length === 0 ? (
                                    <tr><td colSpan={8} className="text-center py-12 text-gray-400">No companies yet. Create one!</td></tr>
                                ) : companies.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-800">{c.company_name}</td>
                                        <td className="px-4 py-3 text-gray-500">{c.company_code}</td>
                                        <td className="px-4 py-3">
                                            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                                {c.license_key || '—'}
                                            </code>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{c.plan_name || 'Free'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[c.status] || ''}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">
                                            {c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">{c.total_users}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    title={c.status === 'active' ? 'Deactivate' : 'Activate'}
                                                    onClick={() => handleToggle(c.id)}
                                                    className="text-indigo-500 hover:text-indigo-700"
                                                >
                                                    {c.status === 'active' ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                                </button>
                                                <button title="Regenerate License Key" onClick={() => handleRegenKey(c.id)} className="text-yellow-500 hover:text-yellow-700">
                                                    <Key className="w-4 h-4" />
                                                </button>
                                                <button title="Delete Company" onClick={() => handleDelete(c.id, c.company_name)} className="text-red-400 hover:text-red-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
                            <h2 className="font-bold text-gray-800">Create New Company</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreate} className="px-6 py-5 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Company Code <span className="text-red-500">*</span></label>
                                <input
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                                    placeholder="e.g. COMP001"
                                    value={form.company_code}
                                    onChange={e => setForm(f => ({ ...f, company_code: e.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                                <input
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. Cauverу College of Engineering"
                                    value={form.company_name}
                                    onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                                    required
                                />
                            </div>

                            {/* Organisation Details */}
                            <div className="border-t pt-4">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Organisation Details</p>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Full Address</label>
                                        <textarea
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-16 resize-none"
                                            placeholder="e.g. Annamalai Nagar, Tiruchirappalli - 620018"
                                            value={form.org_address}
                                            onChange={e => setForm(f => ({ ...f, org_address: e.target.value }))}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="0431-2730620"
                                                value={form.org_phone}
                                                onChange={e => setForm(f => ({ ...f, org_phone: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="admin@company.com"
                                                value={form.org_email}
                                                onChange={e => setForm(f => ({ ...f, org_email: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Plan</label>
                                <select
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={form.plan_id}
                                    onChange={e => setForm(f => ({ ...f, plan_id: e.target.value }))}
                                >
                                    {plans.map(p => <option key={p.id} value={p.id}>{p.plan_name} (₹{p.price}/yr)</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Validity (days)</label>
                                <input
                                    type="number"
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={form.expiry_days}
                                    onChange={e => setForm(f => ({ ...f, expiry_days: e.target.value }))}
                                    min="1"
                                />
                            </div>

                            {/* Admin User Section */}
                            <div className="border-t pt-4">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Admin User Account</p>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">User ID <span className="text-red-500">*</span></label>
                                        <input
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="e.g. admin01"
                                            value={form.admin_user_id}
                                            onChange={e => setForm(f => ({ ...f, admin_user_id: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">User Name <span className="text-red-500">*</span></label>
                                        <input
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="e.g. John Admin"
                                            value={form.admin_username}
                                            onChange={e => setForm(f => ({ ...f, admin_username: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                                        <input
                                            type="password"
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Set login password"
                                            value={form.admin_password}
                                            onChange={e => setForm(f => ({ ...f, admin_password: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2 rounded-lg text-sm hover:bg-gray-50 transition">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-sm transition disabled:opacity-60">
                                    {saving ? 'Creating...' : 'Create Company'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </SuperAdminLayout>
    );
}
