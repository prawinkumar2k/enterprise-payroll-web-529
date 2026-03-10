/**
 * taxEngine.service.js — Indian Payroll Tax Calculation Engine
 *
 * Implements:
 *   1. Professional Tax (PT) — State-wise slabs (KA, TN, MH, AP)
 *   2. Income Tax (IT) — New Tax Regime FY 2024-25 with Section 87A rebate
 *
 * Usage:
 *   import taxEngine from './taxEngine.service.js';
 *   const pt = taxEngine.calculatePT(grossSalary, 'TN');
 *   const it = taxEngine.calculateIT(annualGross, monthNumber, ytdTaxPaid);
 */

// ─────────────────────────────────────────────────────────────────────────────
// PROFESSIONAL TAX (PT) — State-wise Monthly Slabs
// ─────────────────────────────────────────────────────────────────────────────

const PT_SLABS = {
    // Karnataka
    KA: [
        { minGross: 0, maxGross: 14999, ptAmount: 0 },
        { minGross: 15000, maxGross: Infinity, ptAmount: 200 },
    ],

    // Tamil Nadu
    TN: [
        { minGross: 0, maxGross: 20999, ptAmount: 0 },
        { minGross: 21000, maxGross: 30000, ptAmount: 135 },
        { minGross: 30001, maxGross: Infinity, ptAmount: 180 },
    ],

    // Maharashtra (monthly PT based on monthly gross)
    MH: [
        { minGross: 0, maxGross: 7499, ptAmount: 0 },
        { minGross: 7500, maxGross: 9999, ptAmount: 175 },
        { minGross: 10000, maxGross: Infinity, ptAmount: 200 },
        // Note: February is 300 in MH — handled specially below
    ],

    // Andhra Pradesh
    AP: [
        { minGross: 0, maxGross: 14999, ptAmount: 0 },
        { minGross: 15000, maxGross: Infinity, ptAmount: 150 },
    ],

    // Telangana (same as AP currently)
    TS: [
        { minGross: 0, maxGross: 14999, ptAmount: 0 },
        { minGross: 15000, maxGross: Infinity, ptAmount: 150 },
    ],
};

/**
 * Calculate Professional Tax (PT) for a given gross salary and state.
 *
 * @param {number} grossMonthly - Monthly gross salary in INR
 * @param {string} state        - State code: 'TN' | 'KA' | 'MH' | 'AP' | 'TS'
 * @param {number} month        - Month number 1-12 (needed for Maharashtra Feb rule)
 * @returns {number} PT amount in INR (monthly)
 */
export function calculatePT(grossMonthly, state = 'TN', month = 1) {
    const stateCode = (state || 'TN').toUpperCase();
    const slabs = PT_SLABS[stateCode];

    if (!slabs) {
        // Unsupported state — return 0 (no PT)
        return 0;
    }

    const gross = parseFloat(grossMonthly) || 0;

    // Maharashtra February special rule: 300 instead of 200
    if (stateCode === 'MH' && month === 2 && gross >= 10000) {
        return 300;
    }

    for (const slab of slabs) {
        if (gross >= slab.minGross && gross <= slab.maxGross) {
            return slab.ptAmount;
        }
    }

    return 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// INCOME TAX (IT) — New Tax Regime FY 2024-25
// ─────────────────────────────────────────────────────────────────────────────

const IT_SLABS_NEW_REGIME = [
    { from: 0, to: 300000, rate: 0 },
    { from: 300001, to: 700000, rate: 0.05 },
    { from: 700001, to: 1000000, rate: 0.10 },
    { from: 1000001, to: 1200000, rate: 0.15 },
    { from: 1200001, to: 1500000, rate: 0.20 },
    { from: 1500001, to: Infinity, rate: 0.30 },
];

const STANDARD_DEDUCTION = 75000;      // FY 2024-25 (Post-July 2024 Budget)

const SECTION_87A_LIMIT = 700000;      // Rebate if taxable income <= 7L
const SECTION_87A_MAX_REBATE = 25000;  // Max rebate under 87A

/**
 * Calculate annual income tax under New Tax Regime.
 *
 * @param {number} annualGross     - Annual gross salary (sum of all 12 months)
 * @returns {{ annualTax, effectiveTaxRate }} 
 */
function computeAnnualIT(annualGross) {
    const taxableIncome = Math.max(0, annualGross - STANDARD_DEDUCTION);

    let tax = 0;
    for (const slab of IT_SLABS_NEW_REGIME) {
        if (taxableIncome <= slab.from - 1) break;
        const slabIncome = Math.min(taxableIncome, slab.to) - (slab.from - 1);
        tax += slabIncome * slab.rate;
    }

    // Section 87A Rebate — if taxable income <= 7 lakh, rebate up to ₹25,000
    if (taxableIncome <= SECTION_87A_LIMIT) {
        const rebate = Math.min(tax, SECTION_87A_MAX_REBATE);
        tax = Math.max(0, tax - rebate);
    }

    // Add 4% Health & Education Cess
    tax = tax * 1.04;

    return {
        annualTax: Math.round(tax),
        taxableIncome,
        effectiveTaxRate: annualGross > 0 ? ((tax / annualGross) * 100).toFixed(2) + '%' : '0%'
    };
}

/**
 * Calculate monthly IT deduction using projected annual income.
 *
 * Strategy:
 *   - Project annual income from current month salary
 *   - Compute annual tax liability
 *   - Spread evenly across remaining months
 *   - In March recalculate and settle any balance
 *
 * @param {number} monthlyGross   - Current month gross salary
 * @param {number} monthNumber    - Month number 1-12 (financial year: April=1, March=12)
 * @param {number} ytdTaxPaid     - Tax already deducted this financial year
 * @param {number} ytdGross       - Year-to-date gross already paid this FY
 * @returns {{ monthlyIT, annualTax, taxableIncome, projectedAnnual }}
 */
export function calculateIT({
    monthlyGross,
    monthNumber,      // Financial year month: April=1, March=12
    ytdTaxPaid = 0,
    ytdGross = 0,
}) {
    const gross = parseFloat(monthlyGross) || 0;
    const ytdG = parseFloat(ytdGross) || 0;
    const ytdT = parseFloat(ytdTaxPaid) || 0;

    // Remaining months in FY (including this month)
    const remainingMonths = Math.max(1, 13 - monthNumber);

    // Project annual gross: ytd + this month + estimate rest of year
    const projectedAnnual = ytdG + gross * remainingMonths;

    const { annualTax, taxableIncome } = computeAnnualIT(projectedAnnual);

    let monthlyIT;

    if (monthNumber === 12) {
        // March — settle the full year
        monthlyIT = Math.max(0, annualTax - ytdT);
    } else {
        // Spread remaining tax over remaining months
        const remainingTax = Math.max(0, annualTax - ytdT);
        monthlyIT = Math.round(remainingTax / remainingMonths);
    }

    return {
        monthlyIT,
        annualTax,
        taxableIncome,
        projectedAnnual,
    };
}

/**
 * Quick PT lookup — returns monthly PT for a state+gross combination.
 * Alias that also accepts the state from env var.
 */
export function getPTForEmployee(grossMonthly, state, month) {
    const ptState = state || process.env.PT_STATE || 'TN';
    return calculatePT(grossMonthly, ptState, month);
}

export default {
    calculatePT,
    calculateIT,
    getPTForEmployee,
    PT_SLABS,
    IT_SLABS_NEW_REGIME,
};
