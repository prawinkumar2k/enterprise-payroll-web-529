import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
    Calculator,
    Search,
    RefreshCcw,
    Save,
    Gift,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Loader2,
    ShieldAlert
} from "lucide-react";
import { toast } from "sonner";

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
    { key: 'GROSSPAY', label: 'GROSS', width: '140px', readonly: true, highlight: 'bg-emerald-50 font-bold' },
    { key: 'EPF', label: 'EPF', width: '100px', type: 'number' },
    { key: 'ESI', label: 'ESI', width: '100px', type: 'number' },
    { key: 'ESIM', label: 'ESIM', width: '100px', type: 'number' },
    { key: 'IT', label: 'Inc Tax', width: '100px', type: 'number' },
    { key: 'PT', label: 'Prof Tax', width: '100px', type: 'number' },
    { key: 'Advance', label: 'Advance', width: '100px', type: 'number' },
    { key: 'LIC', label: 'LIC', width: '100px', type: 'number' },
    { key: 'RECOVERY', label: 'Recovery', width: '100px', type: 'number' },
    { key: 'OTHERS', label: 'Others', width: '100px', type: 'number' },
    { key: 'TOTDED', label: 'DEDUCT', width: '140px', readonly: true, highlight: 'bg-red-50 font-bold' },
    { key: 'NETSAL', label: 'NET PAY', width: '160px', readonly: true, highlight: 'bg-primary-50 text-primary font-black' },
    { key: 'BankName', label: 'Bank', width: '180px' },
    { key: 'AccountNo', label: 'Account No', width: '180px' },
    { key: 'IFSCCode', label: 'IFSC', width: '140px' },
    { key: 'Remark', label: 'Remark', width: '200px' }
];

export default function Salary() {
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
    const currentYear = String(now.getFullYear());

    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear);
    const [salaryData, setSalaryData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [editingRow, setEditingRow] = useState(null);
    const [bonusValue, setBonusValue] = useState("0");
    const [isReversing, setIsReversing] = useState(false);

    const monthYear = `${month}-${year}`;

    const fetchSalary = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/salary?monthYear=${monthYear}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (data.success) {
                setSalaryData(data.data);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to fetch salary data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSalary();
    }, [monthYear]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch('/api/salary/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ monthYear })
            });
            const data = await response.json();
            if (data.success) {
                toast.success(data.message);
                fetchSalary();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Generation failed");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUpdate = async (row) => {
        try {
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
                setSalaryData(prev => prev.map(r => r.id === row.id ? data.data : r));
                setEditingRow(null);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const handleApplyBonus = async () => {
        if (!confirm(`Apply bonus of ₹${bonusValue} to all entries for ${monthYear}?`)) return;

        try {
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
        } catch (error) {
            toast.error("Bonus application failed");
        }
    };

    const handleReverse = async () => {
        const reason = prompt(`CRITICAL: You are about to reverse the entire payroll for ${monthYear}. This cannot be undone easily.\n\nPlease enter a reason for reversal:`);
        if (reason === null) return; // Cancelled
        if (reason.trim() === '') {
            toast.error("Reversal reason is required");
            return;
        }

        setIsReversing(true);
        try {
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
                setSalaryData([]); // Clear local UI
                fetchSalary();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Reversal failed");
        } finally {
            setIsReversing(false);
        }
    };

    const handleCellChange = (rowId, key, value) => {
        setSalaryData(prev => prev.map(row => {
            if (row.id === rowId) {
                return { ...row, [key]: value };
            }
            return row;
        }));
    };

    return (
        <DashboardLayout activeRoute="salary">
            <div className="h-full flex flex-col space-y-4">

                {/* Top Control Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Processing Period</span>
                            <div className="flex items-center gap-2 mt-1">
                                <select
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(m => (
                                        <option key={m} value={m}>{new Date(2000, parseInt(m) - 1).toLocaleString('default', { month: 'long' })}</option>
                                    ))}
                                </select>
                                <select
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
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
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || isLoading}
                                className="btn-primary py-2 text-sm"
                            >
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                                Generate
                            </button>
                            <button
                                onClick={fetchSalary}
                                className="btn-secondary py-2 text-sm"
                            >
                                <RefreshCcw className="w-4 h-4" />
                                Refresh
                            </button>
                            {salaryData.length > 0 && (
                                <button
                                    onClick={handleReverse}
                                    disabled={isReversing || isLoading}
                                    className="btn-secondary py-2 text-sm text-red-600 hover:bg-red-50 border-red-200"
                                >
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
                                onChange={(e) => setBonusValue(e.target.value)}
                                placeholder="Bonus"
                                className="bg-transparent border-none outline-none px-2 py-1 text-sm font-bold w-24 text-orange-700 placeholder:text-orange-300"
                            />
                            <button
                                onClick={handleApplyBonus}
                                className="bg-orange-600 text-white p-1.5 rounded-md hover:bg-orange-700 transition"
                            >
                                <Gift className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Salary Sheet Table */}
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
                                                    <p className="text-gray-400 text-sm">Click 'Generate' to create salary entries for {monthYear}</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    salaryData.map((row, index) => (
                                        <tr
                                            key={row.id}
                                            className={`hover:bg-primary-50/30 transition-colors ${editingRow === row.id ? 'bg-amber-50/50' : ''}`}
                                        >
                                            <td className="p-3 text-center font-bold text-gray-400 border-r border-gray-100 sticky left-0 z-10 bg-white">
                                                {index + 1}
                                            </td>
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
                                                                autoFocus={col.key === 'SNAME'}
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
                                                        <button
                                                            onClick={() => handleUpdate(row)}
                                                            className="w-full bg-primary text-white p-1.5 rounded-md flex items-center justify-center gap-1 hover:bg-primary-700"
                                                        >
                                                            <Save className="w-4 h-4" />
                                                            <span className="text-[10px] font-bold">SAVE</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setEditingRow(row.id)}
                                                            className="w-full bg-gray-50 text-gray-600 p-1.5 rounded-md flex items-center justify-center gap-1 hover:bg-gray-200 border border-gray-200"
                                                        >
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

                    {/* Footer Info Bar */}
                    <div className="bg-gray-50 border-t border-gray-200 p-3 px-6 flex items-center justify-between text-[11px] font-black uppercase tracking-tighter text-gray-400">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-emerald-50 border border-emerald-100"></div> Net Earnings
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-50 border border-red-100"></div> Deductions
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                TOTAL EMPLOYEES: <span className="text-primary">{salaryData.length}</span>
                            </div>
                        </div>
                        <div>
                            SearchFirst Payroll System v1.5 • Secure Enterprise Environment
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
