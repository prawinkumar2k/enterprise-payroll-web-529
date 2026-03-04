import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';

const API = (path) => `/api${path}`;
const fmt = (n) => '₹' + (parseFloat(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nowMY = () => { const d = new Date(); return { month: String(d.getMonth() + 1).padStart(2, '0'), year: String(d.getFullYear()) }; };

const PAYMENT_MODES = ['BANK', 'CASH', 'CHEQUE', 'UPI', 'NEFT', 'RTGS'];

export default function IncomePage() {
    const [entries, setEntries] = useState([]);
    const [categories, setCategories] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({ ...nowMY(), search: '', category: '' });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [modal, setModal] = useState({ open: false, entry: null });
    const [delConfirm, setDelConfirm] = useState(null);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const token = () => localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const q = new URLSearchParams({ month: filter.month, year: filter.year, page, limit: 50 });
            if (filter.search) q.set('search', filter.search);
            if (filter.category) q.set('category', filter.category);
            const res = await fetch(API(`/income?${q}`), { headers: headers() });
            const data = await res.json();
            if (data.success) { setEntries(data.data || []); setTotal(data.total); setTotalPages(data.totalPages || 1); }

            const my = `${filter.month}-${filter.year}`;
            const sumRes = await fetch(API(`/income/summary/${my}`), { headers: headers() });
            const sumData = await sumRes.json();
            if (sumData.success) setSummary(sumData);
        } catch (e) { console.error(e); }
        setLoading(false);
    }, [filter, page]);

    const loadCats = useCallback(async () => {
        const res = await fetch(API('/income/categories'), { headers: headers() });
        const d = await res.json();
        if (d.success) setCategories(d.data || []);
    }, []);

    useEffect(() => { loadCats(); }, []);
    useEffect(() => { load(); }, [load]);

    const openAdd = () => {
        setForm({ received_date: new Date().toISOString().split('T')[0], payment_mode: 'BANK', currency: 'INR' });
        setError('');
        setModal({ open: true, entry: null });
    };
    const openEdit = (e) => {
        setForm({ ...e, received_date: e.received_date?.split('T')[0] });
        setError('');
        setModal({ open: true, entry: e });
    };
    const closeModal = () => setModal({ open: false, entry: null });

    const save = async () => {
        if (!form.category_id || !form.amount || !form.received_date) {
            setError('Category, amount and date are required.'); return;
        }
        setSaving(true);
        setError('');
        try {
            const url = modal.entry ? API(`/income/${modal.entry.id}`) : API('/income');
            const method = modal.entry ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(form) });
            const d = await res.json();
            if (d.success) { closeModal(); load(); }
            else setError(d.message || 'Save failed.');
        } catch (e) { setError(e.message); }
        setSaving(false);
    };

    const del = async (id) => {
        await fetch(API(`/income/${id}`), { method: 'DELETE', headers: headers() });
        setDelConfirm(null);
        load();
    };

    return (
        <DashboardLayout>
            <div className="p-6 sm:p-8 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                            <span className="p-3 bg-emerald-500/10 rounded-2xl text-2xl">💰</span>
                            Income Management
                        </h1>
                        <p className="text-muted-foreground font-medium mt-1 ml-14">Track all revenue streams and fiscal receipts</p>
                    </div>
                    <button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-600/20 transition-all active:scale-95">
                        + Add Income Entry
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-card rounded-[2rem] border border-border mb-8 shadow-sm">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Month</label>
                        <select value={filter.month} onChange={e => { setFilter(f => ({ ...f, month: e.target.value })); setPage(1); }}
                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                            {Array.from({ length: 12 }, (_, i) => ({ v: String(i + 1).padStart(2, '0'), l: new Date(2000, i).toLocaleString('en', { month: 'long' }) }))
                                .map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Year</label>
                        <input type="number" value={filter.year} onChange={e => { setFilter(f => ({ ...f, year: e.target.value })); setPage(1); }}
                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold outline-none" placeholder="Year" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</label>
                        <select value={filter.category} onChange={e => { setFilter(f => ({ ...f, category: e.target.value })); setPage(1); }}
                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold outline-none">
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Search Keywords</label>
                        <input value={filter.search} onChange={e => { setFilter(f => ({ ...f, search: e.target.value })); setPage(1); }}
                            placeholder="Enter keywords..." className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold outline-none" />
                    </div>
                </div>

                {summary && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <SummaryCard label="Monthly Revenue" value={fmt(summary.total)} accent="emerald" icon="💵" />
                        <SummaryCard label="Volume" value={summary.count || 0} accent="blue" icon="📋" />
                        {summary.byCategory?.[0] && (
                            <SummaryCard label="Primary Stream" value={summary.byCategory[0].name} accent="violet" icon="🏆" />
                        )}
                    </div>
                )}

                <div className="bg-card rounded-[2rem] border border-border shadow-xl overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/30">
                                    {['Date', 'Category', 'Description', 'Received From', 'Mode', 'Amount', 'Actions'].map(h => (
                                        <th key={h} className="p-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr><td colSpan={7} className="p-20 text-center text-muted-foreground font-bold uppercase tracking-widest animate-pulse">Synchronizing Data...</td></tr>
                                ) : entries.length === 0 ? (
                                    <tr><td colSpan={7} className="p-20 text-center text-muted-foreground">No income records found for this period.</td></tr>
                                ) : entries.map((e, i) => (
                                    <tr key={e.id} className="hover:bg-muted/20 transition-colors group">
                                        <td className="p-5 text-sm font-bold text-foreground/80">{e.received_date?.split('T')[0]}</td>
                                        <td className="p-5">
                                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                {e.category_name}
                                            </span>
                                        </td>
                                        <td className="p-5 text-sm font-medium text-foreground/60 max-w-[200px] truncate">{e.description || '—'}</td>
                                        <td className="p-5 text-sm font-bold text-foreground/80">{e.received_from || '—'}</td>
                                        <td className="p-5 text-sm font-medium">
                                            <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                {e.payment_mode}
                                            </span>
                                        </td>
                                        <td className="p-5 text-sm font-black text-emerald-600 text-right pr-10">{fmt(e.amount)}</td>
                                        <td className="p-5">
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEdit(e)} className="p-2 bg-blue-500/10 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button onClick={() => setDelConfirm(e.id)} className="p-2 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setPage(p)}
                                className={`w-10 h-10 rounded-xl font-bold transition-all ${p === page ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-card border border-border text-foreground hover:bg-muted'}`}>
                                {p}
                            </button>
                        ))}
                    </div>
                )}

                {modal.open && (
                    <div className="fixed inset-0 bg-background/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <div className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-300">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-black text-foreground">{modal.entry ? 'Update Income' : 'Register New Revenue'}</h2>
                                <button onClick={closeModal} className="text-muted-foreground hover:text-foreground text-2xl">×</button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Stream Category</label>
                                    <select value={form.category_id || ''} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                                        className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20">
                                        <option value="">Select category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Amount (INR)</label>
                                        <input type="number" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                            className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-3 text-sm font-bold outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Date Received</label>
                                        <input type="date" value={form.received_date || ''} onChange={e => setForm(f => ({ ...f, received_date: e.target.value }))}
                                            className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-3 text-sm font-bold outline-none" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Payer Name</label>
                                    <input value={form.received_from || ''} onChange={e => setForm(f => ({ ...f, received_from: e.target.value }))}
                                        className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-3 text-sm font-bold outline-none" placeholder="Organization / Person" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Payment Mode</label>
                                        <select value={form.payment_mode || 'BANK'} onChange={e => setForm(f => ({ ...f, payment_mode: e.target.value }))}
                                            className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-3 text-sm font-bold outline-none">
                                            {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Reference No</label>
                                        <input value={form.reference_no || ''} onChange={e => setForm(f => ({ ...f, reference_no: e.target.value }))}
                                            className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-3 text-sm font-bold outline-none" placeholder="UTR / Cheque" />
                                    </div>
                                </div>
                            </div>

                            {error && <p className="mt-4 text-xs font-bold text-red-500 bg-red-500/10 p-3 rounded-xl">{error}</p>}

                            <div className="flex gap-3 mt-8">
                                <button onClick={closeModal} className="flex-1 py-4 bg-muted text-muted-foreground rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-muted/80 transition-all">Discard</button>
                                <button onClick={save} disabled={saving} className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 shadow-xl shadow-primary/20 transition-all">
                                    {saving ? 'Syncing...' : (modal.entry ? 'Apply Changes' : 'Confirm Entry')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {delConfirm && (
                    <div className="fixed inset-0 bg-background/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <div className="bg-card border border-border w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">⚠️</div>
                            <h2 className="text-xl font-black text-foreground mb-2">Are you sure?</h2>
                            <p className="text-muted-foreground text-sm font-medium mb-8">This action will permanently delete this revenue record. This cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDelConfirm(null)} className="flex-1 py-4 bg-muted text-muted-foreground rounded-2xl font-black uppercase tracking-widest text-xs">Keep it</button>
                                <button onClick={() => del(delConfirm)} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-600/20">Delete Forever</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

function SummaryCard({ label, value, accent, icon }) {
    const variants = {
        emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        violet: 'bg-violet-500/10 text-violet-600 border-violet-500/20'
    };
    return (
        <div className={`p-8 bg-card border rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 group ${variants[accent] || variants.blue}`}>
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform origin-left">{icon}</div>
            <div className="text-2xl font-black tracking-tight mb-1 truncate text-foreground">{value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60 text-muted-foreground">{label}</div>
        </div>
    );
}
