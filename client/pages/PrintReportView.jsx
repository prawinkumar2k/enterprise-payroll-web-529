import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    paginateData,
    REPORT_CONFIGS,
    getMonthName,
    p,
    fmt
} from '../utils/printEngine';
import PrintPage from '../components/print/PrintPage';
import ReportHeader from '../components/print/ReportHeader';
import ReportFooter from '../components/print/ReportFooter';
import { Loader2 } from 'lucide-react';

import { useSettings } from '../context/SettingsContext';

/**
 * HIGH-PERFORMANCE PRINT VIEW
 * Implements staged/batched rendering for 100+ page reports.
 * Driven entirely by System Configuration (Settings).
 */
const PrintReportView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { settings } = useSettings();

    const {
        data,
        reportType,
        filters,
        orientation: initialOrientation,
        config: customConfig
    } = location.state || {};

    // Get configuration from central engine
    const defaultConfig = REPORT_CONFIGS[reportType] || { rowsPerPage: 20, title: 'REPORT', orientation: 'portrait' };

    // ORIENTATION LOGIC: 
    // 1. Check if report is wide (Table columns > 8) -> Force Landscape
    // 2. Otherwise check settings
    // 3. Otherwise use default
    const isWideReport = ['PAY_BILL', 'STAFF_MASTER', 'ATTENDANCE_SUMMARY', 'PAY_BILL_ABSTRACT', 'ABSTRACT_2'].includes(reportType);
    const orientation = isWideReport ? 'landscape' : (settings[`print_${reportType.toLowerCase()}_orientation`] || initialOrientation || defaultConfig.orientation);

    // Dynamic Title Mapping from settings
    const titleKey = `title_${reportType.toLowerCase()}`;
    const reportTitle = settings[titleKey] || defaultConfig.title;

    const config = customConfig || { ...defaultConfig, title: reportTitle, orientation };
    const rowsPerPage = config.rowsPerPage;

    const [renderedPages, setRenderedPages] = useState([]);
    const [batchIndex, setBatchIndex] = useState(0);
    const [isRendering, setIsRendering] = useState(true);

    // 1. Prepare all pages in memory first (Data Only)
    const allPages = useMemo(() => {
        if (!data) return [];
        return paginateData(data, rowsPerPage);
    }, [data, rowsPerPage]);

    // 1.5 Calculate Totals for Summary Rows
    const totals = useMemo(() => {
        if (!data) return {};
        switch (reportType) {
            case 'PAY_BILL':
                return data.reduce((acc, r) => {
                    acc.gross += p(r.GROSSPAY);
                    acc.net += p(r.NETSAL);
                    acc.epf += p(r.EPF);
                    acc.ded += p(r.TOTDED);
                    return acc;
                }, { gross: 0, net: 0, epf: 0, ded: 0 });
            case 'ABSTRACT_1':
                return data.reduce((acc, r) => {
                    acc.gross += p(r.GrossPay);
                    acc.net += p(r.NetPay);
                    acc.epf += r.EPF ? p(r.EPF) : 0;
                    acc.esi += r.ESI ? p(r.ESI) : 0;
                    acc.it += r.IT ? p(r.IT) : 0;
                    return acc;
                }, { gross: 0, net: 0, epf: 0, esi: 0, it: 0 });
            case 'ABSTRACT_2':
                return data.reduce((acc, r) => {
                    acc.gross += p(r.GROSS);
                    acc.net += p(r.NET);
                    acc.bank += p(r.ByBank);
                    acc.cash += p(r.ByCash);
                    return acc;
                }, { gross: 0, net: 0, bank: 0, cash: 0 });
            case 'PAY_BILL_ABSTRACT':
                return data.reduce((acc, r) => {
                    acc.gross += p(r.GROSSPAY);
                    acc.net += p(r.NETSAL);
                    acc.epf += p(r.EPF);
                    acc.esi += (p(r.ESI) + p(r.ESIM));
                    return acc;
                }, { gross: 0, net: 0, epf: 0, esi: 0 });
            case 'BANK_STATEMENT':
                return data.reduce((acc, r) => {
                    acc.net += p(r.NET_PAYABLE || r.NETSAL || r.NetSalary);
                    return acc;
                }, { net: 0 });
            default: return {};
        }
    }, [data, reportType]);

    const batchSize = 5; // Render 5 pages at a time for stability

    // 2. STAGED RENDERING LOGIC
    useEffect(() => {
        // Apply orientation class to body for CSS targeting
        document.body.classList.add(orientation);
        return () => document.body.classList.remove(orientation);
    }, [orientation]);

    useEffect(() => {
        if (!allPages.length) {
            if (!data) navigate(-1); // Safety return
            return;
        }

        if (batchIndex * batchSize < allPages.length) {
            const timer = setTimeout(() => {
                const nextBatchStart = batchIndex * batchSize;
                const nextBatchEnd = Math.min(nextBatchStart + batchSize, allPages.length);
                const nextBatch = allPages.slice(nextBatchStart, nextBatchEnd);

                setRenderedPages(prev => [...prev, ...nextBatch]);
                setBatchIndex(prev => prev + 1);
            }, 100); // 100ms pause for browser paint

            return () => clearTimeout(timer);
        } else {
            // All pages rendered to DOM
            setIsRendering(false);
        }
    }, [batchIndex, allPages, data, navigate]);

    // 3. TRIGGER PRINT AFTER BATCH COMPLETION
    useEffect(() => {
        if (!isRendering && renderedPages.length > 0) {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    window.print();
                }, 500); // Confidence buffer
            });
        }
    }, [isRendering, renderedPages]);

    // 4. CLEANUP & NAVIGATE BACK
    useEffect(() => {
        const handleAfterPrint = () => {
            navigate(-1);
        };
        window.addEventListener('afterprint', handleAfterPrint);
        return () => window.removeEventListener('afterprint', handleAfterPrint);
    }, [navigate]);

    if (!data) return null;

    return (
        <div className="print-report-root min-h-screen bg-white">
            {isRendering && (
                <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center no-print">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                    <h2 className="text-xl font-bold text-gray-800">PREPARING DOCUMENT...</h2>
                    <p className="text-gray-500 mt-2">
                        Rendered {renderedPages.length} of {allPages.length} pages
                    </p>
                    <div className="w-64 h-2 bg-gray-100 rounded-full mt-6 overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${(renderedPages.length / allPages.length) * 100}%` }}
                        />
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-8 text-sm font-bold text-gray-400 hover:text-primary transition-colors border px-4 py-2 rounded-lg"
                    >
                        CANCEL PREPARATION
                    </button>
                </div>
            )}

            <div className="print-staged-container">
                {renderedPages.map((pageRows, pageIdx) => (
                    <PrintPage
                        key={pageIdx}
                        pageNumber={pageIdx + 1}
                        totalPages={allPages.length}
                        orientation={orientation}
                        header={
                            <ReportHeader
                                reportTitle={config.title}
                                month={filters?.month ? getMonthName(filters.month) : ''}
                                year={filters?.year || ''}
                            />
                        }
                        footer={<ReportFooter />}
                    >
                        {/* Dynamic Report Content Injection */}
                        {renderReportTable(reportType, pageRows, pageIdx, rowsPerPage, allPages.length, data.length, totals)}
                    </PrintPage>
                ))}
            </div>
        </div>
    );
};

// HELPER: Selective Table Rendering 
const renderReportTable = (type, rows, pageIdx, rowsPerPage, totalPages, totalRecords, totals) => {
    switch (type) {
        case 'PAY_BILL':
            // FORCED ORIENTATION & HARD WIDTHS (MANDATORY)
            return (
                <table className="ledger-table !w-[247mm]">
                    <thead>
                        <tr>
                            <th style={{ width: '10mm' }}>S.N</th>
                            <th style={{ width: '22mm' }}>EMP NO</th>
                            <th style={{ textAlign: 'left', width: '60mm' }}>NAME & DESIGNATION</th>
                            <th style={{ width: '25mm' }} className="text-right">BASIC+GP</th>
                            <th style={{ width: '18mm' }} className="text-right">D.A.</th>
                            <th style={{ width: '20mm' }} className="text-right">HATA/SPL</th>
                            <th style={{ width: '22mm' }} className="text-right font-bold">GROSS</th>
                            <th style={{ width: '20mm' }} className="text-right">EPF/PF</th>
                            <th style={{ width: '25mm' }} className="text-right font-bold">TOT DED</th>
                            <th style={{ width: '25mm' }} className="text-right font-bold">NET PAY</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx}>
                                <td>{pageIdx * rowsPerPage + idx + 1}</td>
                                <td className="font-mono">{row.EMPNO}</td>
                                <td className="text-left font-bold">{row.SNAME}</td>
                                <td className="text-right">{fmt(p(row.PAY) + p(row.GradePay))}</td>
                                <td className="text-right">{fmt(row.DA)}</td>
                                <td className="text-right">{fmt(p(row.HATA) + p(row.SPECIAL))}</td>
                                <td className="text-right font-bold">{fmt(row.GROSSPAY)}</td>
                                <td className="text-right">{fmt(row.EPF)}</td>
                                <td className="text-right font-bold">{fmt(row.TOTDED)}</td>
                                <td className="text-right font-bold bg-gray-50">{fmt(row.NETSAL)}</td>
                            </tr>
                        ))}
                        {pageIdx === totalPages - 1 && (
                            <tr className="font-black bg-gray-100 border-t-2 border-black">
                                <td colSpan={6} className="text-right py-2 uppercase">Grand Totals:</td>
                                <td className="text-right">{fmt(totals.gross)}</td>
                                <td className="text-right">{fmt(totals.epf)}</td>
                                <td className="text-right">{fmt(totals.ded)}</td>
                                <td className="text-right">{fmt(totals.net)}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            );
        case 'STAFF_MASTER':
            // FORCED LANDSCAPE & HARD WIDTHS
            return (
                <table className="ledger-table !w-[240mm]">
                    <thead>
                        <tr>
                            <th style={{ width: '10mm' }}>S.NO</th>
                            <th style={{ width: '22mm' }}>EMP NO</th>
                            <th style={{ textAlign: 'left', width: '80mm' }}>NAME & DESIGNATION</th>
                            <th style={{ width: '25mm' }}>JOIN DATE</th>
                            <th style={{ width: '38mm' }}>DEPARTMENT</th>
                            <th style={{ width: '35mm' }}>PAN NUMBER</th>
                            <th style={{ width: '30mm' }}>MOBILE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx}>
                                <td>{pageIdx * rowsPerPage + idx + 1}</td>
                                <td className="font-mono">{row.EMPNO}</td>
                                <td className="text-left font-bold" style={{ fontSize: '9px' }}>
                                    <div>{row.SNAME}</div>
                                    <div className="text-[7pt] uppercase font-normal text-gray-600 italic">
                                        {row.DESIGNATION || row.Designation || 'OFFICER'}
                                    </div>
                                </td>
                                <td>{new Date(row.DOJ || row.JDATE).toLocaleDateString()}</td>
                                <td className="text-[8pt] text-left">{row.DepartmentName || row.Category || '---'}</td>
                                <td className="font-mono text-[8pt]">{row.PAN || row.PANCARD || '---'}</td>
                                <td className="font-mono">{row.Mobile || '---'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        case 'ABSTRACT_1':
            // PORTRAIT - HARD WIDTHS (190mm TOTAL)
            return (
                <table className="ledger-table !w-[190mm]">
                    <thead>
                        <tr>
                            <th style={{ width: '12mm' }}>S.NO</th>
                            <th style={{ textAlign: 'left', width: '60mm' }}>CATEGORY / GROUP</th>
                            <th style={{ width: '25mm' }} className="text-right">GROSS PAY</th>
                            <th style={{ width: '23mm' }} className="text-right">EPF</th>
                            <th style={{ width: '20mm' }} className="text-right">ESI</th>
                            <th style={{ width: '15mm' }} className="text-right">I.TAX</th>
                            <th style={{ width: '15mm' }} className="text-right">P.TAX</th>
                            <th style={{ width: '20mm' }} className="text-right font-black">NET PAY</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx}>
                                <td className="text-center">{pageIdx * rowsPerPage + idx + 1}</td>
                                <td className="font-bold text-left">{row.Category || `Group ${row.DGroup}`}</td>
                                <td className="text-right">{fmt(row.GrossPay)}</td>
                                <td className="text-right">{fmt(row.EPF)}</td>
                                <td className="text-right">{fmt(row.ESI)}</td>
                                <td className="text-right">{fmt(row.IT)}</td>
                                <td className="text-right">{fmt(row.PT)}</td>
                                <td className="text-right font-black bg-gray-50">{fmt(row.NetPay)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        case 'BANK_STATEMENT':
            // PORTRAIT - HARD WIDTHS (190mm TOTAL)
            return (
                <table className="ledger-table !w-[190mm]">
                    <thead>
                        <tr>
                            <th style={{ width: '15mm' }}>S.NO</th>
                            <th style={{ width: '25mm' }}>EMP NO</th>
                            <th style={{ textAlign: 'left', width: '55mm' }}>ACCOUNT HOLDER NAME</th>
                            <th style={{ textAlign: 'left', width: '55mm' }}>BANK ACCOUNT NUMBER</th>
                            <th style={{ textAlign: 'right', width: '40mm' }}>NET AMOUNT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx}>
                                <td className="text-center">{pageIdx * rowsPerPage + idx + 1}</td>
                                <td className="font-mono text-[10pt]">{row.EMPNO}</td>
                                <td className="text-left font-bold">{row.SNAME}</td>
                                <td className="text-left font-mono tracking-wider">{row.ACCOUNTNO || row.AccountNo || row.BankAcNo}</td>
                                <td className="text-right font-black bg-gray-50">{fmt(row.NET_PAYABLE || row.NETSAL || row.NetSalary)}</td>
                            </tr>
                        ))}
                        {pageIdx === totalPages - 1 && (
                            <tr className="font-black bg-gray-100 border-t-2 border-black">
                                <td colSpan={4} className="text-right py-2 uppercase">Total Transferable Amount:</td>
                                <td className="text-right">{fmt(totals.net)}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            );
        case 'ATTENDANCE_DAILY':
            // PORTRAIT - HARD WIDTHS (190mm)
            return (
                <table className="ledger-table !w-[190mm]">
                    <thead>
                        <tr>
                            <th style={{ width: '12mm' }}>S.NO</th>
                            <th style={{ width: '25mm' }}>DATE</th>
                            <th style={{ width: '22mm' }}>EMP NO</th>
                            <th style={{ textAlign: 'left', width: '60mm' }}>NAME</th>
                            <th style={{ textAlign: 'left', width: '43mm' }}>DESIGNATION</th>
                            <th style={{ width: '28mm' }}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx}>
                                <td>{pageIdx * rowsPerPage + idx + 1}</td>
                                <td>{new Date(row.ADATE).toLocaleDateString('en-IN')}</td>
                                <td className="font-mono">{row.EMPNO}</td>
                                <td className="text-left font-bold">{row.SNAME}</td>
                                <td className="text-left text-[8pt]">{row.DESIGNATION}</td>
                                <td className="font-bold">{row.Status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        case 'PAY_BILL_ABSTRACT':
            // LANDSCAPE - HARD WIDTHS
            return (
                <table className="ledger-table !w-[240mm]">
                    <thead>
                        <tr>
                            <th style={{ width: '15mm' }}>S.NO</th>
                            <th style={{ textAlign: 'left', width: '95mm' }}>CATEGORY NAME</th>
                            <th style={{ width: '35mm' }} className="text-right">GROSS PAY</th>
                            <th style={{ width: '30mm' }} className="text-right">EPF</th>
                            <th style={{ width: '30mm' }} className="text-right">ESI (S+M)</th>
                            <th style={{ width: '35mm' }} className="text-right font-black">NET SALARY</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx}>
                                <td className="text-center">{pageIdx * rowsPerPage + idx + 1}</td>
                                <td className="font-bold text-left">{row.CategoryName || row.Category || `Group ${row.DGroup}`}</td>
                                <td className="text-right">{fmt(row.GROSSPAY)}</td>
                                <td className="text-right">{fmt(row.EPF)}</td>
                                <td className="text-right">{fmt(p(row.ESI) + p(row.ESIM))}</td>
                                <td className="text-right font-black bg-gray-50">{fmt(row.NETSAL)}</td>
                            </tr>
                        ))}
                        {pageIdx === totalPages - 1 && (
                            <tr className="font-black bg-gray-100 border-t-2 border-black">
                                <td colSpan={2} className="text-right py-2 uppercase">Grand Totals:</td>
                                <td className="text-right">{fmt(totals.gross)}</td>
                                <td className="text-right">{fmt(totals.epf)}</td>
                                <td className="text-right">{fmt(totals.esi)}</td>
                                <td className="text-right">{fmt(totals.net)}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            );
        case 'ABSTRACT_2':
            // LANDSCAPE - HARD WIDTHS
            return (
                <table className="ledger-table !w-[240mm]">
                    <thead>
                        <tr>
                            <th style={{ width: '15mm' }}>S.NO</th>
                            <th style={{ textAlign: 'left', width: '90mm' }}>CATEGORY NAME</th>
                            <th style={{ width: '35mm' }} className="text-right">TOTAL GROSS</th>
                            <th style={{ width: '35mm' }} className="text-right font-bold">NET AS PER BILL</th>
                            <th style={{ width: '35mm' }} className="text-right">BANK TRANSFER</th>
                            <th style={{ width: '30mm' }} className="text-right">COUNTER CASH</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx}>
                                <td className="text-center">{pageIdx * rowsPerPage + idx + 1}</td>
                                <td className="font-bold text-left">{row.Category || row.CategoryName || `Group ${row.DGroup}`}</td>
                                <td className="text-right">{fmt(row.GROSS)}</td>
                                <td className="text-right font-bold">{fmt(row.NET)}</td>
                                <td className="text-right font-black bg-indigo-50/10">{fmt(row.ByBank)}</td>
                                <td className="text-right">{fmt(row.ByCash)}</td>
                            </tr>
                        ))}
                        {pageIdx === totalPages - 1 && (
                            <tr className="font-black bg-gray-100 border-t-2 border-black">
                                <td colSpan={2} className="text-right py-2 uppercase">Grand Totals:</td>
                                <td className="text-right">{fmt(totals.gross)}</td>
                                <td className="text-right">{fmt(totals.net)}</td>
                                <td className="text-right">{fmt(totals.bank)}</td>
                                <td className="text-right">{fmt(totals.cash)}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            );
        case 'ATTENDANCE_SUMMARY':
            // LANDSCAPE - HARD WIDTHS
            return (
                <table className="ledger-table !w-[241mm]">
                    <thead>
                        <tr>
                            <th style={{ width: '25mm' }}>EMP NO</th>
                            <th style={{ textAlign: 'left', width: '90mm' }}>NAME</th>
                            <th style={{ width: '18mm' }}>PRES</th>
                            <th style={{ width: '18mm' }}>ABS</th>
                            <th style={{ width: '18mm' }}>LOP</th>
                            <th style={{ width: '18mm' }}>LEA</th>
                            <th style={{ width: '18mm' }}>WO</th>
                            <th style={{ width: '18mm' }}>OD</th>
                            <th style={{ width: '18mm' }}>HALF</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx}>
                                <td className="font-mono">{row.EMPNO}</td>
                                <td className="text-left font-bold">{row.SNAME}</td>
                                <td>{row.PresentDays || 0}</td>
                                <td>{row.AbsentDays || 0}</td>
                                <td className="bg-red-50 font-bold">{row.LOPDays || 0}</td>
                                <td>{row.LeaveDays || 0}</td>
                                <td>{row.WeekOffs || 0}</td>
                                <td>{row.ODDays || 0}</td>
                                <td>{row.HalfDays || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        case 'PAY_CERTIFICATE':
            const cert = rows[0]; // Always 1 per page for certificate
            if (!cert) return null;
            return (
                <div className="certificate-body mt-10 text-[11pt] leading-relaxed">
                    <p className="mb-6">Date: {new Date().toLocaleDateString('en-IN')}</p>

                    <p className="mb-4">This is to certify that Mr./Ms. <strong className="underline decoration-2">{cert.SNAME}</strong> (Emp No: {cert.EMPNO}) is working as <strong className="uppercase">{cert.Designation || cert.DESIGNATION}</strong> in our institution.</p>

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
                                    <tr className="!h-8"><td className="text-left !border-none">BASIC PAY</td><td className="text-right !border-none">{fmt(p(cert.PAY) + p(cert.GradePay))}</td></tr>
                                    <tr className="!h-8"><td className="text-left !border-none">D.A.</td><td className="text-right !border-none">{fmt(cert.DA)}</td></tr>
                                    <tr className="!h-8"><td className="text-left !border-none">H.A./T.A.</td><td className="text-right !border-none">{fmt(cert.HATA)}</td></tr>
                                    <tr className="!h-8"><td className="text-left !border-none">SPL. ALLOWANCE</td><td className="text-right !border-none">{fmt(cert.SPECIAL)}</td></tr>
                                    <tr className="!h-8 font-bold border-t-2 border-black"><td className="text-left !border-none">GROSS PAY</td><td className="text-right !border-none">{fmt(cert.GROSSPAY)}</td></tr>
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
                                    <tr className="!h-8"><td className="text-left !border-none">EPF</td><td className="text-right !border-none">{fmt(cert.EPF)}</td></tr>
                                    <tr className="!h-8"><td className="text-left !border-none">ESI</td><td className="text-right !border-none">{fmt(cert.ESI)}</td></tr>
                                    <tr className="!h-8"><td className="text-left !border-none">P.TAX</td><td className="text-right !border-none">{fmt(cert.PT)}</td></tr>
                                    <tr className="!h-8"><td className="text-left !border-none">LIC / OTHERS</td><td className="text-right !border-none">{fmt(p(cert.LIC) + p(cert.Advance) + p(cert.OTHERS))}</td></tr>
                                    <tr className="!h-8 font-bold border-t-2 border-black"><td className="text-left !border-none">TOTAL DED.</td><td className="text-right !border-none">{fmt(cert.TOTDED)}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end p-4 bg-gray-50 border-2 border-black">
                        <div className="flex gap-8 items-baseline">
                            <span className="font-bold text-gray-700">NET SALARY PAYABLE :</span>
                            <span className="text-xl font-black italic underline decoration-2">Rs. {fmt(cert.NETSAL)}</span>
                        </div>
                    </div>

                    <p className="mt-12 text-[9pt] italic text-gray-400 font-serif">Note: This is a computer generated certificate and does not require a physical seal if verified digitally.</p>
                </div>
            );
        default:
            return <div>Unsupported Report Type: {type}</div>;
    }
};

export default PrintReportView;
