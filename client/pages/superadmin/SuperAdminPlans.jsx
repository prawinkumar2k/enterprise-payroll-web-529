import React, { useEffect, useState } from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';

const saFetch = (url, opts = {}) => fetch(url, {
    ...opts,
    headers: { 'Authorization': `Bearer ${localStorage.getItem('sa_token')}`, 'Content-Type': 'application/json', ...opts.headers }
});

const empty = { plan_name: '', max_users: 10, max_storage_mb: 500, max_records: 5000, price: 0, duration_days: 365 };

export default function SuperAdminPlans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(empty);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    const load = () => {
        setLoading(true);
        saFetch('/api/superadmin/plans').then(r => r.json())
            .then(d => { if (d.success) setPlans(d.plans); })
            .finally(() => setLoading(false));
    };
    useEffect(load, []);

    const notify = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

    const openCreate = () => { setEditId(null); setForm(empty); setShowModal(true); };
    const openEdit = (p) => {
        setEditId(p.id);
        setForm({ plan_name: p.plan_name, max_users: p.max_users, max_storage_mb: p.max_storage_mb, max_records: p.max_records, price: p.price, duration_days: p.duration_days });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = editId ? `/api/superadmin/plans/${editId}` : '/api/superadmin/plans';
            const method = editId ? 'PUT' : 'POST';
            const r = await saFetch(url, { method, body: JSON.stringify(form) });
            const d = await r.json();
            if (!d.success) throw new Error(d.message);
            notify(`✅ Plan ${editId ? 'updated' : 'created'}.`);
            setShowModal(false);
            load();
        } catch (err) {
            notify(`❌ ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete plan "${name}"?`)) return;
        await saFetch(`/api/superadmin/plans/${id}`, { method: 'DELETE' });
        notify('✅ Plan deleted.');
        load();
    };

    const f = (key, val, type = 'text') => setForm(p => ({ ...p, [key]: type === 'number' ? Number(val) : val }));

    const PLAN_COLORS = ['bg-gray-100', 'bg-blue-50', 'bg-indigo-50', 'bg-purple-50'];

    return (
        <SuperAdminLayout>
            <div className="max-w-5xl mx-auto space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Plans</h1>
                        <p className="text-gray-500 text-sm">Manage subscription plans</p>
                    </div>
                    <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
                        <Plus className="w-4 h-4" /> New Plan
                    </button>
                </div>

                {msg && <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-2 rounded-lg text-sm">{msg}</div>}

                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {plans.map((p, i) => (
                            <div key={p.id} className={`rounded-xl border p-5 relative ${PLAN_COLORS[i % PLAN_COLORS.length]}`}>
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-bold text-gray-800 text-lg">{p.plan_name}</h3>
                                    <div className="flex gap-1">
                                        <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-indigo-600 p-1"><Pencil className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => handleDelete(p.id, p.plan_name)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                                <p className="text-2xl font-black text-indigo-700">
                                    {p.price > 0 ? `₹${Number(p.price).toLocaleString()}` : 'Free'}
                                    <span className="text-sm font-normal text-gray-500">/yr</span>
                                </p>
                                <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
                                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />{p.max_users} Users</li>
                                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />{p.max_records?.toLocaleString()} Records</li>
                                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />{p.max_storage_mb} MB Storage</li>
                                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />{p.duration_days} days validity</li>
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h2 className="font-bold text-gray-800">{editId ? 'Edit Plan' : 'New Plan'}</h2>
                            <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
                            {[
                                { key: 'plan_name',      label: 'Plan Name',       type: 'text',   ph: 'e.g. Pro' },
                                { key: 'max_users',      label: 'Max Users',       type: 'number', ph: '50' },
                                { key: 'max_storage_mb', label: 'Max Storage (MB)',type: 'number', ph: '5000' },
                                { key: 'max_records',    label: 'Max Records',     type: 'number', ph: '100000' },
                                { key: 'price',          label: 'Price (₹/yr)',    type: 'number', ph: '2999' },
                                { key: 'duration_days',  label: 'Duration (days)', type: 'number', ph: '365' },
                            ].map(({ key, label, type, ph }) => (
                                <div key={key}>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
                                    <input
                                        type={type}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder={ph}
                                        value={form[key]}
                                        onChange={e => f(key, e.target.value, type)}
                                        required={key === 'plan_name'}
                                    />
                                </div>
                            ))}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2 rounded-lg text-sm hover:bg-gray-50 transition">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-sm transition disabled:opacity-60">
                                    {saving ? 'Saving...' : 'Save Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </SuperAdminLayout>
    );
}
