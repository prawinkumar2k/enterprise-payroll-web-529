import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';

const API = (path) => `/api${path}`;
const fmt = (n) => '₹' + (parseFloat(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtFull = (n) => '₹' + (parseFloat(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function KPICard({ label, value, sub, color, icon, gradient }) {
    return (
        <div style={{ 
            background: '#fff', 
            borderRadius: 16, 
            padding: '20px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
            borderLeft: `5px solid ${color}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
                <div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>{label}</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>{value}</div>
                </div>
                <div style={{ 
                    width: 44, 
                    height: 44, 
                    borderRadius: 12, 
                    background: gradient || `${color}15`, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: 22,
                    boxShadow: gradient ? '0 4px 10px rgba(0,0,0,0.15)' : 'none',
                    color: gradient ? '#fff' : 'inherit'
                }}>
                    {icon}
                </div>
            </div>
            {sub && (
                <div style={{ 
                    fontSize: 12, 
                    color: '#94a3b8', 
                    marginTop: 12, 
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {sub}
                </div>
            )}
        </div>
    );
}

function TrendBar({ data }) {
    if (!data || data.length === 0) return null;
    const maxIncome = Math.max(...data.map(d => parseFloat(d.income) || 0), 1);
    const maxExpense = Math.max(...data.map(d => parseFloat(d.expense) || 0), parseFloat(data[0]?.payroll) || 1, 1);
    const globalMax = Math.max(maxIncome, maxExpense);

    return (
        <div style={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: 8, padding: '0 8px' }}>
            {data.map((d, i) => {
                const inH = ((parseFloat(d.income) || 0) / globalMax * 130).toFixed(0);
                const exH = (((parseFloat(d.expense) || 0) + (parseFloat(d.payroll) || 0)) / globalMax * 130).toFixed(0);
                const label = d.month?.split('-')[0] ? new Date(2000, parseInt(d.month.split('-')[0]) - 1).toLocaleString('en', { month: 'short' }) : d.month;
                return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 140 }}>
                            <div style={{ width: 14, height: `${inH}px`, background: '#16a34a', borderRadius: '3px 3px 0 0', minHeight: 2 }} title={`Income: ${fmt(d.income)}`} />
                            <div style={{ width: 14, height: `${exH}px`, background: '#dc2626', borderRadius: '3px 3px 0 0', minHeight: 2 }} title={`Expense: ${fmt(d.expense)}`} />
                        </div>
                        <div style={{ fontSize: 10, color: '#94a3b8', whiteSpace: 'nowrap' }}>{label}</div>
                    </div>
                );
            })}
        </div>
    );
}

const selStyle = { padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff' };
const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token') || ''}`
});

export default function FinanceDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [now] = useState(() => { const d = new Date(); return { month: d.getMonth() + 1, year: d.getFullYear() }; });
    const [filter, setFilter] = useState(now);
    const [autoRefresh, setAutoRefresh] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(API(`/finance/dashboard?year=${filter.year}&month=${filter.month}`), { headers: getAuthHeaders() });
            const json = await res.json();
            if (json.success) setData(json.data);
        } catch (e) { console.error(e); }
        setLoading(false);
    }, [filter]);

    useEffect(() => {
        const timer = setTimeout(() => { void load(); }, 0);
        return () => clearTimeout(timer);
    }, [load]);

    useEffect(() => {
        if (!autoRefresh) return;
        const t = setInterval(load, 5 * 60 * 1000);
        return () => clearInterval(t);
    }, [autoRefresh, load]);

    const profit = parseFloat(data?.netProfit || 0);

    return (
        <DashboardLayout>
            <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, padding: '0 4px' }}>
                    <div>
                        <div style={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 900, color: '#6366f1', letterSpacing: 1.5, marginBottom: 4 }}>Financial Intelligence</div>
                        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>Financial Overview</h1>
                        <p style={{ color: '#64748b', margin: '4px 0 0', fontWeight: 500 }}>Global income, payroll costs, and operational expenses tracking.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#fff', padding: '10px 16px', borderRadius: 12, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                        <label style={{ fontSize: 11, color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', borderRight: '1px solid #e2e8f0', paddingRight: 12 }}>
                            <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} style={{ marginRight: 6 }} />
                            AUTO-REFRESH
                        </label>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <select value={filter.month} onChange={e => setFilter(f => ({ ...f, month: parseInt(e.target.value) }))} style={selStyle}>
                                {Array.from({ length: 12 }, (_, i) => ({ v: i + 1, l: new Date(2000, i).toLocaleString('en', { month: 'long' }) }))
                                    .map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
                            </select>
                            <input type="number" value={filter.year} onChange={e => setFilter(f => ({ ...f, year: parseInt(e.target.value) }))}
                                style={{ ...selStyle, width: 85 }} />
                        </div>
                        <button onClick={load} style={{ 
                            background: '#0f172a', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: 8, 
                            height: 38, 
                            padding: '0 18px', 
                            cursor: 'pointer', 
                            fontWeight: 700,
                            fontSize: 13,
                        }}>
                             Refresh
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                        <div style={{ width: 40, height: 40, border: '4px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        <div style={{ marginTop: 16, fontSize: 14, color: '#64748b', fontWeight: 600 }}>Calculating financials...</div>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : !data ? (
                    <div style={{ textAlign: 'center', padding: 120, background: '#fff', borderRadius: 20 }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>No Data Available</div>
                    </div>
                ) : (
                    <>
                        {/* ROW 1: KPI Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>
                            <KPICard label="Total Income" value={fmt(data.income?.total)} color="#16a34a" icon="💵" 
                                sub="Total cash inflows" gradient="linear-gradient(135deg, #16a34a 0%, #15803d 100%)" />
                            <KPICard label="Total Expenses" value={fmt(data.totalExpense)} color="#dc2626" icon="💸" 
                                sub="Payroll + Other expenses" gradient="linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)" />
                            <KPICard
                                label={profit >= 0 ? 'Net Profit' : 'Net Loss'}
                                value={fmt(Math.abs(profit))}
                                color={profit >= 0 ? '#059669' : '#e11d48'}
                                icon={profit >= 0 ? '📈' : '📉'}
                                sub={profit >= 0 ? 'Surplus Balance' : 'Current Deficit'}
                                gradient={profit >= 0 ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)'}
                            />
                            <KPICard label="Payroll Cost" value={fmt(data.payrollCost)} color="#f59e0b" icon="👥" 
                                sub={`${data.payrollPct}% of total spend`} gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" />
                            <KPICard label="Non-Payroll" value={fmt(data.expense?.total)} color="#6366f1" icon="🏢" 
                                sub={`${data.expense?.count} ledger entries`} gradient="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" />
                        </div>

                        {/* ROW 2: Charts */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, marginBottom: 28 }}>
                            <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                                <h3 style={{ margin: '0 0 24px', fontSize: 16, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>📅 Monthly Trend Performance</h3>
                                <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                                    <LegendItem color="#16a34a" label="Total Income" />
                                    <LegendItem color="#dc2626" label="Total Expense" />
                                </div>
                                <TrendBar data={data.monthlyTrend} />
                            </div>

                            <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                                <h3 style={{ margin: '0 0 24px', fontSize: 16, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>🗂️ Period Summary</h3>
                                <ProfitLossSummary data={data} />
                            </div>
                        </div>

                        {/* ROW 3: Trend Table */}
                        {data.monthlyTrend?.length > 0 && (
                            <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: 24 }}>
                                <h3 style={{ margin: '0 0 24px', fontSize: 16, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>📋 Financial Log Table</h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc' }}>
                                            {['Accounting Month', 'Income', 'Operational Expense', 'Payroll Disbursement', 'Net Balance'].map(h => (
                                                <th key={h} style={{ padding: '14px 16px', textAlign: h === 'Accounting Month' ? 'left' : 'right', fontWeight: 800, color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody style={{ fontSize: 14 }}>
                                        {data.monthlyTrend.map((row, i) => {
                                            const net = (parseFloat(row.income) || 0) - (parseFloat(row.expense) || 0) - (parseFloat(row.payroll) || 0);
                                            const [mm, yy] = (row.month || '').split('-');
                                            const monthLabel = mm ? `${new Date(2000, parseInt(mm) - 1).toLocaleString('en', { month: 'short' })} ${yy}` : row.month;
                                            const isCurrent = row.month === `${String(filter.month).padStart(2, '0')}-${filter.year}`;
                                            return (
                                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: isCurrent ? '#f0fdf4' : 'transparent' }}>
                                                    <td style={{ padding: '16px', fontWeight: isCurrent ? 800 : 500 }}>{monthLabel} {isCurrent && <span style={{ fontSize: 10, background: '#16a34a', color: '#fff', padding: '2px 6px', borderRadius: 4, marginLeft: 8 }}>CURRENT</span>}</td>
                                                    <td style={{ padding: '16px', textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>{fmtFull(row.income)}</td>
                                                    <td style={{ padding: '16px', textAlign: 'right', color: '#dc2626' }}>{fmtFull(row.expense)}</td>
                                                    <td style={{ padding: '16px', textAlign: 'right', color: '#f59e0b' }}>{fmtFull(row.payroll)}</td>
                                                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 800, color: net >= 0 ? '#16a34a' : '#dc2626' }}>{fmtFull(net)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}

function LegendItem({ color, label }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b', fontWeight: 600 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            {label}
        </div>
    );
}

function ProfitLossSummary({ data }) {
    const rows = [
        { label: 'Revenue Inflow', value: data.income?.total, color: '#16a34a', desc: 'Total incoming funds' },
        { label: 'Staff Payroll', value: data.payrollCost, color: '#f59e0b', desc: 'Direct employee costs' },
        { label: 'Operational Cost', value: data.expense?.total, color: '#dc2626', desc: 'Vendor & utility spend' },
        { label: 'Final Net Result', value: data.netProfit, color: parseFloat(data.netProfit) >= 0 ? '#059669' : '#e11d48', bold: true, desc: 'Profit/Loss after all costs' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {rows.map((r, i) => (
                <div key={i} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '14px 16px', 
                    background: r.bold ? (parseFloat(r.value) >= 0 ? '#f0fdf4' : '#fef2f2') : 'transparent',
                    borderRadius: 12,
                    border: r.bold ? `1px dashed ${parseFloat(r.value) >= 0 ? '#16a34a' : '#e11d48'}40` : 'none',
                    marginBottom: i === 2 ? 8 : 0
                }}>
                    <div>
                        <div style={{ fontSize: 13, color: r.bold ? '#0f172a' : '#475569', fontWeight: r.bold ? 800 : 600 }}>{r.label}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>{r.desc}</div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: r.bold ? 900 : 700, color: r.color }}>{fmtFull(r.value)}</div>
                </div>
            ))}
        </div>
    );
}
