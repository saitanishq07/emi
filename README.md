# EMI Calculator Web Application

A modern, professional, and fully responsive EMI Calculator web application designed for property, home, car, personal, and business loan calculations.

![EMI Calculator](https://raw.githubusercontent.com/saitanishq07/emi/main/index.html)

## ✨ Features

- 💰 **Loan Amount Input**: Input in Indian Rupees (₹) with range slider and dynamic word terms (`25 Lakh`, `1.25 Cr`).
- 📈 **Interest Rate**: Annual interest rate percentage (% p.a.) with decimal precision and range slider.
- 📅 **Loan Tenure**: Flexible selection in Years (1–30 Yrs) or Months (12–360 Mos).
- 🏠 **Property Loan Mode**: Auto-calculates `Loan Amount = Property Value - Down Payment` with percentage down payment badge.
- 📊 **Interactive Breakdown Chart**: Live Chart.js doughnut chart showing Principal vs Total Interest percentage distribution.
- 📋 **Amortization Repayment Schedule**: Expandable drawer with **Yearly Summary** and **Monthly Detailed Breakdown** tables.
- 🇮🇳 **Indian Number System**: `en-IN` currency formatting (`₹25,00,000`, `₹1,25,00,000`).
- 🛠️ **Utility Tools**:
  - Copy EMI summary to clipboard
  - Share calculator parameters via URL
  - Download Repayment Schedule as PDF statement
  - Print-friendly layout (`@media print`)

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Libraries**:
  - [Chart.js](https://www.chartjs.org/) for doughnut visualization
  - [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) for PDF statement export
  - [FontAwesome 6](https://fontawesome.com/) for icons
  - [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) Google Font

## 🚀 Quick Start

Simply clone the repository and open `index.html` in any web browser:

```bash
git clone https://github.com/saitanishq07/emi.git
cd emi
```

Or run a local development server:

```bash
python -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

## 📄 License

This project is licensed under the MIT License.
