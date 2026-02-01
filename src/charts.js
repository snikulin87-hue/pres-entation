
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

const labels = ['М1', 'М2', 'М3', 'М4', 'М5', 'М6'];

// Data: M1-M6 exactly matching tables.
// "Investments" plotted as positive bars for Burn/Initial Spend to be visible.

// --- PESSIMISTIC ---
const pessimisticData = {
    revenue: [0, 0, 150000, 405000, 621000, 809700],
    // Investments: M1 500k, M2 80k, M3 400k (Net is -400), M4 157k (Net -157)
    // We will show "Required Investment" as the deficit? Or just the explicit tranches?
    // User asked for "Investments in tranches". Let's show the Burn (Loss) as Investment.
    investments: [500000, 80000, 400000, 157000, 34900, 0],
    profit: [-500000, -80000, -400000, -157000, -34900, 70820]
};

// --- AVERAGE ---
const averageData = {
    revenue: [0, 0, 375000, 1050000, 1590000, 2022000],
    investments: [500000, 80000, 310000, 0, 0, 0], // M3 deficit is 310k. M4 is profitable.
    profit: [-500000, -80000, -310000, 140000, 464000, 723200]
};

// --- POSITIVE ---
const positiveData = {
    revenue: [0, 0, 562500, 1631250, 2780625, 4002625],
    investments: [500000, 80000, 235000, 0, 0, 0], // M3 deficit 235k
    profit: [-500000, -80000, -235000, 413750, 1065000, 1761000]
};

function createConfig(data) {
    return {
        type: 'line', // Base type
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Выручка', // Revenue
                    data: data.revenue,
                    backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.5)'); // Green top
                        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)'); // Green bottom
                        return gradient;
                    },
                    borderColor: '#10B981',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    order: 2,
                    yAxisID: 'y'
                },
                {
                    label: 'Инвестиции (Вложения)', // Investments
                    data: data.investments,
                    type: 'bar',
                    backgroundColor: '#F59E0B', // Amber/Orange
                    hoverBackgroundColor: '#D97706',
                    borderRadius: 4,
                    barPercentage: 0.5,
                    order: 3,
                    yAxisID: 'y'
                },
                {
                    label: 'Чистая Прибыль', // Net Profit
                    data: data.profit,
                    borderColor: '#1E293B', // Slate 800
                    backgroundColor: '#1E293B',
                    borderWidth: 2,
                    borderDash: [5, 5], // Dotted line per design inspo
                    tension: 0.3,
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
