import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';

const API = (path) => `/api${path}`;
const fmt = (n) => '₹' + (parseFloat(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nowMY = () => { const d = new Date(); return { month: String(d.getMonth() + 1).padStart(2, '0'), year: String(d.getFullYear()) }; };
const PAYMENT_MODES = ['BANK', 'CASH', 'CHEQUE', 'UPI', 'NEFT', 'RTGS'];
const STATUS_COLORS = {
    PENDING: { bg: 'bg-amber-500/10', text: 'text-amber-600', dot: 'bg-amber-500' },
    APPROVED: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', dot: 'bg-emerald-500' },
    REJECTED: { bg: 'bg-red-500/10', text: 'text-red-600', dot: 'bg-red-500' }
};
const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token') || ''}`
});

export default function ExpensePage() {
    const [entries, setEntries] = useState([]);
    const [categories, setCategories] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({ ...nowMY(), search: '', category: '', status: '' });
    const [page, setPage] = useState(1);
    const [_totalPages, setTotalPages] = useState(1);
    const [modal, setModal] = useState({ open: false, entry: null, mode: 'form' });
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [approvalEntry, setApprovalEntry] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const q = new URLSearchParams({ month: filter.month, year: filter.year, page, limit: 50 });
            if (filter.search) q.set('search', filter.search);
            if (filter.category) q.set('category', filter.category);
            if (filter.status) q.set('status', filter.status);
            const res = await fetch(API(`/expense?${q}`), { headers: getAuthHeaders() });
            const data = await res.json();
            if (data.success) { setEntries(data.data || []); setTotalPages(data.totalPages || 1); }

            const my = `${filter.month}-${filter.year}`;
            const sumRes = await fetch(API(`/expense/summary/${my}`), { headers: getAuthHeaders() });
            const sumData = await sumRes.json();
            if (sumData.success) setSummary(sumData);
        } catch (e) { console.error(e); }
        setLoading(false);
    }, [filter, page]);

    const loadCats = useCallback(async () => {
        const res = await fetch(API('/expense/categories'), { headers: getAuthHeaders() });
        const d = await res.json();
        if (d.success) setCategories(d.data || []);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => { void loadCats(); }, 0);
        return () => clearTimeout(timer);
    }, [loadCats]);
    useEffect(() => {
        const timer = setTimeout(() => { void load(); }, 0);
        return () => clearTimeout(timer);
    }, [load]);

    const openAdd = () => {
        setForm({ expense_date: new Date().toISOString().split('T')[0], payment_mode: 'BANK', currency: 'INR' });
        setError(''); setModal({ open: true, entry: null, mode: 'form' });
    };
    const openEdit = (e) => {
        setForm({ ...e, expense_date: e.expense_date?.split('T')[0] });
        setError(''); setModal({ open: true, entry: e, mode: 'form' });
    };
    const closeModal = () => setModal({ open: false, entry: null, mode: 'form' });

    const save = async () => {
        if (!form.category_id || !form.amount || !form.expense_date) { setError('Category, amount and date are required.'); return; }
        setSaving(true); setError('');
        try {
            const url = modal.entry ? API(`/expense/${modal.entry.id}`) : API('/expense');
            const method = modal.entry ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(form) });
            const d = await res.json();
            if (d.success) { closeModal(); load(); } else setError(d.message || 'Save failed.');
        } catch (e) { setError(e.message); }
        setSaving(false);
    };

    const doApprove = async (id) => {
        await fetch(API(`/expense/${id}/approve`), { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ remark: '' }) });
        setApprovalEntry(null); load();
    };

    const doReject = async (id) => {
        if (!rejectionReason) { alert('Please enter a rejection reason.'); return; }
        await fetch(API(`/expense/${id}/reject`), { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ rejection_reason: rejectionReason }) });
        setApprovalEntry(null); setRejectionReason(''); load();
    };

    const pctUsed = (actual, budget) => budget > 0 ? Math.min(100, ((actual / budget) * 100)).toFixed(0) : 0;
    const pctBarColor = (pct) => pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500';

    return (
        <DashboardLayout>
            <div className="p-6 sm:p-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                            <span className="p-3 bg-red-500/10 rounded-2xl text-2xl">💸</span>
                            Expense Management
                        </h1>
                        <p className="text-muted-foreground font-medium mt-1 ml-14">Track, approve and analyse company overheads</p>
                    </div>
                    <button onClick={openAdd} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-600/20 transition-all active:scale-95">
                        + Log New Expense
                    </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-6 bg-card rounded-[2rem] border border-border mb-8 shadow-sm">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Period</label>
                        <select value={filter.month} onChange={e => { setFilter(f => ({ ...f, month: e.target.value })); setPage(1); }}
                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold outline-none">
                            {Array.from({ length: 12 }, (_, i) => ({ v: String(i + 1).padStart(2, '0'), l: new Date(2000, i).toLocaleString('en', { month: 'long' }) }))
                                .map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Year</label>
                        <input type="number" value={filter.year} onChange={e => { setFilter(f => ({ ...f, year: e.target.value })); setPage(1); }}
                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold outline-none" />
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
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Status</label>
                        <select value={filter.status} onChange={e => { setFilter(f => ({ ...f, status: e.target.value })); setPage(1); }}
                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold outline-none">
                            <option value="">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Search</label>
                        <input value={filter.search} onChange={e => { setFilter(f => ({ ...f, search: e.target.value })); setPage(1); }}
                            placeholder="Find entry..." className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold outline-none" />
                    </div>
                </div>

                {summary && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <SummaryCard label="Total Spent" value={fmt(summary.total)} accent="red" icon="💸" />
                        <SummaryCard label="Approved" value={fmt(summary.approvedTotal)} accent="emerald" icon="✅" />
                        <SummaryCard label="Pending" value={summary.pendingCount || 0} accent="amber" icon="⏳" />
                        <SummaryCard label="Receipts" value={summary.count || 0} accent="blue" icon="📋" />
                    </div>
                )}

                {summary?.byCategory?.length > 0 && (
                    <div className="bg-card rounded-[2rem] border border-border p-8 mb-8 shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-widest text-foreground/80 mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 bg-primary rounded-full" />
                            Budget Utilization vs Actual
                        </h3>
                        <div className="space-y-6">
                            {summary.byCategory.map(cat => {
                                const pct = pctUsed(cat.approved_total, cat.budget_monthly);
                                const barColor = pctBarColor(parseFloat(pct));
                                return (
                                    <div key={cat.code} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm font-bold text-foreground">{cat.name}</span>
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tabular-nums">
                                                {fmt(cat.approved_total)} <span className="mx-1 opacity-40">/</span> {fmt(cat.budget_monthly)} <span className={`ml-2 px-2 py-0.5 rounded ${barColor} text-white`}>{pct}%</span>
                                            </span>
                                        </div>
                                        <div className="h-2.5 w-full bg-muted/40 rounded-full overflow-hidden">
                                            <div className={`h-full ${barColor} transition-all duration-1000 ease-out rounded-full`} style={{ width: `${Math.min(100, pct)}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="bg-card rounded-[2rem] border border-border shadow-xl overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/30">
                                    {['Date', 'Category', 'Description', 'Paid To', 'Invoice', 'Mode', 'Amount', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="p-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr><td colSpan={9} className="p-20 text-center text-muted-foreground font-bold uppercase tracking-widest animate-pulse font-mono">Loading Ledgers...</td></tr>
                                ) : entries.length === 0 ? (
                                    <tr><td colSpan={9} className="p-20 text-center text-muted-foreground italic font-medium">No expense records located.</td></tr>
                                ) : entries.map((e) => {
                                    const { bg, text } = STATUS_COLORS[e.approval_status] || { bg: 'bg-muted', text: 'text-muted-foreground' };
                                    return (
                                        <tr key={e.id} className="hover:bg-muted/20 transition-colors group">
                                            <td className="p-5 text-sm font-bold text-foreground/80">{e.expense_date?.split('T')[0]}</td>
                                            <td className="p-5">
                                                <span className="px-3 py-1 bg-red-500/10 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                    {e.category_name}
                                                </span>
                                            </td>
                                            <td className="p-5 text-sm font-medium text-foreground/60 max-w-[150px] truncate">{e.description || '—'}</td>
                                            <td className="p-5 text-sm font-bold text-foreground/80">{e.paid_to || '—'}</td>
                                            <td className="p-5 text-xs font-mono text-muted-foreground">{e.invoice_no || '—'}</td>
                                            <td className="p-5">
                                                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                    {e.payment_mode}
                                                </span>
                                            </td>
                                            <td className="p-5 text-sm font-black text-red-600 tabular-nums text-right pr-8">{fmt(e.amount)}</td>
                                            <td className="p-5">
                                                <span className={`px-4 py-1 ${bg} ${text} rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap`}>
                                                    {e.approval_status}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex gap-2">
                                                    {e.approval_status !== 'APPROVED' && (
                                                        <button onClick={() => openEdit(e)} className="p-2 bg-blue-500/10 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        </button>
                                                    )}
                                                    {e.approval_status === 'PENDING' && (
                                                        <button onClick={() => setApprovalEntry(e)} className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {modal.open && (
                    <div className="fixed inset-0 bg-background/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <div className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-300">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-black text-foreground">{modal.entry ? 'Update Expense' : 'Log New Expenditure'}</h2>
                                <button onClick={closeModal} className="text-muted-foreground hover:text-foreground text-2xl">×</button>
                            </div>

                            <div className="space-y-4">
                                <FormRow label="Category / Head">
                                    <select value={form.category_id || ''} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                                        className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20">
                                        <option value="">Select category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </FormRow>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormRow label="Amount (₹)">
                                        <input type="number" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                            className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-3 text-sm font-bold outline-none" placeholder="0.00" />
                                    </FormRow>
                                    <FormRow label="Transaction Date">
                                        <input type="date" value={form.expense_date || ''} onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))}
                                            className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-3 text-sm font-bold outline-none" />
                                    </FormRow>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormRow label="Paid To">
                                        <input value={form.paid_to || ''} onChange={e => setForm(f => ({ ...f, paid_to: e.target.value }))}
                                            className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-3 text-sm font-bold outline-none" placeholder="Vendor Name" />
                                    </FormRow>
                                    <FormRow label="Invoice / Receipt">
                                        <input value={form.invoice_no || ''} onChange={e => setForm(f => ({ ...f, invoice_no: e.target.value }))}
                                            className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-3 text-sm font-bold outline-none" placeholder="REF-001" />
                                    </FormRow>
                                </div>

                                <FormRow label="Mode of Payment">
                                    <select value={form.payment_mode || 'BANK'} onChange={e => setForm(f => ({ ...f, payment_mode: e.target.value }))}
                                        className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-3 text-sm font-bold outline-none">
                                        {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </FormRow>

                                <FormRow label="Memo / Purpose">
                                    <textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                        className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-3 text-sm font-bold font-medium outline-none h-20" placeholder="Details of expense..." />
                                </FormRow>
                            </div>

                            {error && <p className="mt-4 text-xs font-bold text-red-500 bg-red-500/10 p-3 rounded-xl">{error}</p>}

                            <div className="flex gap-3 mt-8">
                                <button onClick={closeModal} className="flex-1 py-4 bg-muted text-muted-foreground rounded-2xl font-black uppercase tracking-widest text-xs">Cancel</button>
                                <button onClick={save} disabled={saving} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 shadow-xl shadow-red-600/20 active:scale-95 transition-all">
                                    {saving ? 'Processing...' : (modal.entry ? 'Save Changes' : 'Confirm & Log')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {approvalEntry && (
                    <div className="fixed inset-0 bg-background/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <div className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-300">
                            <h2 className="text-xl font-black text-foreground mb-6">Review Expenditure</h2>
                            <div className="bg-muted/30 border border-border rounded-2xl p-6 mb-8 transform hover:scale-[1.01] transition-transform">
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Amount</div>
                                <div className="text-3xl font-black text-red-600 mb-4">{fmt(approvalEntry.amount)}</div>
                                <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                                    <div>
                                        <span className="text-muted-foreground uppercase tracking-widest block text-[8px] mb-1">Category</span>
                                        <span className="text-foreground">{approvalEntry.category_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground uppercase tracking-widest block text-[8px] mb-1">Paid To</span>
                                        <span className="text-foreground">{approvalEntry.paid_to}</span>
                                    </div>
                                </div>
                            </div>

                            <FormRow label="Notes / Reason for Action">
                                <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
                                    className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-3 text-sm font-bold font-medium outline-none h-24" placeholder="Required for rejection..." />
                            </FormRow>

                            <div className="flex gap-3 mt-8">
                                <button onClick={() => { setApprovalEntry(null); setRejectionReason(''); }} className="flex-1 py-4 bg-muted text-muted-foreground rounded-2xl font-black uppercase tracking-widest text-xs">Dismiss</button>
                                <button onClick={() => doReject(approvalEntry.id)} className="flex-1 py-4 bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-600 hover:text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all">Reject</button>
                                <button onClick={() => doApprove(approvalEntry.id)} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">Approve ✓</button>
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
        amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        red: 'bg-red-500/10 text-red-600 border-red-500/20',
        blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    };
    return (
        <div className={`p-8 bg-card border rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 group ${variants[accent] || variants.blue}`}>
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform origin-left">{icon}</div>
            <div className="text-2xl font-black tracking-tight mb-1 truncate text-foreground">{value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60 text-muted-foreground">{label}</div>
        </div>
    );
}

function FormRow({ label, children }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{label}</label>
            {children}
        </div>
    );
}
