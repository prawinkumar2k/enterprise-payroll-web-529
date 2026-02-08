import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
    Printer,
    Eraser,
    FileText,
    Loader2,
    AlertCircle,
    ChevronLeft
} from "lucide-react";
import { toast } from "sonner";

export default function PayBillDetail() {
    const reportRef = useRef();
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
    const currentYear = String(now.getFullYear());

    const [filters, setFilters] = useState({
        category: "Cheque with PF",
        month: currentMonth,
        year: currentYear,
        withSignature: false,
        paySlip: false,
        bonusPayBill: false
    });

    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const fetchReport = async () => {
        setIsLoading(true);
        const monthYear = `${filters.month}-${filters.year}`;
        try {
            const response = await fetch(`/api/reports/pay-bill?monthYear=${monthYear}&category=${filters.category}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (data.success) {
                setReportData(data.data);
            } else {
                toast.error(data.message);
                setReportData([]);
            }
        } catch (error) {
            toast.error("Failed to fetch report data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [filters.month, filters.year, filters.category]);

    const handlePrint = async () => {
        const monthYear = `${filters.month}-${filters.year}`;
        // Log print action to server
        try {
            await fetch('/api/reports/log-print', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ monthYear, category: filters.category })
            });
        } catch (e) { /* ignore log failure */ }

        window.print();
    };

    const handleClear = () => {
        setFilters({
            ...filters,
            category: "Cheque with PF",
            month: currentMonth,
            year: currentYear,
            withSignature: false,
            paySlip: false,
            bonusPayBill: false
        });
    };

    // Table Helper: Calculate Combined Fields
    const getCombined = (val1, val2) => (parseFloat(val1) || 0) + (parseFloat(val2) || 0);

    return (
        <DashboardLayout activeRoute="reports">
            <div className="flex flex-col h-full bg-gray-100/50 print:bg-white print:h-auto">

                {/* 1. TOP FILTER BAR (Hidden on Print) */}
                <div className="p-4 bg-white border-b border-gray-200 shadow-sm print:hidden">
                    <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Category</span>
                                <select
                                    value={filters.category}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                    className="mt-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="Cheque with PF">Cheque with PF</option>
                                    <option value="Cheque without PF">Cheque without PF</option>
                                    <option value="Cash without PF">Cash without PF</option>
                                </select>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Period</span>
                                <div className="flex gap-2 mt-1">
                                    <select
                                        value={filters.month}
                                        onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        {monthNames.map((m, i) => (
                                            <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={filters.year}
                                        onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        {["2023", "2024", "2025", "2026"].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="h-10 w-px bg-gray-200"></div>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={filters.withSignature}
                                        onChange={(e) => setFilters({ ...filters, withSignature: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                                    />
                                    <span className="text-xs font-bold text-gray-500 group-hover:text-gray-900 transition-colors">With Signature</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={filters.paySlip}
                                        onChange={(e) => setFilters({ ...filters, paySlip: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                                    />
                                    <span className="text-xs font-bold text-gray-500 group-hover:text-gray-900 transition-colors">Pay Slip</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={filters.bonusPayBill}
                                        onChange={(e) => setFilters({ ...filters, bonusPayBill: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                                    />
                                    <span className="text-xs font-bold text-gray-500 group-hover:text-gray-900 transition-colors">Bonus Pay Bill</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleClear}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                <Eraser className="w-4 h-4" /> Clear
                            </button>
                            <button
                                onClick={handlePrint}
                                disabled={reportData.length === 0}
                                className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold shadow-lg shadow-gray-200 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                <Printer className="w-4 h-4" /> Print Report
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. REPORT VIEW AREA */}
                <div className="flex-1 overflow-auto py-8 print:p-0 print:overflow-visible print:bg-white">
                    <div
                        ref={reportRef}
                        className="mx-auto bg-white shadow-2xl print:shadow-none min-h-[29.7cm] w-[21cm] p-[1.5cm] print:p-0 print:m-0 print:w-full"
                    >
                        {/* LEGACY REPORT HEADER */}
                        <div className="text-center mb-8 border-b-2 border-black pb-4">
                            <h1 className="text-2xl font-black uppercase tracking-tight text-black mb-1">
                                {filters.bonusPayBill ? 'BONUS PAY BILL DETAIL REPORT' : 'PAY BILL DETAIL REPORT'}
                            </h1>
                            <div className="flex justify-between items-center mt-4 px-2 text-xs font-bold uppercase tracking-widest text-gray-600">
                                <span>Month: {monthNames[parseInt(filters.month) - 1]} {filters.year}</span>
                                <span>Category: {filters.category}</span>
                                <span className="print:hidden">Sheet: A4 Portrait</span>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Generating Ledger View...</span>
                            </div>
                        ) : reportData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                                <AlertCircle className="w-16 h-16 text-gray-200" />
                                <div className="text-center">
                                    <p className="text-gray-900 font-bold uppercase tracking-tight">No Records Found</p>
                                    <p className="text-xs text-gray-500 mt-1">Select a different period or category.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-visible">
                                <table className="w-full border-collapse border-2 border-black text-[10px] leading-tight font-serif uppercase tracking-tighter">
                                    <thead>
                                        <tr className="bg-gray-50 print:bg-gray-100 border-b-2 border-black">
                                            <th className="border border-black p-1 text-center w-8">S.No</th>
                                            <th className="border border-black p-1 text-center w-12">Emp.No</th>
                                            <th className="border border-black p-1 text-left w-40">Name & Designation</th>
                                            <th className="border border-black p-1 text-right">Basic Pay</th>
                                            <th className="border border-black p-1 text-right">Grade Pay</th>
                                            <th className="border border-black p-1 text-right">PHD</th>
                                            <th className="border border-black p-1 text-right">MPHIL</th>
                                            <th className="border border-black p-1 text-right">Spl. Allow (HA/TA)</th>
                                            {filters.bonusPayBill && <th className="border border-black p-1 text-right">Bonus</th>}
                                            <th className="border border-black p-1 text-right font-black">GROSS</th>
                                            <th className="border border-black p-1 text-right">EPF</th>
                                            <th className="border border-black p-1 text-right">PT</th>
                                            <th className="border border-black p-1 text-right">ESI/M</th>
                                            <th className="border border-black p-1 text-right">Adv/Rec</th>
                                            <th className="border border-black p-1 text-right font-black">Tot Ded</th>
                                            <th className="border border-black p-1 text-right font-black">NET SAL</th>
                                            <th className="border border-black p-1 text-left w-20">Remark</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.map((row, idx) => (
                                            <tr key={row.id} className="border-b border-black break-inside-avoid">
                                                <td className="border border-black p-1 text-center">{idx + 1}</td>
                                                <td className="border border-black p-1 text-center">{row.EMPNO}</td>
                                                <td className="border border-black p-1">
                                                    <div className="font-bold">{row.SNAME}</div>
                                                    <div className="text-[8px] opacity-70 italic">{row.Designation}</div>
                                                </td>
                                                <td className="border border-black p-1 text-right">{parseFloat(row.PAY).toLocaleString()}</td>
                                                <td className="border border-black p-1 text-right">{parseFloat(row.GradePay).toLocaleString()}</td>
                                                <td className="border border-black p-1 text-right">{parseFloat(row.PHD).toLocaleString()}</td>
                                                <td className="border border-black p-1 text-right">{parseFloat(row.MPHIL).toLocaleString()}</td>
                                                <td className="border border-black p-1 text-right">{parseFloat(row.HATA).toLocaleString()}</td>
                                                {filters.bonusPayBill && <td className="border border-black p-1 text-right">{parseFloat(row.Bonus).toLocaleString()}</td>}
                                                <td className="border border-black p-1 text-right font-bold">{parseFloat(row.GROSSPAY).toLocaleString()}</td>
                                                <td className="border border-black p-1 text-right">{parseFloat(row.EPF).toLocaleString()}</td>
                                                <td className="border border-black p-1 text-right">{parseFloat(row.PT).toLocaleString()}</td>
                                                <td className="border border-black p-1 text-right">{getCombined(row.ESI, row.ESIM).toLocaleString()}</td>
                                                <td className="border border-black p-1 text-right">{getCombined(row.Advance, row.RECOVERY).toLocaleString()}</td>
                                                <td className="border border-black p-1 text-right font-bold">{parseFloat(row.TOTDED).toLocaleString()}</td>
                                                <td className="border border-black p-1 text-right font-black">{parseFloat(row.NETSAL).toLocaleString()}</td>
                                                <td className="border border-black p-1 text-[8px]">{row.Remark}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="font-black bg-gray-50 border-t-2 border-black">
                                            <td colSpan={3} className="border border-black p-2 text-right">TOTALS</td>
                                            <td className="border border-black p-1 text-right">
                                                {reportData.reduce((sum, r) => sum + (parseFloat(r.PAY) || 0), 0).toLocaleString()}
                                            </td>
                                            <td className="border border-black p-1 text-right">
                                                {reportData.reduce((sum, r) => sum + (parseFloat(r.GradePay) || 0), 0).toLocaleString()}
                                            </td>
                                            <td className="border border-black p-1 text-right">
                                                {reportData.reduce((sum, r) => sum + (parseFloat(r.PHD) || 0), 0).toLocaleString()}
                                            </td>
                                            <td className="border border-black p-1 text-right">
                                                {reportData.reduce((sum, r) => sum + (parseFloat(r.MPHIL) || 0), 0).toLocaleString()}
                                            </td>
                                            <td className="border border-black p-1 text-right">
                                                {reportData.reduce((sum, r) => sum + (parseFloat(r.HATA) || 0), 0).toLocaleString()}
                                            </td>
                                            {filters.bonusPayBill && (
                                                <td className="border border-black p-1 text-right">
                                                    {reportData.reduce((sum, r) => sum + (parseFloat(r.Bonus) || 0), 0).toLocaleString()}
                                                </td>
                                            )}
                                            <td className="border border-black p-1 text-right">
                                                {reportData.reduce((sum, r) => sum + (parseFloat(r.GROSSPAY) || 0), 0).toLocaleString()}
                                            </td>
                                            <td className="border border-black p-1 text-right">
                                                {reportData.reduce((sum, r) => sum + (parseFloat(r.EPF) || 0), 0).toLocaleString()}
                                            </td>
                                            <td className="border border-black p-1 text-right">
                                                {reportData.reduce((sum, r) => sum + (parseFloat(r.PT) || 0), 0).toLocaleString()}
                                            </td>
                                            <td className="border border-black p-1 text-right">
                                                {reportData.reduce((sum, r) => sum + getCombined(r.ESI, r.ESIM), 0).toLocaleString()}
                                            </td>
                                            <td className="border border-black p-1 text-right">
                                                {reportData.reduce((sum, r) => sum + getCombined(r.Advance, r.RECOVERY), 0).toLocaleString()}
                                            </td>
                                            <td className="border border-black p-1 text-right">
                                                {reportData.reduce((sum, r) => sum + (parseFloat(r.TOTDED) || 0), 0).toLocaleString()}
                                            </td>
                                            <td className="border border-black p-1 text-right">
                                                {reportData.reduce((sum, r) => sum + (parseFloat(r.NETSAL) || 0), 0).toLocaleString()}
                                            </td>
                                            <td className="border border-black p-1"></td>
                                        </tr>
                                    </tfoot>
                                </table>

                                {/* SIGNATURE SECTION */}
                                {filters.withSignature && (
                                    <div className="mt-16 grid grid-cols-3 text-center text-xs font-black uppercase tracking-wider">
                                        <div className="flex flex-col gap-12">
                                            <div className="border-t border-black w-32 mx-auto"></div>
                                            <span>Prepared By</span>
                                        </div>
                                        <div className="flex flex-col gap-12">
                                            <div className="border-t border-black w-32 mx-auto"></div>
                                            <span>Manager Accounts</span>
                                        </div>
                                        <div className="flex flex-col gap-12">
                                            <div className="border-t border-black w-32 mx-auto"></div>
                                            <span>Director / Principal</span>
                                        </div>
                                    </div>
                                )}

                                {/* LEGACY FOOTER INFO */}
                                <div className="mt-12 pt-4 border-t border-gray-100 flex justify-between text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                    <span>System-Generated Report • {new Date().toLocaleString()}</span>
                                    <span>Page 1 of 1</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* PRINT-ONLY STYLES */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        @page {
                            size: A4 portrait;
                            margin: 1cm;
                        }
                        body {
                            background: white !important;
                            color: black !important;
                            -webkit-print-color-adjust: exact;
                        }
                        .print-hidden, nav, aside, header {
                            display: none !important;
                        }
                        .flex, .grid {
                            display: block !important;
                        }
                        table {
                            width: 100% !important;
                            border: 2px solid black !important;
                        }
                        th, td {
                            border: 1px solid black !important;
                        }
                        .shadow-2xl, .shadow-sm {
                            box-shadow: none !important;
                        }
                        tr {
                            page-break-inside: avoid !important;
                        }
                        thead {
                            display: table-header-group !important;
                        }
                        tfoot {
                            display: table-footer-group !important;
                        }
                    }
                `}} />
            </div>
        </DashboardLayout>
    );
}
