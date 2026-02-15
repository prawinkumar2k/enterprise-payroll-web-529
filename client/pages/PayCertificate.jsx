import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
    Printer,
    Home,
    Loader2,
    AlertCircle,
    Search,
    User
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getMonthName } from "../utils/printEngine";
import PrintPage from "../components/print/PrintPage";
import ReportHeader from "../components/print/ReportHeader";
import ReportFooter from "../components/print/ReportFooter";

export default function PayCertificate() {
    const navigate = useNavigate();
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
    const currentYear = String(now.getFullYear());

    const [filters, setFilters] = useState({
        empNo: "",
        month: currentMonth,
        year: currentYear
    });

    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [certificateData, setCertificateData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    useEffect(() => {
        const fetchEmployees = async () => {
            setIsSearching(true);
            try {
                const response = await fetch(`/api/reports/search-employees`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await response.json();
                if (data.success) setEmployees(data.data);
            } catch (error) {
                console.error("Failed to fetch employees");
            } finally {
                setIsSearching(false);
            }
        };
        fetchEmployees();
    }, []);

    const handleSearch = async (val) => {
        setSearchTerm(val);
        if (val.length < 2 && val !== "") return;
        setIsSearching(true);
        try {
            const response = await fetch(`/api/reports/search-employees?query=${val}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (data.success) setEmployees(data.data);
        } catch (error) {
            console.error("Search failed");
        } finally {
            setIsSearching(false);
        }
    };

    const fetchCertificate = async () => {
        if (!filters.empNo) return;
        setIsLoading(true);
        setCertificateData(null);
        const monthYear = `${filters.month}-${filters.year}`;
        try {
            const response = await fetch(`/api/reports/pay-certificate?monthYear=${monthYear}&empNo=${filters.empNo}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (data.success) setCertificateData(data.data);
            else toast.error(data.message);
        } catch (error) {
            toast.error("Failed to fetch Pay Certificate");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (filters.empNo) fetchCertificate();
    }, [filters.empNo, filters.month, filters.year]);

    const handlePrint = () => {
        if (!certificateData) return;
        navigate('/print-report', {
            state: {
                data: [certificateData], // Wrap in array for pagination engine
                reportType: 'PAY_CERTIFICATE',
                filters: filters,
                orientation: 'portrait'
            }
        });
    };

    const p = (val) => parseFloat(val) || 0;
    const fmt = (val) => p(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const { settings } = useSettings();
    const title = settings.title_pay_certificate || "PAY CERTIFICATE";

    return (
        <DashboardLayout activeRoute="reports">
            <div className="flex flex-col h-full bg-gray-100/50">
                {/* TOOLBAR */}
                <div className="flex items-center justify-between bg-white border-b px-6 py-3 no-print shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-primary transition-colors border rounded-md">
                            <Home className="w-3.5 h-3.5" /> BACK
                        </button>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Employee..."
                                className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            {searchTerm && employees.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                                    {employees.map(emp => (
                                        <button key={emp.EMPNO} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex flex-col" onClick={() => { setFilters({ ...filters, empNo: emp.EMPNO }); setSearchTerm(""); }}>
                                            <span className="font-bold">{emp.SNAME}</span>
                                            <span className="text-xs text-gray-500">{emp.EMPNO} - {emp.Designation}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={filters.month}
                                onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                                className="bg-white border rounded px-2 py-1 text-sm outline-none font-bold"
                            >
                                {monthNames.map((m, i) => <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>)}
                            </select>
                            <select
                                value={filters.year}
                                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                className="bg-white border rounded px-2 py-1 text-sm outline-none font-bold"
                            >
                                {["2024", "2025", "2026"].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                    <button onClick={handlePrint} disabled={!certificateData} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all">
                        <Printer className="w-4 h-4" /> Print
                    </button>
                </div>

                {/* LIVE DOCUMENT PREVIEW */}
                {/* PRINT ENGINE PREVIEW */}
                <div className="flex-1 overflow-auto bg-gray-100 print-engine-preview">
                    {!filters.empNo ? (
                        <div className="flex flex-col items-center justify-center h-64 opacity-50 no-print">
                            <User className="w-16 h-16 text-gray-200 mb-4" />
                            <p className="text-gray-900 font-bold uppercase tracking-widest text-xs">Search for an employee to view certificate</p>
                        </div>
                    ) : isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4 no-print">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Generating Certificate...</span>
                        </div>
                    ) : !certificateData ? (
                        <div className="flex flex-col items-center justify-center h-64 opacity-50 no-print">
                            <AlertCircle className="w-16 h-16 text-gray-200 mb-4" />
                            <p className="text-gray-900 font-bold uppercase text-xs">No records for this month</p>
                        </div>
                    ) : (
                        <div className="print-report-wrapper">
                            <PrintPage
                                pageNumber={1}
                                totalPages={1}
                                orientation="portrait"
                                header={
                                    <ReportHeader
                                        reportTitle={title}
                                    />
                                }
                            >
                                <div className="certificate-body mt-10 text-[11pt] leading-relaxed">
                                    <p className="mb-6">Date: {new Date().toLocaleDateString('en-IN')}</p>

                                    <p className="mb-4">This is to certify that Mr./Ms. <strong className="underline decoration-2">{certificateData.SNAME}</strong> (Emp No: {certificateData.EMPNO}) is working as <strong className="uppercase">{certificateData.Designation || certificateData.DESIGNATION}</strong> in our institution.</p>

                                    <p className="mb-8 font-medium">The following are the salary details for the month of <strong>{getMonthName(filters.month)} {filters.year}</strong>:</p>

                                    <div className="grid grid-cols-2 border-2 border-black">
                                        <div className="border-r-2 border-black">
                                            <table className="ledger-table !border-none">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b-2 border-black">
                                                        <th className="text-left !border-none">EMOLUMENTS</th>
                                                        <th className="text-right !border-none">AMOUNT</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="!h-8"><td className="text-left !border-none">BASIC PAY</td><td className="text-right !border-none">{fmt(p(certificateData.PAY) + p(certificateData.GradePay))}</td></tr>
                                                    <tr className="!h-8"><td className="text-left !border-none">D.A.</td><td className="text-right !border-none">{fmt(certificateData.DA)}</td></tr>
                                                    <tr className="!h-8"><td className="text-left !border-none">H.A./T.A.</td><td className="text-right !border-none">{fmt(certificateData.HATA)}</td></tr>
                                                    <tr className="!h-8"><td className="text-left !border-none">SPL. ALLOWANCE</td><td className="text-right !border-none">{fmt(certificateData.SPECIAL)}</td></tr>
                                                    <tr className="!h-8 font-bold border-t-2 border-black"><td className="text-left !border-none">GROSS PAY</td><td className="text-right !border-none">{fmt(certificateData.GROSSPAY)}</td></tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div>
                                            <table className="ledger-table !border-none">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b-2 border-black">
                                                        <th className="text-left !border-none">DEDUCTIONS</th>
                                                        <th className="text-right !border-none">AMOUNT</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="!h-8"><td className="text-left !border-none">EPF</td><td className="text-right !border-none">{fmt(certificateData.EPF)}</td></tr>
                                                    <tr className="!h-8"><td className="text-left !border-none">ESI</td><td className="text-right !border-none">{fmt(certificateData.ESI)}</td></tr>
                                                    <tr className="!h-8"><td className="text-left !border-none">P.TAX</td><td className="text-right !border-none">{fmt(certificateData.PT)}</td></tr>
                                                    <tr className="!h-8"><td className="text-left !border-none">LIC / OTHERS</td><td className="text-right !border-none">{fmt(p(certificateData.LIC) + p(certificateData.Advance) + p(certificateData.OTHERS))}</td></tr>
                                                    <tr className="!h-8 font-bold border-t-2 border-black"><td className="text-left !border-none">TOTAL DED.</td><td className="text-right !border-none">{fmt(certificateData.TOTDED)}</td></tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end p-4 bg-gray-50 border-2 border-black">
                                        <div className="flex gap-8 items-baseline">
                                            <span className="font-bold text-gray-700">NET SALARY PAYABLE :</span>
                                            <span className="text-xl font-black italic underline decoration-2">Rs. {fmt(certificateData.NETSAL)}</span>
                                        </div>
                                    </div>

                                    <div className="mt-20 flex justify-end px-10">
                                        <div className="text-center">
                                            <div className="min-h-[60px]"></div>
                                            <p className="font-black border-t-2 border-black pt-2 uppercase tracking-widest">{settings.sig_4_label || "PRINCIPAL"}</p>
                                        </div>
                                    </div>
                                </div>
                            </PrintPage>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
