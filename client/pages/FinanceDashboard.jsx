import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';

const API = (path) => `/api${path}`;
const fmt = (n) => '₹' + (parseFloat(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtFull = (n) => '₹' + (parseFloat(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function KPICard({ label, value, sub, color, icon, arrow }) {
    return (
        <div style={{ background: '#fff', borderRadius: 14, padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderTop: `4px solid ${color}`, flex: 1, minWidth: 160 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: color || '#1e293b', marginTop: 6 }}>{value}</div>
                    {sub && <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{sub}</div>}
                </div>
                <div style={{ fontSize: 28 }}>{icon}</div>
            </div>
            {arrow && (
                <div style={{ marginTop: 8, fontSize: 13, color: parseFloat(arrow) >= 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                    {parseFloat(arrow) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(arrow))}%
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

export default function FinanceDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [now] = useState(() => { const d = new Date(); return { month: d.getMonth() + 1, year: d.getFullYear() }; });
    const [filter, setFilter] = useState(now);
    const [autoRefresh, setAutoRefresh] = useState(false);

    const token = () => localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = () => ({ Authorization: `Bearer ${token()}` });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(API(`/finance/dashboard?year=${filter.year}&month=${filter.month}`), { headers: headers() });
            const json = await res.json();
            if (json.success) setData(json.data);
        } catch (e) { console.error(e); }
        setLoading(false);
    }, [filter]);

    useEffect(() => { load(); }, [load]);

    // Auto-refresh every 5 minutes
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', margin: 0 }}>📊 Financial Overview Dashboard</h1>
                        <p style={{ color: '#64748b', margin: '4px 0 0' }}>Income, expenses and payroll in one view</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <select value={filter.month} onChange={e => setFilter(f => ({ ...f, month: parseInt(e.target.value) }))} style={selStyle}>
                            {Array.from({ length: 12 }, (_, i) => ({ v: i + 1, l: new Date(2000, i).toLocaleString('en', { month: 'long' }) }))
                                .map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
                        </select>
                        <input type="number" value={filter.year} onChange={e => setFilter(f => ({ ...f, year: parseInt(e.target.value) }))}
                            style={{ ...selStyle, width: 90 }} />
                        <button onClick={load} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600 }}>
                            🔄 Refresh
                        </button>
                        <label style={{ fontSize: 13, color: '#64748b', cursor: 'pointer' }}>
                            <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} style={{ marginRight: 4 }} />
                            Auto-refresh
                        </label>
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                            <div>Loading financial data...</div>
                        </div>
                    </div>
                ) : !data ? (
                    <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>No data available. Please run income/expense setup first.</div>
                ) : (
                    <>
                        {/* ROW 1: KPI Cards */}
                        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                            <KPICard label="Total Income" value={fmt(data.income?.total)} color="#16a34a" icon="💵" />
                            <KPICard label="Total Expenses" value={fmt(data.totalExpense)} color="#dc2626" icon="💸" />
                            <KPICard
                                label={profit >= 0 ? 'Net Profit' : 'Net Loss'}
                                value={fmt(Math.abs(profit))}
                                color={profit >= 0 ? '#16a34a' : '#dc2626'}
                                icon={profit >= 0 ? '📈' : '📉'}
                                sub={profit >= 0 ? 'Surplus' : 'Deficit'}
                            />
                            <KPICard label="Payroll Cost" value={fmt(data.payrollCost)} color="#f59e0b" icon="👥" sub={`${data.payrollPct}% of total expense`} />
                            <KPICard label="Non-Payroll Expense" value={fmt(data.expense?.total)} color="#6366f1" icon="🏢" sub={`${data.expense?.count} entries`} />
                        </div>

                        {/* ROW 2: Charts */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                            <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                                <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: '#1e293b' }}>📅 Monthly Trend (6 months)</h3>
                                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                                    <LegendItem color="#16a34a" label="Income" />
                                    <LegendItem color="#dc2626" label="Expense" />
                                </div>
                                <TrendBar data={data.monthlyTrend} />
                            </div>

                            <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                                <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: '#1e293b' }}>🗂️ This Month at a Glance</h3>
                                <ProfitLossSummary data={data} />
                            </div>
                        </div>

                        {/* ROW 3: Trend Table */}
                        {data.monthlyTrend?.length > 0 && (
                            <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 24 }}>
                                <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: '#1e293b' }}>📋 Monthly Summary Table</h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc' }}>
                                            {['Month', 'Income', 'Non-Payroll Expense', 'Payroll', 'Net'].map(h => (
                                                <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Month' ? 'left' : 'right', fontWeight: 600, color: '#475569', fontSize: 12 }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.monthlyTrend.map((row, i) => {
                                            const net = (parseFloat(row.income) || 0) - (parseFloat(row.expense) || 0) - (parseFloat(row.payroll) || 0);
                                            const [mm, yy] = (row.month || '').split('-');
                                            const monthLabel = mm ? `${new Date(2000, parseInt(mm) - 1).toLocaleString('en', { month: 'short' })} ${yy}` : row.month;
                                            const isCurrent = row.month === `${String(filter.month).padStart(2, '0')}-${filter.year}`;
                                            return (
                                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: isCurrent ? '#f0fdfa' : i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                                    <td style={{ padding: '10px 14px', fontWeight: isCurrent ? 700 : 400 }}>{monthLabel} {isCurrent ? '← Current' : ''}</td>
                                                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>{fmtFull(row.income)}</td>
                                                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#dc2626' }}>{fmtFull(row.expense)}</td>
                                                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#f59e0b' }}>{fmtFull(row.payroll)}</td>
                                                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: net >= 0 ? '#16a34a' : '#dc2626' }}>{fmtFull(net)}</td>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151' }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
            {label}
        </div>
    );
}

function ProfitLossSummary({ data }) {
    const rows = [
        { label: 'Total Income', value: data.income?.total, color: '#16a34a' },
        { label: 'Payroll Cost', value: data.payrollCost, color: '#f59e0b' },
        { label: 'Other Expenses', value: data.expense?.total, color: '#dc2626' },
        { label: '─ Net Profit/Loss', value: data.netProfit, color: parseFloat(data.netProfit) >= 0 ? '#16a34a' : '#dc2626', bold: true },
    ];

    return (
        <div>
            {rows.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < rows.length - 1 ? '1px solid #f1f5f9' : '2px solid #e2e8f0' }}>
                    <span style={{ fontSize: 14, color: '#374151', fontWeight: r.bold ? 700 : 400 }}>{r.label}</span>
                    <span style={{ fontSize: 14, fontWeight: r.bold ? 800 : 600, color: r.color }}>{fmtFull(r.value)}</span>
                </div>
            ))}
        </div>
    );
}

const selStyle = { padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff' };
