import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import DashboardLayout from "@/components/DashboardLayout";
import Pagination from "@/components/Pagination";
import {
    Calculator,
    RefreshCcw,
    Save,
    Gift,
    ShieldAlert,
    Zap,
    Download,
    Mail,
    Search,
    Loader2
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

export default function Salary() {
    const currentMonth = new Date().getMonth() + 1 <= 9 ? `0${new Date().getMonth() + 1}` : `${new Date().getMonth() + 1}`;
    const currentYear = new Date().getFullYear().toString();

    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear);
    const [salaryData, setSalaryData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isReversing, setIsReversing] = useState(false);
    const [genProgress, setGenProgress] = useState({ pct: 0, msg: '' });
    const [editingRow, setEditingRow] = useState(null);
    const [bonusValue, setBonusValue] = useState("0");

    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRows, setTotalRows] = useState(0);
    const LIMIT = 100;

    const monthYear = `${month}-${year}`;

    const fetchSalary = useCallback(async (pageOverride) => {
        setIsLoading(true);
        const currentPage = pageOverride || page;
        try {
            const params = new URLSearchParams({
                monthYear,
                page: currentPage,
                limit: LIMIT,
            });
            if (debouncedSearch) params.set('search', debouncedSearch);
            const data = await apiGet(`/api/salary?${params}`);
            setSalaryData(data.data || []);
            setTotalPages(data.totalPages || 1);
            setTotalRows(data.total || 0);
        } catch (error) {
            toast.error(error.message || "Failed to fetch salary data");
        } finally {
            setIsLoading(false);
        }
    }, [monthYear, page, debouncedSearch]);

    useEffect(() => {
        setPage(1);
        fetchSalary(1);
    }, [fetchSalary, monthYear, debouncedSearch]);

    useEffect(() => {
        fetchSalary();
    }, [fetchSalary, page]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setGenProgress({ pct: 0, msg: 'Initializing Payload...' });
        try {
            const { jobId } = await apiPost('/api/salary/generate', { monthYear });
            toast.info('Payroll generation started in background...');
            const result = await pollJob(jobId, `/api/salary/jobs/${jobId}`, {
                intervalMs: 800,
                onProgress: (pct, msg) => setGenProgress({ pct, msg }),
            });
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
        }
    };

    const handleUpdate = async (row) => {
        try {
            const data = await apiPut(`/api/salary/${row.id}`, row);
            toast.success("Record updated");
            setSalaryData(prev => prev.map(r => r.id === row.id ? data.data : r));
            setEditingRow(null);
        } catch (error) {
            toast.error(error.message || 'Update failed');
        }
    };

    const handleApplyBonus = async () => {
        if (!confirm(`Apply bonus of ₹${bonusValue} to all entries for ${monthYear}?`)) return;
        try {
            const data = await apiPost('/api/salary/bonus', { monthYear, bonusAmount: bonusValue });
            toast.success(data.message);
            fetchSalary();
        } catch (error) {
            toast.error(error.message || 'Bonus application failed');
        }
    };

    const handleReverse = async () => {
        const reason = prompt(`CRITICAL: Reversing payroll for ${monthYear}.\n\nEnter reason:`);
        if (reason === null) return;
        if (!reason.trim()) { toast.error('Reason required'); return; }

        setIsReversing(true);
        try {
            const data = await apiPost('/api/salary/reverse', { monthYear, reason });
            toast.success(data.message);
            setSalaryData([]);
            fetchSalary();
        } catch (error) {
            toast.error(error.message || 'Reversal failed');
        } finally {
            setIsReversing(false);
        }
    };

    const handleCellChange = (rowId, key, value) => {
        setSalaryData(prev => prev.map(row =>
            row.id === rowId ? { ...row, [key]: value } : row
        ));
    };

    const handleEmailPayslip = async (id) => {
        try {
            const res = await apiPost('/api/salary/email-payslip', { id });
            if (res.success) toast.success(res.message);
            else toast.error(res.message);
        } catch (error) {
            toast.error(error.message || "Failed to send email");
        }
    };

    const handleExportExcel = () => {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({ monthYear });
        const url = `/api/salary/export?${params}&token=${token}`;
        window.open(url, '_blank');
        toast.success('Excel export started!');
    };

    return (
        <DashboardLayout activeRoute="salary">
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
                        <p className="text-muted-foreground font-medium mt-1 ml-1">Calculate and review monthly compensation logs</p>
                    </div>
                </div>

                {/* Control Bar */}
                <div className="bg-card p-6 rounded-[2.5rem] border border-border shadow-sm flex flex-wrap items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="space-y-1.5">
                            <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Period</span>
                            <div className="flex items-center gap-2">
                                <select value={month} onChange={(e) => setMonth(e.target.value)} className="bg-background border border-border rounded-xl px-4 py-2 text-sm font-bold outline-none">
                                    {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(m => (
                                        <option key={m} value={m}>{new Date(2000, parseInt(m) - 1).toLocaleString('default', { month: 'long' })}</option>
                                    ))}
                                </select>
                                <select value={year} onChange={(e) => setYear(e.target.value)} className="bg-background border border-border rounded-xl px-4 py-2 text-sm font-bold outline-none">
                                    {["2023", "2024", "2025", "2026"].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button onClick={handleGenerate} disabled={isGenerating || isLoading} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-2xl font-black uppercase text-xs shadow-lg flex items-center gap-2 disabled:opacity-50">
                                {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> {genProgress.pct}%</> : <><Zap className="w-4 h-4" /> Process</>}
                            </button>
                            <button onClick={() => fetchSalary()} className="bg-muted px-4 py-2.5 rounded-2xl font-black uppercase text-xs flex items-center gap-2">
                                <RefreshCcw className="w-4 h-4" /> Reload
                            </button>
                            {salaryData.length > 0 && (
                                <button onClick={handleReverse} disabled={isReversing || isLoading} className="bg-red-500/10 text-red-600 px-4 py-2.5 rounded-2xl font-black uppercase text-xs flex items-center gap-2 border border-red-500/20">
                                    {isReversing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />} Reverse
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search..." className="pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl w-48" />
                        </div>
                        <button onClick={handleExportExcel} className="bg-emerald-500/10 text-emerald-600 px-4 py-2.5 rounded-xl border border-emerald-500/20 font-black uppercase text-[10px] flex items-center gap-2 shadow-sm">
                            <Download className="w-4 h-4" /> Excel
                        </button>
                        <div className="flex items-center bg-amber-500/5 rounded-xl border border-amber-500/10 p-1">
                            <input type="number" value={bonusValue} onChange={(e) => setBonusValue(e.target.value)} placeholder="Bonus" className="bg-transparent border-none outline-none px-3 py-1 text-sm font-black w-20 text-amber-600" />
                            <button onClick={handleApplyBonus} className="bg-amber-600 text-white p-2 rounded-lg"><Gift className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>

                {/* Salary Worksheet */}
                <div className="flex-1 bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden flex flex-col relative">
                    <div className="overflow-auto flex-1 relative scrollbar-thin">
                        <table className="w-full border-collapse text-[13px] table-fixed min-w-[2000px]">
                            <thead className="sticky top-0 z-20">
                                <tr>
                                    <th className="w-16 p-4 text-center bg-muted/90 backdrop-blur-xl border-b border-r border-border font-black text-[10px] uppercase text-muted-foreground sticky left-0 z-50">#</th>
                                    {COLUMN_CONFIG.map(col => (
                                        <th key={col.key} className={`p-4 text-left bg-muted/90 backdrop-blur-xl border-b border-r border-border uppercase font-black text-[10px] text-muted-foreground ${col.pin ? 'sticky z-30' : ''}`} style={{ width: col.width, left: col.pin ? (col.key === 'EMPNO' ? '64px' : (col.key === 'SNAME' ? '164px' : '0px')) : undefined }}>
                                            {col.label}
                                        </th>
                                    ))}
                                    <th className="w-32 p-4 sticky right-0 z-50 bg-muted/90 backdrop-blur-xl border-b border-l border-border font-black text-[10px] uppercase text-muted-foreground shadow-[-10px_0_15px_rgba(0,0,0,0.05)]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {isLoading ? (
                                    <tr><td colSpan={COLUMN_CONFIG.length + 2} className="p-32 text-center"><Loader2 className="w-10 h-10 animate-spin text-primary inline-block" /></td></tr>
                                ) : salaryData.length === 0 ? (
                                    <tr><td colSpan={COLUMN_CONFIG.length + 2} className="p-32 text-center text-muted-foreground font-bold">No Data for {monthYear}</td></tr>
                                ) : (
                                    salaryData.map((row, index) => (
                                        <tr key={row.id} className={`hover:bg-muted/30 ${editingRow === row.id ? 'bg-amber-500/5' : ''}`}>
                                            <td className="p-4 text-center font-black text-muted-foreground border-r border-border sticky left-0 z-20 bg-card">{(page - 1) * LIMIT + index + 1}</td>
                                            {COLUMN_CONFIG.map(col => {
                                                const val = row[col.key];
                                                const isEditable = !col.readonly && editingRow === row.id;
                                                const rowBg = editingRow === row.id ? 'bg-amber-500/5' : 'bg-card group-hover:bg-muted/10';
                                                return (
                                                    <td key={col.key} className={`p-2 border-r border-border/50 truncate ${col.highlight || 'text-foreground/80'} ${col.pin ? `sticky z-10 ${rowBg} shadow-[4px_0_10px_rgba(0,0,0,0.03)]` : ''}`} style={{ width: col.width, left: col.pin ? (col.key === 'EMPNO' ? '64px' : (col.key === 'SNAME' ? '164px' : '0px')) : undefined }}>
                                                        {isEditable ? (
                                                            <input type={col.type || 'text'} value={val || ''} onChange={(e) => handleCellChange(row.id, col.key, e.target.value)} className="w-full bg-background border border-primary/30 rounded-lg px-3 py-2 text-sm font-bold" />
                                                        ) : (
                                                            <div className="px-3 py-2 text-sm font-bold tabular-nums">
                                                                {col.type === 'number' ? (val ? '₹' + parseFloat(val).toLocaleString('en-IN') : '₹0') : (val || '-')}
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className="p-2 px-4 sticky right-0 z-30 border-l border-border bg-card shadow-[-4px_0_15px_rgba(0,0,0,0.04)]">
                                                <div className="flex items-center gap-2">
                                                    {editingRow === row.id ? (
                                                        <button onClick={() => handleUpdate(row)} className="flex-1 bg-primary text-primary-foreground p-2 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all h-10 shadow-lg shadow-primary/20">
                                                            <Save className="w-4 h-4" /> Commit
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => setEditingRow(row.id)} className="flex-1 bg-muted/50 text-foreground/70 p-2 rounded-xl flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all border border-border h-10">
                                                                <RefreshCcw className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleEmailPayslip(row.id)} className="w-10 h-10 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white shadow-sm transition-all">
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
                </div>

                <div className="mt-auto">
                    <Pagination page={page} totalPages={totalPages} total={totalRows} pageSize={LIMIT} onPageChange={setPage} />
                </div>
            </div>
        </DashboardLayout>
    );
}
