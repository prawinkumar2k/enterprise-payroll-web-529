import { useReducer, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
    TrendingUp,
    Plus,
    Pencil,
    Trash2,
    RefreshCcw,
    X,
    Loader2,
    AlertCircle,
    Calendar,
    Tag,
    CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

// ── helpers ────────────────────────────────────────────────────────────────
const MONTHS = ["01","02","03","04","05","06","07","08","09","10","11","12"];
const YEARS  = ["2023","2024","2025","2026","2027"];
const monthName = (m) => new Date(2000, parseInt(m) - 1).toLocaleString('default', { month: 'long' });
const fmtCurrency = (v) => '₹' + parseFloat(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
const api = (url, opts = {}) => {
    const token = localStorage.getItem('token');
    return fetch(url, {
        ...opts,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts.headers || {}) },
    }).then(r => r.json());
};

const today = new Date();
const PAD = (n) => String(n).padStart(2, '0');

// ── reducer ────────────────────────────────────────────────────────────────
const init = {
    month: PAD(today.getMonth() + 1),
    year:  String(today.getFullYear()),
    entries: [],
    summary: { totalIncome: 0, data: [] },
    isLoading: false,
    isSaving: false,
    modal: null,      // null | 'add' | 'edit'
    editingEntry: null,
    deleteConfirm: null,
    form: { category: '', description: '', amount: '', transaction_date: '', reference_no: '', remarks: '' },
};

function reducer(state, action) {
    switch (action.type) {
        case 'SET': return { ...state, [action.field]: action.value };
        case 'SET_FORM': return { ...state, form: { ...state.form, [action.field]: action.value } };
        case 'OPEN_ADD': return {
            ...state, modal: 'add', editingEntry: null,
            form: { category: '', description: '', amount: '', transaction_date: '', reference_no: '', remarks: '' },
        };
        case 'OPEN_EDIT': return {
            ...state, modal: 'edit', editingEntry: action.entry,
            form: {
                category:      action.entry.category || '',
                description:   action.entry.description || '',
                amount:        String(action.entry.amount || ''),
                transaction_date: action.entry.transaction_date ? action.entry.transaction_date.split('T')[0] : '',
                reference_no:  action.entry.reference_no || '',
                remarks:       action.entry.remarks || '',
            },
        };
        case 'CLOSE_MODAL': return { ...state, modal: null, editingEntry: null };
        default: return state;
    }
}

// ── EntryModal ─────────────────────────────────────────────────────────────
function EntryModal({ mode, form, isSaving, onClose, onSave, dispatch, monthYear }) {
    const isEdit = mode === 'edit';
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-white" />
                        <h2 className="text-white font-bold text-lg">{isEdit ? 'Edit Income Entry' : 'Add Income Entry'}</h2>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Category *</label>
                            <input
                                type="text"
                                value={form.category}
                                onChange={e => dispatch({ type: 'SET_FORM', field: 'category', value: e.target.value })}
                                placeholder="e.g. Grant, Donation, Fee Collection…"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Amount (₹) *</label>
                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={form.amount}
                                onChange={e => dispatch({ type: 'SET_FORM', field: 'amount', value: e.target.value })}
                                placeholder="0.00"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date *</label>
                            <input
                                type="date"
                                value={form.transaction_date}
                                onChange={e => dispatch({ type: 'SET_FORM', field: 'transaction_date', value: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                            <input
                                type="text"
                                value={form.description}
                                onChange={e => dispatch({ type: 'SET_FORM', field: 'description', value: e.target.value })}
                                placeholder="Short description…"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Reference No.</label>
                            <input
                                type="text"
                                value={form.reference_no}
                                onChange={e => dispatch({ type: 'SET_FORM', field: 'reference_no', value: e.target.value })}
                                placeholder="Receipt / Voucher no."
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Month (auto)</label>
                            <input
                                type="text"
                                value={monthYear}
                                readOnly
                                className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Remarks</label>
                            <textarea
                                value={form.remarks}
                                onChange={e => dispatch({ type: 'SET_FORM', field: 'remarks', value: e.target.value })}
                                rows={2}
                                placeholder="Additional notes…"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-6 flex justify-end gap-3">
                    <button onClick={onClose} className="btn-secondary text-sm py-2 px-4">Cancel</button>
                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg px-5 py-2 text-sm transition disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        {isEdit ? 'Save Changes' : 'Add Income'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── main component ─────────────────────────────────────────────────────────
export default function Income() {
    const [state, dispatch] = useReducer(reducer, init);
    const { month, year, entries, summary, isLoading, isSaving, modal, editingEntry, deleteConfirm, form } = state;
    const monthYear = `${month}-${year}`;

    // ── fetch entries ──────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        dispatch({ type: 'SET', field: 'isLoading', value: true });
        try {
            const [listRes, sumRes] = await Promise.all([
                api(`/api/income-expense?type=income&month_year=${monthYear}`),
                api(`/api/income-expense/summary?month_year=${monthYear}`),
            ]);
            if (listRes.success) dispatch({ type: 'SET', field: 'entries', value: listRes.data });
            if (sumRes.success)  dispatch({ type: 'SET', field: 'summary', value: sumRes });
        } catch {
            toast.error('Failed to load income data');
        } finally {
            dispatch({ type: 'SET', field: 'isLoading', value: false });
        }
    }, [monthYear]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── save (add/edit) ────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!form.category.trim()) return toast.error('Category is required');
        if (!form.amount || parseFloat(form.amount) <= 0) return toast.error('Amount must be > 0');
        if (!form.transaction_date) return toast.error('Date is required');

        dispatch({ type: 'SET', field: 'isSaving', value: true });
        try {
            const payload = {
                type: 'income',
                category:         form.category.trim(),
                description:      form.description.trim(),
                amount:           parseFloat(form.amount),
                transaction_date: form.transaction_date,
                month_year:       monthYear,
                reference_no:     form.reference_no.trim(),
                remarks:          form.remarks.trim(),
            };

            let res;
            if (modal === 'edit' && editingEntry) {
                res = await api(`/api/income-expense/${editingEntry.id}`, { method: 'PUT', body: JSON.stringify(payload) });
            } else {
                res = await api('/api/income-expense', { method: 'POST', body: JSON.stringify(payload) });
            }

            if (res.success) {
                toast.success(res.message);
                dispatch({ type: 'CLOSE_MODAL' });
                fetchData();
            } else {
                toast.error(res.message);
            }
        } catch {
            toast.error('Save failed');
        } finally {
            dispatch({ type: 'SET', field: 'isSaving', value: false });
        }
    };

    // ── delete ─────────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        try {
            const res = await api(`/api/income-expense/${id}`, { method: 'DELETE' });
            if (res.success) {
                toast.success(res.message);
                dispatch({ type: 'SET', field: 'deleteConfirm', value: null });
                fetchData();
            } else {
                toast.error(res.message);
            }
        } catch {
            toast.error('Delete failed');
        }
    };

    const totalIncome = summary?.totalIncome || 0;

    return (
        <DashboardLayout activeRoute="income">
            <div className="flex flex-col h-full gap-4 p-4 bg-gray-50 min-h-screen">

                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-gray-900">Income</h1>
                            <p className="text-xs text-gray-400">Track all income entries per month</p>
                        </div>
                    </div>
                    <button
                        onClick={() => dispatch({ type: 'OPEN_ADD' })}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-4 py-2 text-sm transition shadow"
                    >
                        <Plus className="w-4 h-4" /> Add Income
                    </button>
                </div>

                {/* ── Filter Bar ── */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Period</span>
                    </div>
                    <select
                        value={month}
                        onChange={e => dispatch({ type: 'SET', field: 'month', value: e.target.value })}
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                        {MONTHS.map(m => <option key={m} value={m}>{monthName(m)}</option>)}
                    </select>
                    <select
                        value={year}
                        onChange={e => dispatch({ type: 'SET', field: 'year', value: e.target.value })}
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <button onClick={fetchData} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition ml-auto">
                        <RefreshCcw className="w-3.5 h-3.5" /> Refresh
                    </button>
                </div>

                {/* ── Summary Card ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg">
                        <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider">Total Income</p>
                        <p className="text-3xl font-black mt-1">{fmtCurrency(totalIncome)}</p>
                        <p className="text-emerald-100 text-xs mt-1">{monthName(month)} {year}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Entries</p>
                        <p className="text-3xl font-black text-gray-900 mt-1">{entries.length}</p>
                        <p className="text-gray-400 text-xs mt-1">This month</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Categories</p>
                        <p className="text-3xl font-black text-gray-900 mt-1">
                            {[...new Set(entries.map(e => e.category))].length}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">Distinct this month</p>
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-1">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-900 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest font-black w-10">#</th>
                                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest font-black">Date</th>
                                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest font-black">Category</th>
                                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest font-black">Description</th>
                                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest font-black">Ref No.</th>
                                    <th className="px-4 py-3 text-right text-[10px] uppercase tracking-widest font-black">Amount</th>
                                    <th className="px-4 py-3 text-center text-[10px] uppercase tracking-widest font-black w-24">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                                                <p className="text-gray-400">Loading income entries…</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : entries.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <AlertCircle className="w-10 h-10 text-gray-200" />
                                                <div>
                                                    <p className="font-bold text-gray-700">No income entries for {monthName(month)} {year}</p>
                                                    <p className="text-xs text-gray-400 mt-1">Click &quot;Add Income&quot; to create your first entry</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    entries.map((entry, i) => (
                                        <tr key={entry.id} className="hover:bg-emerald-50/30 transition-colors">
                                            <td className="px-4 py-3 text-gray-400 font-bold text-xs">{i + 1}</td>
                                            <td className="px-4 py-3 text-gray-700">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-300" />
                                                    {entry.transaction_date ? new Date(entry.transaction_date).toLocaleDateString('en-IN') : '—'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1 rounded-md">
                                                    <Tag className="w-3 h-3" />{entry.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{entry.description || '—'}</td>
                                            <td className="px-4 py-3 text-gray-400 text-xs font-mono">{entry.reference_no || '—'}</td>
                                            <td className="px-4 py-3 text-right font-black text-emerald-600">{fmtCurrency(entry.amount)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => dispatch({ type: 'OPEN_EDIT', entry })}
                                                        className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition border border-gray-100"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => dispatch({ type: 'SET', field: 'deleteConfirm', value: entry.id })}
                                                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 transition border border-red-100"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {entries.length > 0 && (
                                <tfoot className="bg-emerald-50 border-t-2 border-emerald-100">
                                    <tr>
                                        <td colSpan={5} className="px-4 py-3 text-right font-black text-xs uppercase tracking-widest text-emerald-700">Total Income</td>
                                        <td className="px-4 py-3 text-right font-black text-emerald-700 text-base">{fmtCurrency(totalIncome)}</td>
                                        <td />
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Add / Edit Modal ── */}
            {modal && (
                <EntryModal
                    mode={modal}
                    form={form}
                    isSaving={isSaving}
                    monthYear={monthYear}
                    onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
                    onSave={handleSave}
                    dispatch={dispatch}
                />
            )}

            {/* ── Delete Confirm ── */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Delete Entry?</h3>
                                <p className="text-xs text-gray-400">This action cannot be undone.</p>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => dispatch({ type: 'SET', field: 'deleteConfirm', value: null })} className="flex-1 btn-secondary text-sm py-2">Cancel</button>
                            <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg py-2 text-sm transition">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
