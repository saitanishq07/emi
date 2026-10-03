/**
 * Application Controller & Event Handler
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT REFERENCES ---
    // Toggles & Modes
    const propertyModeToggle = document.getElementById('propertyModeToggle');
    const propertyFieldsSection = document.getElementById('propertyFieldsSection');
    const tenureUnitYearsBtn = document.getElementById('tenureUnitYears');
    const tenureUnitMonthsBtn = document.getElementById('tenureUnitMonths');

    // Property Inputs & Sliders
    const propertyValueInput = document.getElementById('propertyValueInput');
    const propertyValueSlider = document.getElementById('propertyValueSlider');
    const propertyValueWords = document.getElementById('propertyValueWords');

    const downPaymentInput = document.getElementById('downPaymentInput');
    const downPaymentSlider = document.getElementById('downPaymentSlider');
    const downPaymentWords = document.getElementById('downPaymentWords');
    const downPaymentPctLabel = document.getElementById('downPaymentPctLabel');

    // Main Calculator Inputs & Sliders
    const loanAmountInput = document.getElementById('loanAmountInput');
    const loanAmountSlider = document.getElementById('loanAmountSlider');
    const loanAmountWords = document.getElementById('loanAmountWords');

    const interestRateInput = document.getElementById('interestRateInput');
    const interestRateSlider = document.getElementById('interestRateSlider');

    const tenureInput = document.getElementById('tenureInput');
    const tenureSlider = document.getElementById('tenureSlider');
    const tenureLabel = document.getElementById('tenureLabel');
    const tenureMaxLabel = document.getElementById('tenureMaxLabel');

    // Results Card Elements
    const emiDisplay = document.getElementById('emiDisplay');
    const principalDisplay = document.getElementById('principalDisplay');
    const interestDisplay = document.getElementById('interestDisplay');
    const totalPayableDisplay = document.getElementById('totalPayableDisplay');

    // Validation Alert Container
    const validationAlert = document.getElementById('validationAlert');

    // Schedule Elements
    const scheduleAccordionToggle = document.getElementById('scheduleAccordionToggle');
    const scheduleContent = document.getElementById('scheduleContent');
    const scheduleAccordionIcon = document.getElementById('scheduleAccordionIcon');
    const scheduleViewYearlyBtn = document.getElementById('scheduleViewYearly');
    const scheduleViewMonthlyBtn = document.getElementById('scheduleViewMonthly');
    const scheduleTableHead = document.getElementById('scheduleTableHead');
    const scheduleTableBody = document.getElementById('scheduleTableBody');

    // Control Buttons
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const copyEmiBtn = document.getElementById('copyEmiBtn');
    const shareBtn = document.getElementById('shareBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const printBtn = document.getElementById('printBtn');

    // Presets
    const presetButtons = document.querySelectorAll('.preset-btn');

    // State Variables
    let isPropertyLoanMode = false;
    let tenureUnit = 'years'; // 'years' | 'months'
    let scheduleViewMode = 'yearly'; // 'yearly' | 'monthly'

    // --- DEFAULTS ---
    const DEFAULTS = {
        propertyValue: 5000000,
        downPayment: 1500000,
        loanAmount: 2500000,
        interestRate: 8.5,
        tenureYears: 10,
        tenureMonths: 120
    };

    // --- INITIALIZATION ---
    initFromQueryParams() || loadDefaults();
    updateUI();

    // --- EVENT LISTENERS ---

    // Property Loan Mode Switch
    if (propertyModeToggle) {
        propertyModeToggle.addEventListener('change', (e) => {
            isPropertyLoanMode = e.target.checked;
            if (isPropertyLoanMode) {
                propertyFieldsSection.classList.remove('hidden');
                syncPropertyLoanAmount();
            } else {
                propertyFieldsSection.classList.add('hidden');
            }
            updateUI();
        });
    }

    // Tenure Unit Selector (Years vs Months)
    if (tenureUnitYearsBtn && tenureUnitMonthsBtn) {
        tenureUnitYearsBtn.addEventListener('click', () => setTenureUnit('years'));
        tenureUnitMonthsBtn.addEventListener('click', () => setTenureUnit('months'));
    }

    // Property Value Sync
    setupSyncedInputSlider({
        input: propertyValueInput,
        slider: propertyValueSlider,
        wordsEl: propertyValueWords,
        formatter: formatAmountInWords,
        onUpdate: () => {
            // Keep down payment slider max bounded by property value
            const pVal = parseNumber(propertyValueInput.value);
            if (downPaymentSlider) {
                downPaymentSlider.max = pVal;
            }
            syncPropertyLoanAmount();
            updateUI();
        }
    });

    // Down Payment Sync
    setupSyncedInputSlider({
        input: downPaymentInput,
        slider: downPaymentSlider,
        wordsEl: downPaymentWords,
        formatter: (val) => {
            const pVal = parseNumber(propertyValueInput.value);
            const pct = pVal > 0 ? ((val / pVal) * 100).toFixed(1) : 0;
            if (downPaymentPctLabel) downPaymentPctLabel.textContent = `(${pct}% of value)`;
            return formatAmountInWords(val);
        },
        onUpdate: () => {
            syncPropertyLoanAmount();
            updateUI();
        }
    });

    // Loan Amount Sync
    setupSyncedInputSlider({
        input: loanAmountInput,
        slider: loanAmountSlider,
        wordsEl: loanAmountWords,
        formatter: formatAmountInWords,
        onUpdate: () => {
            if (isPropertyLoanMode) {
                // Adjust property value if manually overriding loan amount
                const lVal = parseNumber(loanAmountInput.value);
                const dpVal = parseNumber(downPaymentInput.value);
                const newPropVal = lVal + dpVal;
                propertyValueInput.value = formatCurrency(newPropVal, false);
                if (propertyValueSlider) propertyValueSlider.value = newPropVal;
                if (propertyValueWords) propertyValueWords.textContent = formatAmountInWords(newPropVal);
            }
            updateUI();
        }
    });

    // Interest Rate Sync
    setupSyncedInputSlider({
        input: interestRateInput,
        slider: interestRateSlider,
        isDecimal: true,
        onUpdate: () => updateUI()
    });

    // Tenure Sync
    setupSyncedInputSlider({
        input: tenureInput,
        slider: tenureSlider,
        onUpdate: () => updateUI()
    });

    // Presets Click Event
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            presetButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const amount = parseFloat(btn.dataset.amount);
            const rate = parseFloat(btn.dataset.rate);
            const tenure = parseFloat(btn.dataset.tenure);

            if (isPropertyLoanMode) {
                propertyModeToggle.checked = false;
                isPropertyLoanMode = false;
                propertyFieldsSection.classList.add('hidden');
            }

            setTenureUnit('years');

            loanAmountInput.value = formatCurrency(amount, false);
            loanAmountSlider.value = amount;
            if (loanAmountWords) loanAmountWords.textContent = formatAmountInWords(amount);

            interestRateInput.value = rate;
            interestRateSlider.value = rate;

            tenureInput.value = tenure;
            tenureSlider.value = tenure;

            updateUI();
        });
    });

    // Calculate Button (Explicit Trigger + Scroll to Results on Mobile)
    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            updateUI();
            if (window.innerWidth < 768) {
                const resultsCard = document.getElementById('resultsCard');
                if (resultsCard) resultsCard.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Reset Button
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            loadDefaults();
            updateUI();
            showToast('Calculator reset to default values');
        });
    }

    // Schedule Accordion Toggle
    if (scheduleAccordionToggle) {
        scheduleAccordionToggle.addEventListener('click', () => {
            const isHidden = scheduleContent.classList.contains('hidden');
            if (isHidden) {
                scheduleContent.classList.remove('hidden');
                scheduleAccordionIcon.style.transform = 'rotate(180deg)';
            } else {
                scheduleContent.classList.add('hidden');
                scheduleAccordionIcon.style.transform = 'rotate(0deg)';
            }
        });
    }

    // Schedule View Mode Toggle
    if (scheduleViewYearlyBtn && scheduleViewMonthlyBtn) {
        scheduleViewYearlyBtn.addEventListener('click', () => {
            scheduleViewMode = 'yearly';
            scheduleViewYearlyBtn.classList.add('active');
            scheduleViewMonthlyBtn.classList.remove('active');
            renderScheduleTable();
        });

        scheduleViewMonthlyBtn.addEventListener('click', () => {
            scheduleViewMode = 'monthly';
            scheduleViewMonthlyBtn.classList.add('active');
            scheduleViewYearlyBtn.classList.remove('active');
            renderScheduleTable();
        });
    }

    // Copy EMI Result
    if (copyEmiBtn) {
        copyEmiBtn.addEventListener('click', () => {
            const emiVal = emiDisplay.textContent;
            const pVal = principalDisplay.textContent;
            const iVal = interestDisplay.textContent;
            const tVal = totalPayableDisplay.textContent;
            const tenureVal = `${tenureInput.value} ${tenureUnit}`;

            const copyText = `Loan Summary:\n` +
                `• Monthly EMI: ${emiVal}\n` +
                `• Loan Amount: ${pVal}\n` +
                `• Interest Rate: ${interestRateInput.value}%\n` +
                `• Tenure: ${tenureVal}\n` +
                `• Total Interest: ${iVal}\n` +
                `• Total Payable: ${tVal}`;

            navigator.clipboard.writeText(copyText).then(() => {
                showToast('EMI summary copied to clipboard!');
            }).catch(() => {
                showToast('Failed to copy to clipboard');
            });
        });
    }

    // Share Link Button
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const pVal = parseNumber(loanAmountInput.value);
            const rVal = parseNumber(interestRateInput.value);
            const tVal = parseNumber(tenureInput.value);

            const url = new URL(window.location.href);
            url.searchParams.set('amount', pVal);
            url.searchParams.set('rate', rVal);
            url.searchParams.set('tenure', tVal);
            url.searchParams.set('unit', tenureUnit);
            url.searchParams.set('property', isPropertyLoanMode ? '1' : '0');

            navigator.clipboard.writeText(url.toString()).then(() => {
                showToast('Shareable calculator link copied to clipboard!');
            }).catch(() => {
                showToast('Failed to copy share link');
            });
        });
    }

    // Download PDF Button
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', () => {
            downloadSchedulePDF();
        });
    }

    // Print Button
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            // Make schedule visible for print
            if (scheduleContent.classList.contains('hidden')) {
                scheduleContent.classList.remove('hidden');
            }
            window.print();
        });
    }


    // --- HELPER FUNCTIONS ---

    function setupSyncedInputSlider({ input, slider, wordsEl, formatter, isDecimal = false, onUpdate }) {
        if (!input || !slider) return;

        // Input change / type event
        input.addEventListener('input', () => {
            let num = parseNumber(input.value);
            slider.value = num;
            if (wordsEl && formatter) {
                wordsEl.textContent = formatter(num);
            }
            if (onUpdate) onUpdate();
        });

        input.addEventListener('blur', () => {
            let num = parseNumber(input.value);
            // Format prettily in input on blur
            if (!isDecimal) {
                input.value = formatCurrency(num, false);
            } else {
                input.value = num;
            }
        });

        // Slider drag event
        slider.addEventListener('input', () => {
            let num = parseFloat(slider.value);
            input.value = isDecimal ? num : formatCurrency(num, false);
            if (wordsEl && formatter) {
                wordsEl.textContent = formatter(num);
            }
            if (onUpdate) onUpdate();
        });
    }

    function syncPropertyLoanAmount() {
        const pVal = parseNumber(propertyValueInput.value);
        const dpVal = parseNumber(downPaymentInput.value);
        const calcLoan = Math.max(0, pVal - dpVal);

        loanAmountInput.value = formatCurrency(calcLoan, false);
        if (loanAmountSlider) {
            loanAmountSlider.max = Math.max(10000000, pVal);
            loanAmountSlider.value = calcLoan;
        }
        if (loanAmountWords) loanAmountWords.textContent = formatAmountInWords(calcLoan);
    }

    function setTenureUnit(unit) {
        tenureUnit = unit;
        const currentVal = parseNumber(tenureInput.value);

        if (unit === 'years') {
            tenureUnitYearsBtn.classList.add('active');
            tenureUnitMonthsBtn.classList.remove('active');
            tenureLabel.textContent = 'Loan Tenure (Years)';
            tenureMaxLabel.textContent = '30 Yr';
            tenureSlider.min = 1;
            tenureSlider.max = 30;

            // Convert if was months
            const years = Math.max(1, Math.min(30, Math.round(currentVal > 30 ? currentVal / 12 : currentVal)));
            tenureInput.value = years;
            tenureSlider.value = years;
        } else {
            tenureUnitMonthsBtn.classList.add('active');
            tenureUnitYearsBtn.classList.remove('active');
            tenureLabel.textContent = 'Loan Tenure (Months)';
            tenureMaxLabel.textContent = '360 Mo';
            tenureSlider.min = 12;
            tenureSlider.max = 360;

            // Convert if was years
            const months = Math.max(12, Math.min(360, Math.round(currentVal <= 30 ? currentVal * 12 : currentVal)));
            tenureInput.value = months;
            tenureSlider.value = months;
        }
        updateUI();
    }

    function getTenureInMonths() {
        const val = parseNumber(tenureInput.value);
        return tenureUnit === 'years' ? val * 12 : val;
    }

    function validateInputs() {
        const errors = [];
        const loanAmount = parseNumber(loanAmountInput.value);
        const rate = parseNumber(interestRateInput.value);
        const tenureMonths = getTenureInMonths();

        if (isPropertyLoanMode) {
            const propVal = parseNumber(propertyValueInput.value);
            const dpVal = parseNumber(downPaymentInput.value);

            if (propVal <= 0) errors.push('Property value must be greater than ₹0');
            if (dpVal < 0) errors.push('Down payment cannot be negative');
            if (dpVal >= propVal) errors.push('Down payment must be less than Property Value');
        }

        if (loanAmount <= 0) errors.push('Loan Amount must be greater than ₹0');
        if (rate < 0) errors.push('Interest rate cannot be negative');
        if (rate > 50) errors.push('Interest rate seems uncommonly high (> 50%)');
        if (tenureMonths <= 0) errors.push('Tenure must be greater than 0');

        if (errors.length > 0) {
            validationAlert.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <div>${errors.join('<br>')}</div>`;
            validationAlert.classList.remove('hidden');
            return false;
        } else {
            validationAlert.classList.add('hidden');
            return true;
        }
    }

    function updateUI() {
        const isValid = validateInputs();
        if (!isValid) return;

        const principal = parseNumber(loanAmountInput.value);
        const rate = parseNumber(interestRateInput.value);
        const tenureMonths = getTenureInMonths();

        // Perform calculation
        const result = calculateEMIDetails(principal, rate, tenureMonths);

        // Update main result cards
        emiDisplay.textContent = formatCurrency(result.monthlyEMI);
        principalDisplay.textContent = formatCurrency(result.principal);
        interestDisplay.textContent = formatCurrency(result.totalInterest);
        totalPayableDisplay.textContent = formatCurrency(result.totalAmount);

        // Update doughnut chart
        updateEMIChart(result.principal, result.totalInterest);

        // Render schedule table
        renderScheduleTable();
    }

    function renderScheduleTable() {
        const principal = parseNumber(loanAmountInput.value);
        const rate = parseNumber(interestRateInput.value);
        const tenureMonths = getTenureInMonths();

        const schedule = generateAmortizationSchedule(principal, rate, tenureMonths);

        scheduleTableHead.innerHTML = '';
        scheduleTableBody.innerHTML = '';

        if (scheduleViewMode === 'yearly') {
            scheduleTableHead.innerHTML = `
                <tr>
                    <th>Year</th>
                    <th>Opening Balance</th>
                    <th>Principal Paid</th>
                    <th>Interest Paid</th>
                    <th>Total Payment</th>
                    <th>Closing Balance</th>
                </tr>
            `;

            schedule.yearlySchedule.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="font-semibold text-slate-800">Year ${row.year}</td>
                    <td>${formatCurrency(row.openingBalance)}</td>
                    <td class="text-blue-700 font-medium">${formatCurrency(row.principalPaid)}</td>
                    <td class="text-sky-600 font-medium">${formatCurrency(row.interestPaid)}</td>
                    <td class="font-semibold">${formatCurrency(row.totalPayment)}</td>
                    <td>${formatCurrency(row.closingBalance)}</td>
                `;
                scheduleTableBody.appendChild(tr);
            });
        } else { // monthly
            scheduleTableHead.innerHTML = `
                <tr>
                    <th>Month</th>
                    <th>Opening Balance</th>
                    <th>Principal Paid</th>
                    <th>Interest Paid</th>
                    <th>Total Payment</th>
                    <th>Closing Balance</th>
                </tr>
            `;

            schedule.monthlySchedule.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="font-semibold text-slate-800">Month ${row.month}</td>
                    <td>${formatCurrency(row.openingBalance)}</td>
                    <td class="text-blue-700 font-medium">${formatCurrency(row.principalPaid)}</td>
                    <td class="text-sky-600 font-medium">${formatCurrency(row.interestPaid)}</td>
                    <td class="font-semibold">${formatCurrency(row.totalPayment)}</td>
                    <td>${formatCurrency(row.closingBalance)}</td>
                `;
                scheduleTableBody.appendChild(tr);
            });
        }
    }

    function loadDefaults() {
        if (propertyModeToggle) propertyModeToggle.checked = false;
        isPropertyLoanMode = false;
        if (propertyFieldsSection) propertyFieldsSection.classList.add('hidden');

        propertyValueInput.value = formatCurrency(DEFAULTS.propertyValue, false);
        if (propertyValueSlider) propertyValueSlider.value = DEFAULTS.propertyValue;
        if (propertyValueWords) propertyValueWords.textContent = formatAmountInWords(DEFAULTS.propertyValue);

        downPaymentInput.value = formatCurrency(DEFAULTS.downPayment, false);
        if (downPaymentSlider) downPaymentSlider.value = DEFAULTS.downPayment;
        if (downPaymentWords) downPaymentWords.textContent = formatAmountInWords(DEFAULTS.downPayment);

        loanAmountInput.value = formatCurrency(DEFAULTS.loanAmount, false);
        if (loanAmountSlider) loanAmountSlider.value = DEFAULTS.loanAmount;
        if (loanAmountWords) loanAmountWords.textContent = formatAmountInWords(DEFAULTS.loanAmount);

        interestRateInput.value = DEFAULTS.interestRate;
        if (interestRateSlider) interestRateSlider.value = DEFAULTS.interestRate;

        setTenureUnit('years');
        tenureInput.value = DEFAULTS.tenureYears;
        if (tenureSlider) tenureSlider.value = DEFAULTS.tenureYears;

        presetButtons.forEach(b => b.classList.remove('active'));
    }

    function initFromQueryParams() {
        const urlParams = new URLSearchParams(window.location.search);
        if (!urlParams.has('amount')) return false;

        const amount = parseFloat(urlParams.get('amount'));
        const rate = parseFloat(urlParams.get('rate'));
        const tenure = parseFloat(urlParams.get('tenure'));
        const unit = urlParams.get('unit');
        const property = urlParams.get('property');

        if (!isNaN(amount)) {
            loanAmountInput.value = formatCurrency(amount, false);
            if (loanAmountSlider) loanAmountSlider.value = amount;
            if (loanAmountWords) loanAmountWords.textContent = formatAmountInWords(amount);
        }
        if (!isNaN(rate)) {
            interestRateInput.value = rate;
            if (interestRateSlider) interestRateSlider.value = rate;
        }
        if (unit === 'months' || unit === 'years') {
            setTenureUnit(unit);
        }
        if (!isNaN(tenure)) {
            tenureInput.value = tenure;
            if (tenureSlider) tenureSlider.value = tenure;
        }
        if (property === '1' && propertyModeToggle) {
            propertyModeToggle.checked = true;
            isPropertyLoanMode = true;
            propertyFieldsSection.classList.remove('hidden');
        }
        return true;
    }

    function showToast(message) {
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    function downloadSchedulePDF() {
        showToast('Generating PDF statement...');

        // Create a printable container for html2pdf
        const principal = parseNumber(loanAmountInput.value);
        const rate = parseNumber(interestRateInput.value);
        const tenureMonths = getTenureInMonths();
        const emiData = calculateEMIDetails(principal, rate, tenureMonths);
        const schedule = generateAmortizationSchedule(principal, rate, tenureMonths);

        const pdfContainer = document.createElement('div');
        pdfContainer.style.padding = '24px';
        pdfContainer.style.fontFamily = "'Plus Jakarta Sans', Arial, sans-serif";
        pdfContainer.style.color = '#1e293b';

        let tableRows = schedule.yearlySchedule.map(row => `
            <tr>
                <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Year ${row.year}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${formatCurrency(row.openingBalance)}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; color: #1e40af;">${formatCurrency(row.principalPaid)}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; color: #0284c7;">${formatCurrency(row.interestPaid)}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">${formatCurrency(row.totalPayment)}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${formatCurrency(row.closingBalance)}</td>
            </tr>
        `).join('');

        pdfContainer.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px;">
                <h1 style="color: #1e3a8a; margin: 0; font-size: 24px;">Loan Repayment Statement</h1>
                <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">Generated on ${new Date().toLocaleDateString('en-IN')}</p>
            </div>

            <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 6px 0;"><strong>Principal Amount:</strong> ${formatCurrency(emiData.principal)}</td>
                        <td style="padding: 6px 0;"><strong>Monthly EMI:</strong> <span style="color: #1e3a8a; font-size: 16px; font-weight: bold;">${formatCurrency(emiData.monthlyEMI)}</span></td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0;"><strong>Interest Rate:</strong> ${rate}% p.a.</td>
                        <td style="padding: 6px 0;"><strong>Total Interest:</strong> ${formatCurrency(emiData.totalInterest)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0;"><strong>Tenure:</strong> ${tenureInput.value} ${tenureUnit}</td>
                        <td style="padding: 6px 0;"><strong>Total Payable:</strong> ${formatCurrency(emiData.totalAmount)}</td>
                    </tr>
                </table>
            </div>

            <h3 style="color: #1e3a8a; font-size: 16px; margin-bottom: 12px;">Amortization Schedule (Yearly Summary)</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
                <thead>
                    <tr style="background-color: #1e3a8a; color: white;">
                        <th style="padding: 8px; border: 1px solid #1e3a8a;">Year</th>
                        <th style="padding: 8px; border: 1px solid #1e3a8a;">Opening Bal</th>
                        <th style="padding: 8px; border: 1px solid #1e3a8a;">Principal Paid</th>
                        <th style="padding: 8px; border: 1px solid #1e3a8a;">Interest Paid</th>
                        <th style="padding: 8px; border: 1px solid #1e3a8a;">Total Payment</th>
                        <th style="padding: 8px; border: 1px solid #1e3a8a;">Closing Bal</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>

            <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px;">
                * EMI calculations are estimates and may vary depending on lender fees, exact dates, and applicable charges.
            </div>
        `;

        if (window.html2pdf) {
            const opt = {
                margin: 10,
                filename: `EMI_Repayment_Schedule_${Date.now()}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(pdfContainer).save();
        } else {
            // Fallback to print if html2pdf CDN is unavailable
            window.print();
        }
    }
});
