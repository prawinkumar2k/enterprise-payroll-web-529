import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
    Printer,
    Home,
    Loader2,
    AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { paginateData, REPORT_CONFIGS } from "../utils/printEngine";

export default function StaffReport() {
    const navigate = useNavigate();
    const [staffData, setStaffData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState({
        category: "ALL",
        status: "WORKING"
    });

    const categories = ["ALL", "TEACHING", "NON-TEACHING", "MANAGEMENT"];
    const rowsPerPage = REPORT_CONFIGS.STAFF_MASTER.rowsPerPage;

    const fetchStaff = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/reports/staff-master?category=${filters.category}&status=${filters.status}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (data.success) {
                setStaffData(data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch staff data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, [filters.category, filters.status]);

    const handlePrint = () => {
        navigate('/print-report', {
            state: {
                data: staffData,
                reportType: 'STAFF_MASTER',
                filters: filters,
                orientation: 'portrait'
            }
        });
    };

    // Manual Pagination Logic
    const pages = useMemo(() => {
        return paginateData(staffData, rowsPerPage);
    }, [staffData, rowsPerPage]);

    // Helper to format date
    const fDate = (d) => {
        if (!d) return '---';
        return new Date(d).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <DashboardLayout activeRoute="staff-report">
            <div className="flex flex-col h-full bg-gray-100/50">
                {/* TOOLBAR - HIDDEN DURING PRINT BY .no-print */}
                <div className="flex items-center justify-between bg-white border-b px-6 py-3 no-print shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-primary transition-colors border rounded-md">
                            <Home className="w-4 h-4" /> BACK
                        </button>
                        <div className="h-4 w-px bg-gray-300 mx-2" />
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            className="bg-white border rounded px-3 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="bg-white border rounded px-3 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="WORKING">ACTIVE STAFF</option>
                            <option value="LEFT">LEFT STAFF</option>
                        </select>
                    </div>
                    <button onClick={handlePrint} disabled={staffData.length === 0} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                        <Printer className="w-4 h-4" /> Print Report
                    </button>
                </div>

                {/* SCREEN ONLY DATA VIEW */}
                <Card className="flex-1 overflow-auto bg-white p-6 no-print">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">REGISTER PREVIEW</h3>
                        <Badge variant="outline">{staffData.length} records found</Badge>
                    </div>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <span className="text-sm font-bold text-gray-400">Loading Register...</span>
                        </div>
                    ) : staffData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4 opacity-50">
                            <AlertCircle className="w-16 h-16 text-gray-200" />
                            <p className="text-gray-900 font-bold uppercase">No Staff Records Found</p>
                        </div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left">S.NO</th>
                                        <th className="px-4 py-3 text-left">EMP NO</th>
                                        <th className="px-4 py-3 text-left">NAME & DESIGNATION</th>
                                        <th className="px-4 py-3 text-left">DEPARTMENT</th>
                                        <th className="px-4 py-3 text-left">JOIN DATE</th>
                                        <th className="px-4 py-3 text-left">MOBILE</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {staffData.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3">{idx + 1}</td>
                                            <td className="px-4 py-3 font-mono text-xs">{row.EMPNO}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-bold">{row.SNAME}</div>
                                                <div className="text-[10px] text-gray-500 uppercase">{row.DESIGNATION || 'OFFICER'}</div>
                                            </td>
                                            <td className="px-4 py-3 text-xs">{row.DepartmentName || row.Category || '---'}</td>
                                            <td className="px-4 py-3 text-xs">{fDate(row.DOJ || row.JDATE)}</td>
                                            <td className="px-4 py-3 font-mono text-xs">{row.Mobile || '---'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    );
}
