import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';

const API = (path) => `/api${path}`;
const fmt = (n) => '₹' + (parseFloat(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

const REVISION_TYPES = ['ANNUAL_INCREMENT', 'PROMOTION', 'CORRECTION', 'JOINING', 'RESTRUCTURE'];
const STATUS_STYLE = {
    PENDING: { bg: '#fff3cd', color: '#92400e' },
    APPROVED: { bg: '#dcfce7', color: '#15803d' },
    REJECTED: { bg: '#fee2e2', color: '#dc2626' },
};

export default function SalaryRevisionPage() {
    const [pending, setPending] = useState([]);
    const [empRevisions, setEmpRevisions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchEmp, setSearchEmp] = useState('');
    const [modal, setModal] = useState({ open: false, type: null, item: null });
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [rejReason, setRejReason] = useState('');

    const token = () => localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

    const loadPending = useCallback(async () => {
        setLoading(true);
        const res = await fetch(API('/salary-revisions/pending'), { headers: headers() });
        const d = await res.json();
        if (d.success) setPending(d.data || []);
        setLoading(false);
    }, []);

    useEffect(() => { loadPending(); }, [loadPending]);

    const searchEmployee = async () => {
        if (!searchEmp.trim()) return;
        const res = await fetch(API(`/salary-revisions/${searchEmp.trim()}`), { headers: headers() });
        const d = await res.json();
        if (d.success) setEmpRevisions(d.data || []);
    };

    const openCreateModal = () => {
        setForm({ effective_from: new Date().toISOString().split('T')[0], revision_type: 'CORRECTION' });
        setError('');
        setModal({ open: true, type: 'create', item: null });
    };

    const openApprove = (item) => {
        setModal({ open: true, type: 'approve', item });
        setRejReason('');
    };

    const closeModal = () => { setModal({ open: false, type: null, item: null }); setError(''); };

    const createRevision = async () => {
        if (!form.empno || !form.effective_from || !form.basic) { setError('Employee No, Effective Date and Basic are required.'); return; }
        setSaving(true); setError('');
        try {
            const res = await fetch(API('/salary-revisions'), { method: 'POST', headers: headers(), body: JSON.stringify(form) });
            const d = await res.json();
            if (d.success) { closeModal(); loadPending(); }
            else setError(d.message || 'Failed to create revision.');
        } catch (e) { setError(e.message); }
        setSaving(false);
    };

    const approve = async (id) => {
        await fetch(API(`/salary-revisions/${id}/approve`), { method: 'PUT', headers: headers(), body: JSON.stringify({}) });
        closeModal(); loadPending();
    };

    const reject = async (id) => {
        if (!rejReason) { setError('Rejection reason is required.'); return; }
        await fetch(API(`/salary-revisions/${id}/reject`), { method: 'PUT', headers: headers(), body: JSON.stringify({ rejection_reason: rejReason }) });
        closeModal(); loadPending();
    };

    const field = (label, key, type = 'text', placeholder = '') => (
        <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{label}</label>
            <input type={type} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                style={inputStyle} placeholder={placeholder} />
        </div>
    );

    return (
        <DashboardLayout>
            <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1e293b', margin: 0 }}>📝 Salary Revision History</h1>
                        <p style={{ color: '#64748b', margin: '4px 0 0' }}>Track, approve and review all salary structure changes</p>
                    </div>
                    <button onClick={openCreateModal}
                        style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                        + Create Revision
                    </button>
                </div>

                {/* Employee History Search */}
                <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 24 }}>
                    <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>🔍 Employee Revision History</h3>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <input value={searchEmp} onChange={e => setSearchEmp(e.target.value)}
                            placeholder="Enter Employee Number..." style={{ ...inputStyle, flex: 1 }} />
                        <button onClick={searchEmployee}
                            style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 600 }}>
                            Search
                        </button>
                    </div>
                    {empRevisions.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                            <h4 style={{ margin: '0 0 10px', color: '#374151' }}>
                                {empRevisions[0]?.empname || searchEmp} — {empRevisions.length} revision(s)
                            </h4>
                            <div style={{ display: 'grid', gap: 10 }}>
                                {empRevisions.map((r, i) => (
                                    <div key={r.id} style={{
                                        border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 18px',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        background: i === 0 ? '#f0f9ff' : '#fafafa',
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 15 }}>{fmt(r.gross)} gross</div>
                                            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                                                {r.revision_type} • Effective: {r.effective_from?.split('T')[0]}
                                                {r.increment_pct && <span style={{ color: '#16a34a', marginLeft: 8, fontWeight: 600 }}>↑{r.increment_pct}%</span>}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{r.reason}</div>
                                        </div>
                                        <span style={{ background: STATUS_STYLE[r.status]?.bg, color: STATUS_STYLE[r.status]?.color, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                                            {r.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Pending Approvals */}
                <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: 15 }}>
                        ⏳ Pending Approvals ({pending.length})
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                {['Employee', 'Department', 'Type', 'Gross', 'Effective From', 'Requested By', 'Action'].map(h => (
                                    <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 12 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr>
                            ) : pending.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>✅ No pending salary revisions.</td></tr>
                            ) : pending.map((r, i) => (
                                <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{r.empno} — {r.empname}</td>
                                    <td style={{ padding: '12px 14px', color: '#64748b' }}>{r.department}</td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <span style={{ background: '#ede9fe', color: '#6d28d9', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>{r.revision_type}</span>
                                    </td>
                                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#6366f1' }}>{fmt(r.gross)}</td>
                                    <td style={{ padding: '12px 14px', color: '#64748b' }}>{r.effective_from?.split('T')[0]}</td>
                                    <td style={{ padding: '12px 14px', color: '#64748b' }}>{r.revised_by}</td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <button onClick={() => openApprove(r)} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Create Revision Modal */}
                {modal.open && modal.type === 'create' && (
                    <Modal title="Create Salary Revision" onClose={closeModal}>
                        {field('Employee Number *', 'empno', 'text', 'e.g. EMP001')}
                        {field('Effective From *', 'effective_from', 'date')}
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Revision Type</label>
                            <select value={form.revision_type || 'CORRECTION'} onChange={e => setForm(f => ({ ...f, revision_type: e.target.value }))} style={inputStyle}>
                                {REVISION_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {[['Basic *', 'basic'], ['Grade Pay', 'grade_pay'], ['HATA', 'hata'], ['Allowance', 'allowance'],
                            ['DA', 'da'], ['Special', 'special'], ['EPF', 'epf'], ['ESI', 'esi']].map(([l, k]) => (
                                <div key={k}>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{l}</label>
                                    <input type="number" value={form[k] || ''} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                                        style={inputStyle} placeholder="0.00" min="0" />
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: 12 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Reason</label>
                            <textarea value={form.reason || ''} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                                style={{ ...inputStyle, height: 60, resize: 'vertical' }} placeholder="Reason for salary change" />
                        </div>
                        {error && <p style={{ color: '#ef4444', fontSize: 13, margin: '8px 0' }}>{error}</p>}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                            <button onClick={closeModal} style={btnSmall('#94a3b8')}>Cancel</button>
                            <button onClick={createRevision} disabled={saving} style={btnSmall('#6366f1')}>{saving ? 'Saving...' : 'Submit for Approval'}</button>
                        </div>
                    </Modal>
                )}

                {/* Approve/Reject Modal */}
                {modal.open && modal.type === 'approve' && modal.item && (
                    <Modal title="Review Salary Revision" onClose={closeModal}>
                        <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                            <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 16 }}>{modal.item.empname} ({modal.item.empno})</p>
                            <p style={{ margin: '0 0 4px', color: '#64748b' }}>{modal.item.department} • {modal.item.revision_type}</p>
                            <p style={{ margin: '0 0 4px' }}>Effective: <strong>{modal.item.effective_from?.split('T')[0]}</strong></p>
                            <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#6366f1' }}>New Gross: {fmt(modal.item.gross)}</p>
                            <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: 13 }}>{modal.item.reason}</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: '#f1f5f9', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                            {[['Basic', modal.item.basic], ['Grade Pay', modal.item.grade_pay], ['HATA', modal.item.hata],
                            ['Allowance', modal.item.allowance], ['DA', modal.item.da], ['Special', modal.item.special]].map(([l, v]) => (
                                <div key={l}><span style={{ fontSize: 12, color: '#64748b' }}>{l}: </span><strong>{fmt(v)}</strong></div>
                            ))}
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Rejection Reason (required for reject)</label>
                            <textarea value={rejReason} onChange={e => setRejReason(e.target.value)}
                                style={{ ...inputStyle, height: 60, resize: 'vertical' }} placeholder="Enter reason to reject..." />
                        </div>
                        {error && <p style={{ color: '#ef4444', fontSize: 13 }}>{error}</p>}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                            <button onClick={closeModal} style={btnSmall('#94a3b8')}>Cancel</button>
                            <button onClick={() => reject(modal.item.id)} style={btnSmall('#ef4444')}>Reject</button>
                            <button onClick={() => approve(modal.item.id)} style={btnSmall('#16a34a')}>Approve ✓</button>
                        </div>
                    </Modal>
                )}
            </div>
        </DashboardLayout>
    );
}

function Modal({ title, onClose, children }) {
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '90%', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{title}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#94a3b8' }}>×</button>
                </div>
                {children}
            </div>
        </div>
    );
}

const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' };
const btnSmall = (bg) => ({ background: bg, color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 });
