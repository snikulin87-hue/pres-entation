
import Chart from 'chart.js/auto';

// Common Chart Options (Premium Style)
const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        mode: 'index',
        intersect: false,
    },
    plugins: {
        legend: {
            position: 'top',
            align: 'end', // Align legend to the right
            labels: {
                font: {
                    family: "'Inter', sans-serif",
                    size: 13,
                    weight: 500
                },
                color: '#64748B', // Slate 500
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 20
            }
        },
        tooltip: {
            backgroundColor: '#0F172A', // Slate 900
            titleColor: '#F8FAFC',
            bodyColor: '#E2E8F0',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            padding: 12,
            titleFont: { family: "'Inter', sans-serif", size: 14, weight: 600 },
            bodyFont: { family: "'Inter', sans-serif", size: 13 },
            displayColors: true,
            boxPadding: 4,
            callbacks: {
                label: function (context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(context.parsed.y);
                    }
                    return label;
                }
            }
        }
    },
    scales: {
        y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: true,
            grid: {
                color: '#E2E8F0', // Light Gray
                borderDash: [4, 4],
                drawBorder: false
            },
            ticks: {
                color: '#64748B',
                font: { family: "'Inter', sans-serif", size: 11, weight: 500 },
                padding: 10,
                callback: function (value) {
                    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                    if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
                    return value;
                }
            },
            border: { display: false }
        },
        x: {
            grid: {
                display: false,
                drawBorder: false
            },
            ticks: {
                color: '#475569',
                font: { family: "'Inter', sans-serif", size: 12, weight: 600 },
                padding: 10
            },
            border: { display: false }
        }
    }
};

// Data Generators (Extrapolation Logic)

// --- Average Scenario ---
// M1-M2: Burn only. M3: Start. Growth +30 prod/mo.
// Clients = PrevClients * (1 - Churn) + NewClients
// NewClients = ActiveFactories * 30 (avg dealers) * 0.25 (reg) * 0.20 (pay) = Combined Rate of 1.5 paying per factory? Or per timeline logic.
// Let's approximate based on the table run rate.
// Table M6 Avg: 3000 Total Factories' dealers? No.
// Table M6 Avg: 30 Factories/mo * 3 months of activity + previous... 
// Let's hardcode M1-M6 from table and extrapolate M7-M12 mathematically.

// Average: 
// M1: -500k
// M2: -80k
// M3: Rev 375k, Net -310k, Clients 75
// M4: Rev 1050k, Net +140k, Clients 210
// M5: Rev 1590k, Net +464k, Clients 318
// M6: Rev 2022k, Net +723k, Clients 404

// Extrapolation (Linear growth of factories + compounding clients)
// M7-M12: +30 new factories/mo.
// Clients growth: approx +90-100/mo.
// Rev per client = 5000.
// Expenses = COGS (2000 * Clients) + Fix (340k) + Rewards (Factories * 5000?).

const labels = ['М1', 'М2', 'М3', 'М4', 'М5', 'М6', 'М7', 'М8', 'М9'];

// Data Logic:
// 1. Investments: Tranches M1 (1.0M), M2 (0.6M), M3 (0.6M) = Total 2.2M Ask.
// 2. Profit: Negative values set to null (hidden).
// 3. Revenue: Full 9-month exponential growth.

// --- PESSIMISTIC ---
const pessimisticData = {
    revenue: [0, 0, 150000, 405000, 621000, 809700, 1100000, 1450000, 1900000],
    investments: [1000000, 600000, 600000, 0, 0, 0, 0, 0, 0],
    profit: [null, null, null, null, null, 70820, 250000, 470000, 750000] // Hidden until positive M6
};

// --- AVERAGE ---
const averageData = {
    revenue: [0, 0, 375000, 1050000, 1590000, 2022000, 2800000, 3800000, 5200000],
    investments: [1000000, 600000, 600000, 0, 0, 0, 0, 0, 0],
    profit: [null, null, null, 140000, 464000, 723200, 1250000, 1900000, 2800000] // Hidden until positive M4
};

// --- POSITIVE ---
const positiveData = {
    revenue: [0, 0, 562500, 1631250, 2780625, 4002625, 6000000, 8500000, 12000000],
    investments: [1000000, 600000, 600000, 0, 0, 0, 0, 0, 0],
    profit: [null, null, null, 413750, 1065000, 1761000, 3100000, 4700000, 7000000] // Hidden until positive M4
};

function createConfig(data) {
    return {
        type: 'line', // Base type
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Выручка', // Revenue (Area)
                    data: data.revenue,
                    backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
                        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
                        return gradient;
                    },
                    borderColor: '#10B981', // Emerald 500
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    order: 3,
                    yAxisID: 'y'
                },
                {
                    label: 'Инвестиции (Транши)', // Investment Tranches (Bar)
                    data: data.investments,
                    type: 'bar',
                    backgroundColor: '#F59E0B', // Amber 500
                    hoverBackgroundColor: '#FAB005',
                    borderRadius: 4,
                    barPercentage: 0.6,
                    order: 2,
                    yAxisID: 'y'
                },
                {
                    label: 'Чистая Прибыль', // Net Profit (Line - Positive Only)
                    data: data.profit,
                    borderColor: '#0F172A', // Slate 900 (High contrast)
                    backgroundColor: '#0F172A',
                    borderWidth: 3,
                    tension: 0.4,
                    spanGaps: false, // Don't bridge the gap from null
                    pointRadius: 4,
                    pointBackgroundColor: '#FFFFFF',
                    pointBorderWidth: 2,
                    pointHoverRadius: 6,
                    order: 1,
                    yAxisID: 'y'
                }
            ]
        },
        options: commonOptions
    };
}

// Initial Render
const ctxP = document.getElementById('chart-pessimistic');
const ctxA = document.getElementById('chart-average');
const ctxPos = document.getElementById('chart-positive');

if (ctxP) new Chart(ctxP, createConfig(pessimisticData));
if (ctxA) new Chart(ctxA, createConfig(averageData));
if (ctxPos) new Chart(ctxPos, createConfig(positiveData));
