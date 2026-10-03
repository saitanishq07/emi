/**
 * EMI Calculator Core Mathematics & Formatting Engine
 */

/**
 * Formats a numeric value into Indian Rupee currency format (e.g. ₹25,50,000)
 * @param {number} amount - Numerical value
 * @param {boolean} includeSymbol - Whether to prefix ₹ symbol
 * @returns {string} Formatted Indian Currency String
 */
function formatCurrency(amount, includeSymbol = true) {
    if (isNaN(amount) || amount === null || amount === undefined) {
        return includeSymbol ? '₹0' : '0';
    }
    
    const rounded = Math.round(amount);
    const formatted = new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0
    }).format(rounded);

    return includeSymbol ? `₹${formatted}` : formatted;
}

/**
 * Converts a large numeric amount into Indian word terms (Thousand, Lakh, Crore)
 * e.g., 2500000 -> "25 Lakhs", 12500000 -> "1.25 Crore"
 * @param {number} amount 
 * @returns {string} Word representation
 */
function formatAmountInWords(amount) {
    if (isNaN(amount) || amount <= 0) return '';
    
    if (amount >= 10000000) { // 1 Crore
        const cr = (amount / 10000000).toFixed(2).replace(/\.00$/, '');
        return `${cr} Cr`;
    } else if (amount >= 100000) { // 1 Lakh
        const lakh = (amount / 100000).toFixed(2).replace(/\.00$/, '');
        return `${lakh} Lakh`;
    } else if (amount >= 1000) { // 1 Thousand
        const k = (amount / 1000).toFixed(1).replace(/\.0$/, '');
        return `${k} K`;
    }
    return `₹${Math.round(amount)}`;
}

/**
 * Parses raw input string or number into valid float number
 * @param {string|number} val 
 * @returns {number} Clean parsed number
 */
function parseNumber(val) {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;
    const cleanStr = val.toString().replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleanStr);
    return isNaN(parsed) ? 0 : parsed;
}

/**
 * Calculates EMI, Total Interest, and Total Payable using standard financial formula:
 * EMI = P * R * (1 + R)^N / ((1 + R)^N - 1)
 * 
 * @param {number} principal - Loan amount P
 * @param {number} annualRate - Annual interest rate in % (e.g. 8.5)
 * @param {number} tenureMonths - Total tenure N in months
 * @returns {Object} { monthlyEMI, principal, totalInterest, totalAmount }
 */
function calculateEMIDetails(principal, annualRate, tenureMonths) {
    const P = Math.max(0, parseNumber(principal));
    const rate = Math.max(0, parseNumber(annualRate));
    const N = Math.max(1, parseNumber(tenureMonths));

    if (P === 0 || N === 0) {
        return {
            monthlyEMI: 0,
            principal: 0,
            totalInterest: 0,
            totalAmount: 0
        };
    }

    let monthlyEMI = 0;
    let totalInterest = 0;
    let totalAmount = 0;

    if (rate === 0) {
        // Zero interest loan edge case
        monthlyEMI = P / N;
        totalAmount = P;
        totalInterest = 0;
    } else {
        const R = (rate / 12) / 100; // Monthly interest rate
        const pow = Math.pow(1 + R, N);
        monthlyEMI = P * R * pow / (pow - 1);
        totalAmount = monthlyEMI * N;
        totalInterest = totalAmount - P;
    }

    return {
        monthlyEMI: Math.round(monthlyEMI),
        principal: Math.round(P),
        totalInterest: Math.round(totalInterest),
        totalAmount: Math.round(totalAmount)
    };
}

/**
 * Generates detailed monthly and consolidated yearly repayment schedules
 * 
 * @param {number} principal 
 * @param {number} annualRate 
 * @param {number} tenureMonths 
 * @returns {Object} { monthlySchedule: Array, yearlySchedule: Array }
 */
function generateAmortizationSchedule(principal, annualRate, tenureMonths) {
    const P = Math.max(0, parseNumber(principal));
    const rate = Math.max(0, parseNumber(annualRate));
    const N = Math.max(1, parseNumber(tenureMonths));

    const emiResult = calculateEMIDetails(P, rate, N);
    const monthlyEMI = emiResult.monthlyEMI;
    const R = rate === 0 ? 0 : (rate / 12) / 100;

    const monthlySchedule = [];
    let currentBalance = P;

    for (let m = 1; m <= N; m++) {
        const openingBalance = currentBalance;
        const interestPayment = rate === 0 ? 0 : openingBalance * R;
        let principalPayment = monthlyEMI - interestPayment;

        // Last month rounding adjustment to ensure exact zero closing balance
        if (m === N || openingBalance < principalPayment) {
            principalPayment = openingBalance;
        }

        const totalPayment = principalPayment + interestPayment;
        const closingBalance = Math.max(0, openingBalance - principalPayment);
        currentBalance = closingBalance;

        monthlySchedule.push({
            month: m,
            year: Math.ceil(m / 12),
            monthInYear: ((m - 1) % 12) + 1,
            openingBalance: Math.round(openingBalance),
            principalPaid: Math.round(principalPayment),
            interestPaid: Math.round(interestPayment),
            totalPayment: Math.round(totalPayment),
            closingBalance: Math.round(closingBalance)
        });
    }

    // Group into yearly schedule
    const yearlySchedule = [];
    const totalYears = Math.ceil(N / 12);

    for (let y = 1; y <= totalYears; y++) {
        const yearMonths = monthlySchedule.filter(item => item.year === y);
        if (yearMonths.length === 0) continue;

        const yearOpening = yearMonths[0].openingBalance;
        const yearPrincipal = yearMonths.reduce((sum, item) => sum + item.principalPaid, 0);
        const yearInterest = yearMonths.reduce((sum, item) => sum + item.interestPaid, 0);
        const yearTotal = yearMonths.reduce((sum, item) => sum + item.totalPayment, 0);
        const yearClosing = yearMonths[yearMonths.length - 1].closingBalance;

        yearlySchedule.push({
            year: y,
            openingBalance: Math.round(yearOpening),
            principalPaid: Math.round(yearPrincipal),
            interestPaid: Math.round(yearInterest),
            totalPayment: Math.round(yearTotal),
            closingBalance: Math.round(yearClosing)
        });
    }

    return { monthlySchedule, yearlySchedule };
}

// Export for module or global use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatCurrency,
        formatAmountInWords,
        parseNumber,
        calculateEMIDetails,
        generateAmortizationSchedule
    };
}
