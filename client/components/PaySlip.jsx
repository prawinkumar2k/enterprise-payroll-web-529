import React from "react";
import SignatureSection from "./SignatureSection";

// Helper parsers
const p = (val) => parseFloat(val) || 0;
const fmt = (val) => p(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PaySlip = ({ data, monthYear, withSignature }) => {
    const earnings = [
        { label: "Basic Pay", value: data.PAY },
        { label: "Grade Pay", value: data.GradePay },
        { label: "PHD", value: data.PHD },
        { label: "MPHIL", value: data.MPHIL },
        { label: "Spl. Allowance (HA/TA)", value: data.HATA },
        { label: "DA", value: data.DA },
        { label: "Special Pay", value: data.SPECIAL },
        { label: "Interim Relief", value: data.INTERIM },
        { label: "Bonus", value: data.Bonus }
    ];

    const deductions = [
        { label: "EPF", value: data.EPF },
        { label: "ESI / ESI-M", value: p(data.ESI) + p(data.ESIM) },
        { label: "Professional Tax", value: data.PT },
        { label: "Income Tax", value: data.IT },
        { label: "Advance", value: data.Advance },
        { label: "LIC", value: data.LIC },
        { label: "Recovery", value: data.RECOVERY },
        { label: "Others", value: data.OTHERS }
    ];

    const totalEarnings = earnings.reduce((sum, item) => sum + p(item.value), 0);
    const totalDeductions = deductions.reduce((sum, item) => sum + p(item.value), 0);
    const netSalary = p(data.NETSAL);

    // Ensure rows match for table alignment
    const maxRows = Math.max(earnings.length, deductions.length, 10);
    const rows = [];
    for (let i = 0; i < maxRows; i++) {
        rows.push({
            earn: earnings[i] || { label: "", value: "" },
            ded: deductions[i] || { label: "", value: "" }
        });
    }

    return (
        <div className="pay-slip-container font-serif text-black bg-white mx-auto print:mx-0 box-border relative" style={{ minHeight: '272mm', width: '100%' }}>
            {/* 1. Header Table */}
            <table className="w-full border-collapse mb-2 border-b-2 border-black">
                <tbody>
                    <tr>
                        <td className="text-center py-2">
                            <h1 className="text-2xl font-black uppercase tracking-widest m-0 leading-none">Pay Slip</h1>
                            <div className="flex justify-between px-2 mt-2 font-bold text-sm uppercase">
                                <span>{monthYear}</span>
                                <span>SearchFirst Payroll System</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* 2. Employee Info Table */}
            <table className="w-full border-collapse border border-black mb-2 text-xs">
                <tbody>
                    <tr>
                        <td className="p-2 border-r border-black font-bold text-gray-600 w-24 bg-gray-50 print:bg-transparent">Employee No</td>
                        <td className="p-2 border-r border-black font-bold">{data.EMPNO}</td>
                        <td className="p-2 border-r border-black font-bold text-gray-600 w-24 bg-gray-50 print:bg-transparent">Name</td>
                        <td className="p-2 font-bold">{data.SNAME}</td>
                    </tr>
                    <tr className="border-t border-black">
                        <td className="p-2 border-r border-black font-bold text-gray-600 bg-gray-50 print:bg-transparent">Designation</td>
                        <td className="p-2 font-bold" colSpan="3">{data.Designation}</td>
                    </tr>
                </tbody>
            </table>

            {/* 3. Earnings & Deductions Master Table */}
            <table className="w-full border-collapse border border-black text-xs mb-0">
                <thead>
                    <tr className="border-b border-black bg-gray-100 print:bg-transparent">
                        <th className="w-1/2 border-r border-black p-0 align-top">
                            <div className="border-b border-black p-1 uppercase font-black text-center">Earnings</div>
                        </th>
                        <th className="w-1/2 p-0 align-top">
                            <div className="border-b border-black p-1 uppercase font-black text-center">Deductions</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="w-1/2 border-r border-black p-0 align-top">
                            <table className="w-full">
                                <tbody>
                                    {rows.map((row, i) => (
                                        <tr key={i}>
                                            <td className="p-1 pl-2 text-left align-top">{row.earn.label}</td>
                                            <td className="p-1 pr-2 text-right font-mono font-bold align-top min-w-[60px]">{row.earn.value ? fmt(row.earn.value) : ""}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </td>
                        <td className="w-1/2 p-0 align-top">
                            <table className="w-full">
                                <tbody>
                                    {rows.map((row, i) => (
                                        <tr key={i}>
                                            <td className="p-1 pl-2 text-left align-top">{row.ded.label}</td>
                                            <td className="p-1 pr-2 text-right font-mono font-bold align-top min-w-[60px]">{row.ded.value ? fmt(row.ded.value) : ""}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* 4. TOTALS TABLE */}
            <table className="w-full border-collapse border border-black border-t-2 bg-gray-50 print:bg-transparent">
                <tbody>
                    <tr>
                        <td className="p-2 border-r border-black w-1/3 text-center">
                            <div className="text-[10px] uppercase font-bold text-gray-500">Gross Earnings</div>
                            <div className="font-mono font-black text-lg">{fmt(totalEarnings)}</div>
                        </td>
                        <td className="p-2 border-r border-black w-1/3 text-center">
                            <div className="text-[10px] uppercase font-bold text-gray-500">Total Deductions</div>
                            <div className="font-mono font-black text-lg text-red-600">{fmt(totalDeductions)}</div>
                        </td>
                        <td className="p-2 w-1/3 text-center">
                            <div className="text-[10px] uppercase font-bold text-gray-500">Net Salary</div>
                            <div className="font-mono font-black text-xl text-black">{fmt(netSalary)}</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Footer Text */}
            <div className="mt-4 text-center text-[10px] uppercase tracking-widest text-gray-400">
                This is a system generated pay slip
            </div>

            {/* 5. Fixed Signature Section at Bottom */}
            {withSignature && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }}>
                    <SignatureSection />
                </div>
            )}
        </div>
    );
};

export default PaySlip;
