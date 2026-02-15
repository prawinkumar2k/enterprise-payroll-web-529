import React from "react";
import { Printer, Eraser } from "lucide-react";

const PayBillToolbar = ({
    filters,
    setFilters,
    handleClear,
    handlePrint,
    hasData,
    isAbstract = false
}) => {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="p-4 bg-white border-b border-gray-200 shadow-sm print:hidden">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Reports</span>

                    {/* Category Selection */}
                    <div className="flex gap-2 mt-1">
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold outline-none"
                        >
                            <option value="ALL">ALL</option>
                            <option value="Cheque with PF">Cheque with PF</option>
                            <option value="Cheque without PF">Cheque without PF</option>
                            <option value="Cash Disburse">Cash Disburse</option>
                        </select>

                        {/* Month & Year Selection */}
                        <div className="flex gap-2">
                            <select
                                value={filters.month}
                                onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold outline-none"
                            >
                                {monthNames.map((m, i) => (
                                    <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>
                                ))}
                            </select>
                            <select
                                value={filters.year}
                                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold outline-none"
                            >
                                {["2023", "2024", "2025", "2026"].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="h-10 w-px bg-gray-200"></div>

                    {/* Unified Options */}
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={filters.withSignature}
                                onChange={(e) => setFilters({ ...filters, withSignature: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-300 text-primary"
                            />
                            <span className="text-xs font-bold text-gray-500">With Signature</span>
                        </label>

                        {!isAbstract && (
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={filters.paySlip}
                                    onChange={(e) => setFilters({ ...filters, paySlip: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-primary"
                                />
                                <span className="text-xs font-bold text-gray-500">Pay Slip</span>
                            </label>
                        )}

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={filters.bonusPayBill}
                                onChange={(e) => setFilters({ ...filters, bonusPayBill: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-300 text-primary"
                            />
                            <span className="text-xs font-bold text-gray-500">Bonus Pay Bill</span>
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <Eraser className="w-4 h-4" /> Clear
                    </button>
                    <button
                        onClick={handlePrint}
                        disabled={!hasData}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold shadow-lg shadow-gray-200 hover:bg-gray-800 disabled:opacity-50 transition-all active:scale-95"
                    >
                        <Printer className="w-4 h-4" /> Print
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PayBillToolbar;
