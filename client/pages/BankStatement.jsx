import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useSettings } from "../context/SettingsContext"; // Import Global Settings
import {
    Printer,
    Home,
    Loader2,
    AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PayBillToolbar from "../components/PayBillToolbar";
import { Card } from "@/components/ui/card";
import { paginateData, REPORT_CONFIGS, getMonthName, p, fmt } from "../utils/printEngine";

export default function BankStatement() {
    const navigate = useNavigate();
    const { settings } = useSettings(); // Use Global Settings for Title & Org Name
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
    const currentYear = String(now.getFullYear());

    const [filters, setFilters] = useState({
        category: "ALL",
        month: currentMonth,
        year: currentYear,
        withSignature: true,
        paySlip: false,
        bonusPayBill: false
    });

    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const rowsPerPage = REPORT_CONFIGS.BANK_STATEMENT.rowsPerPage;

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const fetchReport = async () => {
        setIsLoading(true);
        const monthYear = `${filters.month}-${filters.year}`;
        try {
            const response = await fetch(`/api/reports/bank-statement?monthYear=${monthYear}&category=${filters.category}&bonus=${filters.bonusPayBill}`, {
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
            toast.error("Failed to fetch bank statement");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [filters.month, filters.year, filters.category, filters.bonusPayBill]);

    const handlePrint = () => {
        navigate('/print-report', {
            state: {
                data: reportData,
                reportType: 'BANK_STATEMENT',
                filters: filters,
                orientation: 'portrait'
            }
        });
    };
    const handleClear = () => {
        setFilters({
            ...filters,
            category: "ALL",
            month: currentMonth,
            year: currentYear,
            bonusPayBill: false
        });
    };

    const totalBank = useMemo(() => {
        return reportData.reduce((s, r) => s + p(r.NET_PAYABLE), 0);
    }, [reportData]);

    const pages = useMemo(() => {
        return paginateData(reportData, rowsPerPage);
    }, [reportData, rowsPerPage]);

    return (
        <DashboardLayout activeRoute="reports">
            <div className="flex flex-col h-full bg-gray-100/50">
                <div className="flex items-center gap-4 bg-white border-b px-6 py-2 no-print shadow-sm z-10">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-primary transition-colors border rounded-md"
                    >
                        <Home className="w-4 h-4" />
                        BACK
                    </button>
                    <div className="h-4 w-px bg-gray-300 mx-2" />
                    <PayBillToolbar
                        filters={filters}
                        setFilters={setFilters}
                        handleClear={handleClear}
                        handlePrint={handlePrint}
                        hasData={reportData.length > 0}
                        isAbstract={false}
                    />
                </div>

                {/* SCREEN ONLY VIEW */}
                <div className="flex-1 overflow-auto p-6 no-print">
                    <div className="bg-white rounded-xl shadow-sm border p-6 min-w-[800px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Bank Statement Preview</h3>
                            <div className="flex gap-4 items-center">
                                <div className="text-sm text-gray-500">Record Count: <span className="font-bold text-gray-900">{reportData.length}</span></div>
                                <div className="text-sm text-gray-500">Total Amount: <span className="font-bold text-green-600">{fmt(totalBank)}</span></div>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-64 gap-4">
                                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                <span className="text-sm font-bold text-gray-400">Compiling Statement...</span>
                            </div>
                        ) : reportData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 gap-4 opacity-50">
                                <AlertCircle className="w-16 h-16 text-gray-200" />
                                <p className="text-gray-900 font-bold uppercase">No Records Found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="w-full text-[12px]">
                                    <thead className="bg-gray-50 border-b">
                                        <tr className="divide-x">
                                            <th className="px-3 py-3 text-left">S.N</th>
                                            <th className="px-3 py-3 text-left">EMP NO</th>
                                            <th className="px-3 py-3 text-left">EMPLOYEE NAME</th>
                                            <th className="px-3 py-3 text-left text-indigo-700">BANK A/C NUMBER</th>
                                            <th className="px-3 py-3 text-right font-bold">AMOUNT (RS.)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {reportData.map((row, idx) => (
                                            <tr key={idx} className="divide-x hover:bg-gray-50/50">
                                                <td className="px-3 py-2 text-gray-400">{idx + 1}</td>
                                                <td className="px-3 py-2 font-mono">{row.EMPNO}</td>
                                                <td className="px-3 py-2 font-bold text-gray-700">{row.SNAME}</td>
                                                <td className="px-3 py-2 font-mono text-indigo-600">{row.BankAcNo || '----------'}</td>
                                                <td className="px-3 py-2 text-right font-bold text-green-600">{fmt(row.NET_PAYABLE)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
