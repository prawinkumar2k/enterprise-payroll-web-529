/**
 * PRINT-FIRST ENGINE - CORE UTILITIES
 * Government-level payroll report printing system
 */

/**
 * Paginate data into fixed-size pages
 * @param {Array} data - Full dataset
 * @param {number} rowsPerPage - Fixed rows per page
 * @returns {Array} Array of pages, each containing rows
 */
export const paginateData = (data, rowsPerPage) => {
    const pages = [];
    for (let i = 0; i < data.length; i += rowsPerPage) {
        pages.push(data.slice(i, i + rowsPerPage));
    }
    return pages;
};

/**
 * Safe numeric parser
 * @param {any} val - Value to parse
 * @returns {number} Parsed float or 0
 */
export const p = (val) => parseFloat(val || 0) || 0;

/**
 * Format currency for Indian locale (Standardized)
 * @param {number} value - Amount
 * @returns {string} Formatted currency
 */
export const fmt = (value) => p(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

/**
 * Format currency for Indian locale (Legacy Name)
 * @param {number} value - Amount
 * @returns {string} Formatted currency
 */
export const formatCurrency = (value) => fmt(value);

/**
 * Format date for reports
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

/**
 * Get month name from number
 * @param {number} monthNum - Month number (1-12)
 * @returns {string} Month name
 */
export const getMonthName = (monthNum) => {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[parseInt(monthNum) - 1] || '';
};

/**
 * Calculate total pages needed
 * @param {number} totalRows - Total number of rows
 * @param {number} rowsPerPage - Rows per page
 * @returns {number} Total pages
 */
export const calculateTotalPages = (totalRows, rowsPerPage) => {
    return Math.ceil(totalRows / rowsPerPage);
};

/**
 * Custom hook to manage print lifecycle state machine
 * Ensures DOM is fully rendered before triggering window.print()
 */
import { useState, useEffect } from 'react';

export const usePrintLifecycle = () => {
    const [isPrinting, setIsPrinting] = useState(false);

    useEffect(() => {
        if (isPrinting) {
            // Wait for React commit + Browser paint
            requestAnimationFrame(() => {
                const timer = setTimeout(() => {
                    window.print();
                }, 300); // 300ms safety buffer
                return () => clearTimeout(timer);
            });
        }
    }, [isPrinting]);

    useEffect(() => {
        const handleAfterPrint = () => setIsPrinting(false);
        window.addEventListener('afterprint', handleAfterPrint);
        return () => window.removeEventListener('afterprint', handleAfterPrint);
    }, []);

    const startPrint = () => setIsPrinting(true);

    return { isPrinting, startPrint };
};

/**
 * Legacy support for direct trigger (use usePrintLifecycle instead)
 * @param {number} delay - Delay in ms (default 300)
 */
export const triggerPrint = (delay = 300) => {
    setTimeout(() => {
        window.print();
    }, delay);
};

/**
 * Report configuration presets
 * Mathematically calculated for 24px row height on A4
 */
export const REPORT_CONFIGS = {
    STAFF_MASTER: {
        rowsPerPage: 18,
        orientation: 'landscape',
        title: 'STAFF MASTER REGISTER'
    },
    PAY_BILL: {
        rowsPerPage: 18,
        orientation: 'landscape',
        title: 'PAY BILL DETAIL'
    },
    ABSTRACT_1: {
        rowsPerPage: 32,
        orientation: 'portrait',
        title: 'ABSTRACT 1 - STATUTORY DEDUCTIONS'
    },
    ABSTRACT_2: {
        rowsPerPage: 18,
        orientation: 'landscape',
        title: 'ABSTRACT 2 - DISBURSEMENT SUMMARY'
    },
    BANK_STATEMENT: {
        rowsPerPage: 32,
        orientation: 'portrait',
        title: 'BANK STATEMENT'
    },
    PAY_CERTIFICATE: {
        rowsPerPage: 1,
        orientation: 'portrait',
        title: 'PAY CERTIFICATE'
    },
    ATTENDANCE_DAILY: {
        rowsPerPage: 32,
        orientation: 'portrait',
        title: 'DAILY ATTENDANCE REGISTER'
    },
    ATTENDANCE_SUMMARY: {
        rowsPerPage: 18,
        orientation: 'landscape',
        title: 'MONTHLY ATTENDANCE SUMMARY'
    },
    PAY_BILL_ABSTRACT: {
        rowsPerPage: 18,
        orientation: 'landscape',
        title: 'PAY BILL ABSTRACT'
    }
};
