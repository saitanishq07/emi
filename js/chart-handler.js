/**
 * Doughnut Chart Handler using Chart.js
 */

let emiChartInstance = null;

/**
 * Initializes or updates the EMI Breakdown Doughnut Chart
 * @param {number} principalAmount 
 * @param {number} totalInterest 
 */
function updateEMIChart(principalAmount, totalInterest) {
    const canvas = document.getElementById('emiChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const total = principalAmount + totalInterest;

    const principalPct = total > 0 ? ((principalAmount / total) * 100).toFixed(1) : 0;
    const interestPct = total > 0 ? ((totalInterest / total) * 100).toFixed(1) : 0;

    // Update UI percentages badges
    const principalPctBadge = document.getElementById('principalPct');
    const interestPctBadge = document.getElementById('interestPct');
    if (principalPctBadge) principalPctBadge.textContent = `${principalPct}%`;
    if (interestPctBadge) interestPctBadge.textContent = `${interestPct}%`;

    const data = {
        labels: ['Principal Amount', 'Total Interest'],
        datasets: [{
            data: [principalAmount, totalInterest],
            backgroundColor: [
                '#1e3a8a', // Deep Blue
                '#0284c7'  // Sky Light Blue
            ],
            hoverBackgroundColor: [
                '#1e40af',
                '#0369a1'
            ],
            borderWidth: 3,
            borderColor: '#ffffff',
            hoverOffset: 6
        }]
    };

    if (emiChartInstance) {
        emiChartInstance.data = data;
        emiChartInstance.update();
    } else {
        emiChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                plugins: {
                    legend: {
                        display: false // We use custom interactive legend cards
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const val = context.raw || 0;
                                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                                const label = context.label || '';
                                return ` ${label}: ${formatCurrency(val)} (${pct}%)`;
                            }
                        },
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 13, weight: 'bold' },
                        bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 13 }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true,
                    duration: 600
                }
            }
        });
    }
}
