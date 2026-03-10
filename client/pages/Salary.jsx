<<<<<<< HEAD
import { useReducer, useEffect, useState } from "react";
=======
import { useState, useEffect, useCallback } from "react";
>>>>>>> 60eb1353e3ebfe73e68f225b57a8ceadc0bc0fee
import DashboardLayout from "@/components/DashboardLayout";
import Pagination from "@/components/Pagination";
import {
    Calculator,
    RefreshCcw,
    Save,
    Gift,
    AlertCircle,
    Loader2,
    ShieldAlert,
    Zap,
    Download,
    Filter,
    Mail,
    Table as TableIcon,
    History
} from "lucide-react";
import { toast } from "sonner";
import { apiPost, apiGet, apiPut, pollJob } from "@/lib/apiClient";

const COLUMN_CONFIG = [
    { key: 'EMPNO', label: 'Emp ID', width: '100px', readonly: true, pin: true },
    { key: 'SNAME', label: 'Name', width: '200px', pin: true },
    { key: 'Designation', label: 'Designation', width: '180px' },
    { key: 'DGroup', label: 'Group', width: '100px' },
    { key: 'NoofDays', label: 'Days', width: '80px' },
    { key: 'LeaveDays', label: 'Leave', width: '80px' },
    { key: 'WorkingDays', label: 'Work', width: '80px', readonly: true },
    { key: 'PAY', label: 'Basic PAY', width: '120px', type: 'number' },
    { key: 'GradePay', label: 'Grade PAY', width: '120px', type: 'number' },
    { key: 'PHD', label: 'PHD', width: '100px', type: 'number' },
    { key: 'MPHIL', label: 'MPHIL', width: '100px', type: 'number' },
    { key: 'HATA', label: 'HATA', width: '100px', type: 'number' },
    { key: 'Allowance', label: 'Allowance', width: '120px', type: 'number' },
    { key: 'DA', label: 'DA', width: '100px', type: 'number' },
    { key: 'SPECIAL', label: 'Special', width: '100px', type: 'number' },
    { key: 'INTERIM', label: 'Interim', width: '100px', type: 'number' },
    { key: 'Bonus', label: 'Bonus', width: '100px', type: 'number' },
    { key: 'GROSSPAY', label: 'GROSS', width: '140px', readonly: true, highlight: 'bg-emerald-500/10 text-emerald-600 font-bold' },
    { key: 'EPF', label: 'EPF', width: '100px', type: 'number' },
    { key: 'ESI', label: 'ESI', width: '100px', type: 'number' },
    { key: 'ESIM', label: 'ESIM', width: '100px', type: 'number' },
    { key: 'IT', label: 'Inc Tax', width: '100px', type: 'number' },
    { key: 'PT', label: 'Prof Tax', width: '100px', type: 'number' },
    { key: 'Advance', label: 'Advance', width: '100px', type: 'number' },
    { key: 'LIC', label: 'LIC', width: '100px', type: 'number' },
    { key: 'RECOVERY', label: 'Recovery', width: '100px', type: 'number' },
    { key: 'OTHERS', label: 'Others', width: '100px', type: 'number' },
    { key: 'TOTDED', label: 'DEDUCT', width: '140px', readonly: true, highlight: 'bg-red-500/10 text-red-600 font-bold' },
    { key: 'NETSAL', label: 'NET PAY', width: '160px', readonly: true, highlight: 'bg-primary/10 text-primary font-black' },
    { key: 'BankName', label: 'Bank', width: '180px' },
    { key: 'AccountNo', label: 'Account No', width: '180px' },
    { key: 'IFSCCode', label: 'IFSC', width: '140px' },
    { key: 'Remark', label: 'Remark', width: '200px' }
];

import { salaryReducer, initialSalaryState } from "@/src/reducers/salaryReducer";

<<<<<<< HEAD
function SalaryControlBar({ month, year, bonusValue, isGenerating, isLoading, isReversing, hasSalaryData, dispatch, fetchSalary, handleGenerate, handleReverse, handleApplyBonus }) {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Processing Period</span>
                    <div className="flex items-center gap-2 mt-1">
                        <select
                            value={month}
                            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'month', value: e.target.value })}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(m => (
                                <option key={m} value={m}>{new Date(2000, parseInt(m) - 1).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                        <select
                            value={year}
                            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'year', value: e.target.value })}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            {["2023", "2024", "2025", "2026"].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="h-10 w-px bg-gray-200 hidden sm:block"></div>
                <div className="flex items-center gap-2">
                    <button onClick={handleGenerate} disabled={isGenerating || isLoading} className="btn-primary py-2 text-sm">
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                        Generate
                    </button>
                    <button onClick={fetchSalary} className="btn-secondary py-2 text-sm">
                        <RefreshCcw className="w-4 h-4" />
                        Refresh
                    </button>
                    {hasSalaryData && (
                        <button onClick={handleReverse} disabled={isReversing || isLoading} className="btn-secondary py-2 text-sm text-red-600 hover:bg-red-50 border-red-200">
                            {isReversing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                            Reverse
                        </button>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-3 ml-auto">
                <div className="flex items-center bg-orange-50 rounded-lg border border-orange-100 p-1">
                    <input
                        type="number"
                        value={bonusValue}
                        onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'bonusValue', value: e.target.value })}
                        placeholder="Bonus"
                        className="bg-transparent border-none outline-none px-2 py-1 text-sm font-bold w-24 text-orange-700 placeholder:text-orange-300"
                    />
                    <button onClick={handleApplyBonus} className="bg-orange-600 text-white p-1.5 rounded-md hover:bg-orange-700 transition">
                        <Gift className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function SalaryTable({ isLoading, salaryData, editingRow, monthYear, dispatch, handleCellChange, handleUpdate, currentPage = 1, pageSize = 100, totalCount = 0 }) {
    return (
        <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
            <div className="overflow-auto flex-1 relative scrollbar-thin scrollbar-thumb-gray-200">
                <table className="w-full border-collapse text-[13px] table-fixed">
                    <thead className="sticky top-0 z-20 bg-gray-900 text-white">
                        <tr>
                            <th className="w-12 p-3 text-center border-r border-gray-800">#</th>
                            {COLUMN_CONFIG.map(col => (
                                <th
                                    key={col.key}
                                    className={`p-3 text-left border-r border-gray-800 uppercase tracking-tighter font-black text-[10px] ${col.pin ? 'sticky left-0 z-30 bg-gray-950' : ''}`}
                                    style={{ width: col.width, left: col.pin ? (col.key === 'EMPNO' ? '48px' : '148px') : undefined }}
                                >
                                    {col.label}
                                </th>
                            ))}
                            <th className="w-24 p-3 sticky right-0 z-30 bg-gray-900 border-l border-gray-800">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={COLUMN_CONFIG.length + 2} className="p-20 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        <p className="text-gray-400 font-medium">Loading salary records...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : salaryData.length === 0 ? (
                            <tr>
                                <td colSpan={COLUMN_CONFIG.length + 2} className="p-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <AlertCircle className="w-12 h-12 text-gray-200" />
                                        <div className="text-center">
                                            <p className="text-gray-900 font-bold">No Data Generated</p>
                                            <p className="text-gray-400 text-sm">Click &apos;Generate&apos; to create salary entries for {monthYear}</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            salaryData.map((row, index) => (
                                <tr key={row.id} className={`hover:bg-primary-50/30 transition-colors ${editingRow === row.id ? 'bg-amber-50/50' : ''}`}>
                                    <td className="p-3 text-center font-bold text-gray-400 border-r border-gray-100 sticky left-0 z-10 bg-white">{(currentPage - 1) * pageSize + index + 1}</td>
                                    {COLUMN_CONFIG.map(col => {
                                        const val = row[col.key];
                                        const isEditable = !col.readonly && editingRow === row.id;
                                        const rowBg = editingRow === row.id ? 'bg-[#fffbeb]' : 'bg-white';
                                        return (
                                            <td
                                                key={col.key}
                                                className={`p-1.5 border-r border-gray-50 truncate ${col.highlight || ''} ${col.pin ? `sticky left-0 z-10 ${rowBg} shadow-[2px_0_5px_rgba(0,0,0,0.02)]` : ''}`}
                                                style={{ width: col.width, left: col.pin ? (col.key === 'EMPNO' ? '48px' : '148px') : undefined }}
                                            >
                                                {isEditable ? (
                                                    <input
                                                        type={col.type || 'text'}
                                                        value={val || ''}
                                                        onChange={(e) => handleCellChange(row.id, col.key, e.target.value)}
                                                        className="w-full bg-white border border-primary/30 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                                                    />
                                                ) : (
                                                    <div className="px-2 py-1 truncate font-medium">
                                                        {col.type === 'number' && val ? '₹' + parseFloat(val).toLocaleString() : val}
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td className={`p-1 px-3 sticky right-0 z-10 border-l border-gray-100 shadow-[-2px_0_5px_rgba(0,0,0,0.02)] ${editingRow === row.id ? 'bg-[#fffbeb]' : 'bg-white'}`}>
                                        <div className="flex items-center gap-2">
                                            {editingRow === row.id ? (
                                                <button onClick={() => handleUpdate(row)} className="w-full bg-primary text-white p-1.5 rounded-md flex items-center justify-center gap-1 hover:bg-primary-700">
                                                    <Save className="w-4 h-4" />
                                                    <span className="text-[10px] font-bold">SAVE</span>
                                                </button>
                                            ) : (
                                                <button onClick={() => dispatch({ type: 'SET_FIELD', field: 'editingRow', value: row.id })} className="w-full bg-gray-50 text-gray-600 p-1.5 rounded-md flex items-center justify-center gap-1 hover:bg-gray-200 border border-gray-200">
                                                    <RefreshCcw className="w-3 h-3" />
                                                    <span className="text-[10px] font-bold">EDIT</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 p-3 px-6 flex items-center justify-between text-[11px] font-black uppercase tracking-tighter text-gray-400">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-50 border border-emerald-100"></div> Net Earnings</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-50 border border-red-100"></div> Deductions</div>
                    <div className="flex items-center gap-2 text-gray-600">TOTAL EMPLOYEES: <span className="text-primary">{totalCount || salaryData.length}</span></div>
                </div>
                <div>SearchFirst Payroll System v1.5 • Secure Enterprise Environment</div>
            </div>
        </div>
    );
}

export default function Salary() {
    const [state, dispatch] = useReducer(salaryReducer, initialSalaryState);
    const { month, year, salaryData, isLoading, isGenerating, editingRow, bonusValue, isReversing } = state;
=======
    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear);
    const [salaryData, setSalaryData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [genProgress, setGenProgress] = useState({ pct: 0, msg: '' });
    const [editingRow, setEditingRow] = useState(null);
    const [bonusValue, setBonusValue] = useState("0");
    const [isReversing, setIsReversing] = useState(false);
>>>>>>> 60eb1353e3ebfe73e68f225b57a8ceadc0bc0fee

    // ── Pagination + Search ──
    const [search, setSearch] = useState('');
    const [dept, setDept] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRows, setTotalRows] = useState(0);
    const LIMIT = 100;

    const monthYear = `${month}-${year}`;
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 100;

<<<<<<< HEAD
    const fetchSalary = async () => {
        setCurrentPage(1); // Reset page whenever a new period is loaded
        dispatch({ type: 'SET_FIELD', field: 'isLoading', value: true });
=======
    const fetchSalary = useCallback(async (pageOverride) => {
        setIsLoading(true);
        const currentPage = pageOverride || page;
>>>>>>> 60eb1353e3ebfe73e68f225b57a8ceadc0bc0fee
        try {
            const params = new URLSearchParams({
                monthYear,
                page: currentPage,
                limit: LIMIT,
            });
<<<<<<< HEAD
            const data = await response.json();
            if (data.success) {
                dispatch({ type: 'SET_SALARY_DATA', data: data.data });
            } else {
                toast.error(data.message);
            }
        } catch {
            toast.error("Failed to fetch salary data");
=======
            if (search) params.set('search', search);
            if (dept) params.set('dept', dept);
            const data = await apiGet(`/api/salary?${params}`);
            setSalaryData(data.data || []);
            setTotalPages(data.totalPages || 1);
            setTotalRows(data.total || 0);
        } catch (error) {
            toast.error(error.message || "Failed to fetch salary data");
>>>>>>> 60eb1353e3ebfe73e68f225b57a8ceadc0bc0fee
        } finally {
            dispatch({ type: 'SET_FIELD', field: 'isLoading', value: false });
        }
    }, [monthYear, page, search, dept]);

    const handleExportExcel = () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const params = new URLSearchParams({ monthYear });
        if (dept) params.set('dept', dept);
        const url = `/api/salary/export?${params}&token=${token}`;
        const a = document.createElement('a');
        a.href = url;
        a.download = `Salary_${monthYear}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('Excel export started!');
    };

    const handleEmailPayslip = async (id) => {
        try {
            const res = await apiPost('/api/salary/email-payslip', { id });
            if (res.success) {
                toast.success(res.message);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error(error.message || "Failed to send email");
        }
    };


    useEffect(() => {
        setPage(1);
        fetchSalary(1);
    }, [monthYear]);

    useEffect(() => {
        fetchSalary();
<<<<<<< HEAD
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [monthYear]);

    const handleGenerate = async () => {
        dispatch({ type: 'SET_FIELD', field: 'isGenerating', value: true });
=======
    }, [page]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setGenProgress({ pct: 0, msg: 'Submitting...' });
>>>>>>> 60eb1353e3ebfe73e68f225b57a8ceadc0bc0fee
        try {
            const { jobId } = await apiPost('/api/salary/generate', { monthYear });
            toast.info('Payroll generation started in background...');
            const result = await pollJob(jobId, `/api/salary/jobs/${jobId}`, {
                intervalMs: 800,
                onProgress: (pct, msg) => setGenProgress({ pct, msg }),
            });
<<<<<<< HEAD
            const data = await response.json();
            if (data.success) {
                toast.success(data.message);
                fetchSalary();
            } else {
                toast.error(data.message);
            }
        } catch {
            toast.error("Generation failed");
        } finally {
            dispatch({ type: 'SET_FIELD', field: 'isGenerating', value: false });
=======
            toast.success(`✅ Salary generated for ${result.count} employees!`);
            setGenProgress({ pct: 100, msg: 'Done!' });
            await fetchSalary();
        } catch (error) {
            toast.error(error.message || 'Generation failed');
        } finally {
            setTimeout(() => {
                setIsGenerating(false);
                setGenProgress({ pct: 0, msg: '' });
            }, 1500);
>>>>>>> 60eb1353e3ebfe73e68f225b57a8ceadc0bc0fee
        }
    };

    const handleUpdate = async (row) => {
        try {
<<<<<<< HEAD
            const response = await fetch(`/api/salary/${row.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(row)
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Record updated");
                // Update local state with recalculated values from server
                dispatch({ type: 'UPDATE_SALARY_ROW', row: data.data });
            } else {
                toast.error(data.message);
            }
        } catch {
            toast.error("Update failed");
=======
            const data = await apiPut(`/api/salary/${row.id}`, row);
            toast.success("Record updated");
            setSalaryData(prev => prev.map(r => r.id === row.id ? data.data : r));
            setEditingRow(null);
        } catch (error) {
            toast.error(error.message || 'Update failed');
>>>>>>> 60eb1353e3ebfe73e68f225b57a8ceadc0bc0fee
        }
    };

    const handleApplyBonus = async () => {
        if (!confirm(`Apply bonus of ₹${bonusValue} to all entries for ${monthYear}?`)) return;
        try {
<<<<<<< HEAD
            const response = await fetch('/api/salary/bonus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ monthYear, bonusAmount: bonusValue })
            });
            const data = await response.json();
            if (data.success) {
                toast.success(data.message);
                fetchSalary();
            } else {
                toast.error(data.message);
            }
        } catch {
            toast.error("Bonus application failed");
=======
            const data = await apiPost('/api/salary/bonus', { monthYear, bonusAmount: bonusValue });
            toast.success(data.message);
            fetchSalary();
        } catch (error) {
            toast.error(error.message || 'Bonus application failed');
>>>>>>> 60eb1353e3ebfe73e68f225b57a8ceadc0bc0fee
        }
    };

    const handleReverse = async () => {
        const reason = prompt(`CRITICAL: You are about to reverse the entire payroll for ${monthYear}.\n\nPlease enter a reason:`);
        if (reason === null) return;
        if (!reason.trim()) { toast.error('Reversal reason is required'); return; }

        dispatch({ type: 'SET_FIELD', field: 'isReversing', value: true });
        try {
<<<<<<< HEAD
            const response = await fetch('/api/salary/reverse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ monthYear, reason })
            });
            const data = await response.json();
            if (data.success) {
                toast.success(data.message);
                dispatch({ type: 'SET_FIELD', field: 'salaryData', value: [] }); // Clear local UI
                fetchSalary();
            } else {
                toast.error(data.message);
            }
        } catch {
            toast.error("Reversal failed");
=======
            const data = await apiPost('/api/salary/reverse', { monthYear, reason });
            toast.success(data.message);
            setSalaryData([]);
            fetchSalary();
        } catch (error) {
            toast.error(error.message || 'Reversal failed');
>>>>>>> 60eb1353e3ebfe73e68f225b57a8ceadc0bc0fee
        } finally {
            dispatch({ type: 'SET_FIELD', field: 'isReversing', value: false });
        }
    };

    const handleCellChange = (rowId, key, value) => {
        dispatch({ type: 'PATCH_CELL', rowId, key, value });
    };

    return (
        <DashboardLayout activeRoute="salary">
<<<<<<< HEAD
            <div className="h-full flex flex-col space-y-4">
                <SalaryControlBar
                    month={month} year={year} bonusValue={bonusValue}
                    isGenerating={isGenerating} isLoading={isLoading} isReversing={isReversing}
                    hasSalaryData={salaryData.length > 0}
                    dispatch={dispatch}
                    fetchSalary={fetchSalary} handleGenerate={handleGenerate}
                    handleReverse={handleReverse} handleApplyBonus={handleApplyBonus}
                />
                <SalaryTable
                    isLoading={isLoading}
                    salaryData={salaryData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)}
                    totalCount={salaryData.length}
                    currentPage={currentPage}
                    pageSize={PAGE_SIZE}
                    editingRow={editingRow}
                    monthYear={monthYear}
                    dispatch={dispatch}
                    handleCellChange={handleCellChange} handleUpdate={handleUpdate}
                />
                <Pagination
                    page={currentPage}
                    totalPages={Math.ceil(salaryData.length / PAGE_SIZE)}
                    total={salaryData.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setCurrentPage}
                />
=======
            <div className="h-full flex flex-col space-y-6 p-4 sm:p-6 animate-in fade-in duration-500">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                            <span className="p-3 bg-primary/10 rounded-2xl text-primary">
                                <Calculator className="w-8 h-8" />
                            </span>
                            Payroll Processing
                        </h1>
                        <p className="text-muted-foreground font-medium mt-1 ml-1">Calculate, review and finalize monthly employee compensation</p>
                    </div>
                </div>

                {/* Control Bar */}
                <div className="bg-card p-6 rounded-[2.5rem] border border-border shadow-sm flex flex-wrap items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Fiscal Period</label>
                            <div className="flex items-center gap-2">
                                <select
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="bg-background border border-border rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                >
                                    {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(m => (
                                        <option key={m} value={m}>{new Date(2000, parseInt(m) - 1).toLocaleString('default', { month: 'long' })}</option>
                                    ))}
                                </select>
                                <select
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="bg-background border border-border rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                >
                                    {["2023", "2024", "2025", "2026"].map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="h-12 w-px bg-border hidden lg:block"></div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || isLoading}
                                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>{genProgress.pct}%</span>
                                    </>
                                ) : (
                                    <><Zap className="w-4 h-4 fill-current" /> Process Payroll</>
                                )}
                            </button>
                            <button
                                onClick={() => fetchSalary()}
                                className="bg-muted text-foreground px-4 py-2.5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-muted/80 transition-all"
                            >
                                <RefreshCcw className="w-4 h-4" />
                                Reload
                            </button>
                            {salaryData.length > 0 && (
                                <button
                                    onClick={handleReverse}
                                    disabled={isReversing || isLoading}
                                    className="bg-red-500/10 text-red-600 px-4 py-2.5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all border border-red-500/20"
                                >
                                    {isReversing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                                    Reverse
                                </button>
                            )}
                        </div>

                        {/* Background Progress Indicator */}
                        {isGenerating && (
                            <div className="hidden xl:flex flex-col gap-1.5 min-w-[240px] animate-in slide-in-from-left duration-300">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-primary truncate max-w-[180px]">{genProgress.msg}</span>
                                    <span className="text-muted-foreground">{genProgress.pct}%</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                                        style={{ width: `${genProgress.pct}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 ml-auto flex-wrap sm:flex-nowrap">
                        <div className="relative group">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Search Employee..."
                                className="pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 w-48 transition-all"
                            />
                        </div>

                        <select
                            value={dept}
                            onChange={e => { setDept(e.target.value); setPage(1); }}
                            className="text-sm bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 font-bold transition-all"
                        >
                            <option value="">All Regions</option>
                            {[...new Set(salaryData.map(r => r.DGroup).filter(Boolean))].map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>

                        <button
                            onClick={handleExportExcel}
                            className="bg-emerald-500/10 text-emerald-600 px-4 py-2.5 rounded-xl border border-emerald-500/20 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                        >
                            <Download className="w-4 h-4" />
                            Excel
                        </button>

                        <div className="flex items-center bg-amber-500/5 rounded-xl border border-amber-500/10 p-1 group">
                            <input
                                type="number"
                                value={bonusValue}
                                onChange={(e) => setBonusValue(e.target.value)}
                                placeholder="Bonus"
                                className="bg-transparent border-none outline-none px-3 py-1 text-sm font-black w-20 text-amber-600 placeholder:text-amber-600/30"
                            />
                            <button
                                onClick={handleApplyBonus}
                                className="bg-amber-600 text-white p-2 rounded-lg hover:bg-amber-700 transition shadow-lg shadow-amber-600/20 active:scale-90"
                            >
                                <Gift className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Salary Worksheet */}
                <div className="flex-1 bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden flex flex-col relative group">
                    {/* Floating Table Tools Indicator */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 bg-foreground/5 backdrop-blur-md rounded-full border border-border flex items-center gap-4 group-hover:scale-100 scale-0 transition-transform duration-500">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <TableIcon className="w-3 h-3" />
                            Active Sheet
                        </div>
                        <div className="h-4 w-px bg-border" />
                        <div className="text-[10px] font-black uppercase tracking-widest text-primary">
                            {monthYear} Ledger
                        </div>
                    </div>

                    <div className="overflow-auto flex-1 relative scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                        <table className="w-full border-collapse text-[13px] table-fixed min-w-[2000px]">
                            <thead className="sticky top-0 z-20">
                                <tr>
                                    <th className="w-16 p-4 text-center bg-muted/80 backdrop-blur-xl border-b border-r border-border font-black text-[10px] uppercase tracking-widest text-muted-foreground sticky left-0 z-50">#</th>
                                    {COLUMN_CONFIG.map(col => (
                                        <th
                                            key={col.key}
                                            className={`p-4 text-left bg-muted/80 backdrop-blur-xl border-b border-r border-border uppercase tracking-widest font-black text-[10px] text-muted-foreground ${col.pin ? 'sticky z-30' : ''}`}
                                            style={{
                                                width: col.width,
                                                left: col.pin ? (col.key === 'EMPNO' ? '64px' : (col.key === 'SNAME' ? '164px' : '0px')) : undefined
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                {col.label}
                                                <Filter className="w-3 h-3 opacity-20" />
                                            </div>
                                        </th>
                                    ))}
                                    <th className="w-32 p-4 sticky right-0 z-50 bg-muted/80 backdrop-blur-xl border-b border-l border-border font-black text-[10px] uppercase tracking-widest text-muted-foreground shadow-[-10px_0_15px_rgba(0,0,0,0.05)]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={COLUMN_CONFIG.length + 2} className="p-32 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                                                <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Synchronizing Ledgers...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : salaryData.length === 0 ? (
                                    <tr>
                                        <td colSpan={COLUMN_CONFIG.length + 2} className="p-32 text-center">
                                            <div className="flex flex-col items-center gap-6">
                                                <div className="w-24 h-24 bg-muted/50 rounded-[2rem] flex items-center justify-center text-4xl">
                                                    📭
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-foreground font-black text-xl mb-1">Vault is Empty</p>
                                                    <p className="text-muted-foreground text-sm font-medium italic">Initiate payroll generation to populate entries for {monthYear}</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    salaryData.map((row, index) => (
                                        <tr
                                            key={row.id}
                                            className={`group/row transition-colors duration-200 ${editingRow === row.id ? 'bg-amber-500/5' : 'hover:bg-muted/30'}`}
                                        >
                                            <td className="p-4 text-center font-black text-muted-foreground border-r border-border sticky left-0 z-20 bg-card group-hover/row:bg-muted/50 transition-colors">
                                                {(page - 1) * LIMIT + index + 1}
                                            </td>
                                            {COLUMN_CONFIG.map(col => {
                                                const val = row[col.key];
                                                const isEditable = !col.readonly && editingRow === row.id;
                                                const rowBg = editingRow === row.id ? 'bg-amber-500/5' : 'bg-card group-hover/row:bg-muted/10 transition-colors';

                                                return (
                                                    <td
                                                        key={col.key}
                                                        className={`p-2 border-r border-border/50 truncate ${col.highlight || 'text-foreground/80'} ${col.pin ? `sticky z-10 ${rowBg} shadow-[4px_0_10px_rgba(0,0,0,0.03)]` : ''}`}
                                                        style={{
                                                            width: col.width,
                                                            left: col.pin ? (col.key === 'EMPNO' ? '64px' : (col.key === 'SNAME' ? '164px' : '0px')) : undefined
                                                        }}
                                                    >
                                                        {isEditable ? (
                                                            <input
                                                                type={col.type || 'text'}
                                                                value={val || ''}
                                                                onChange={(e) => handleCellChange(row.id, col.key, e.target.value)}
                                                                className="w-full bg-background border border-primary/30 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                                                                autoFocus={col.key === 'SNAME'}
                                                            />
                                                        ) : (
                                                            <div className="px-3 py-2 text-sm font-bold tabular-nums">
                                                                {col.type === 'number' ? (val ? '₹' + parseFloat(val).toLocaleString('en-IN') : '₹0') : (val || '-')}
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className={`p-2 px-4 sticky right-0 z-30 border-l border-border bg-card group-hover/row:bg-muted/50 transition-colors shadow-[-4px_0_15px_rgba(0,0,0,0.04)]`}>
                                                <div className="flex items-center gap-2">
                                                    {editingRow === row.id ? (
                                                        <button
                                                            onClick={() => handleUpdate(row)}
                                                            className="flex-1 bg-primary text-primary-foreground p-2 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all h-10 shadow-lg shadow-primary/20"
                                                        >
                                                            <Save className="w-4 h-4" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Commit</span>
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => setEditingRow(row.id)}
                                                                className="flex-1 bg-muted/50 text-foreground/70 p-2 rounded-xl flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all border border-border h-10 group/edit"
                                                            >
                                                                <RefreshCcw className="w-4 h-4 group-hover/edit:rotate-180 transition-transform duration-500" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Adjust</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleEmailPayslip(row.id)}
                                                                className="w-10 h-10 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all border border-blue-500/20 shadow-sm"
                                                                title="Dispatch Payslip via Email"
                                                            >
                                                                <Mail className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Premium Status Bar */}
                    <div className="bg-muted/30 backdrop-blur-md border-t border-border p-4 px-8 flex flex-wrap items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        <div className="flex flex-wrap items-center gap-10">
                            <div className="flex items-center gap-2.5">
                                <div className="w-4 h-4 rounded-md bg-emerald-500 shadow-sm shadow-emerald-500/30" />
                                <span className="text-emerald-600">Earnings Verified</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-4 h-4 rounded-md bg-red-500 shadow-sm shadow-red-500/30" />
                                <span className="text-red-600">Deductions Applied</span>
                            </div>
                            <div className="flex items-center gap-2.5 bg-foreground/5 px-4 py-2 rounded-full border border-border">
                                ACTIVE REELS: <span className="text-primary ml-1.5">{salaryData.length}</span> <span className="mx-2 text-border">/</span> {totalRows} ASSETS
                            </div>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-4 bg-background border border-border rounded-2xl p-1 shadow-sm">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="p-2 rounded-xl hover:bg-muted disabled:opacity-30 transition-all active:scale-90"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-2 px-2">
                                    <span className="text-foreground tracking-widest">Sheet</span>
                                    <span className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">{page}</span>
                                    <span className="text-muted-foreground font-medium lowercase">of</span>
                                    <span className="text-foreground">{totalPages}</span>
                                </div>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                    className="p-2 rounded-xl hover:bg-muted disabled:opacity-30 transition-all active:scale-90"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-muted-foreground/40 hidden lg:flex">
                            <History className="w-3 h-3" />
                            Security Protocol V2.4 Active • {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                </div>
>>>>>>> 60eb1353e3ebfe73e68f225b57a8ceadc0bc0fee
            </div>
        </DashboardLayout>
    );
}
