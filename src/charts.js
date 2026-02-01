
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
                    size: 12,
                    weight: 500
                },
                color: '#64748B',
                usePointStyle: true,
                pointStyle: 'circle'
            }
        },
        tooltip: {
            backgroundColor: '#1E293B',
            titleColor: '#F8FAFC',
            bodyColor: '#CBD5E1',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            padding: 10,
            titleFont: { family: "'Inter', sans-serif", size: 13, weight: 600 },
            bodyFont: { family: "'Inter', sans-serif", size: 12 },
            callbacks: {
                label: function (context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.dataset.yAxisID === 'y') {
                        // Formatting currency
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumSignificantDigits: 3 }).format(context.parsed.y);
                        }
                    } else {
                        // Formatting clients
                        label += Math.round(context.parsed.y);
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
                color: '#F1F5F9',
                borderDash: [5, 5]
            },
            ticks: {
                color: '#94A3B8',
                font: { family: "'Inter', sans-serif", size: 11 },
                callback: function (value) {
                    return (value / 1000) + 'k'; // Abbreviate thousands
                }
            }
        },
        y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
                drawOnChartArea: false, // only want the grid lines for one axis to show up
            },
            ticks: {
                color: '#3B82F6', // Blue for clients
                font: { family: "'Inter', sans-serif", size: 11 },
                callback: (value) => Math.floor(value)
            }
        },
        x: {
            grid: {
                display: false
            },
            ticks: {
                color: '#64748B',
                font: { family: "'Inter', sans-serif", size: 11, weight: 600 }
            }
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
// Clients growth: approx +100 net new per month? (404-318=86). Let's use ~+90-100/mo.
// Rev per client = 5000.
// Expenses = COGS (2000 * Clients) + Fix (340k) + Rewards (Factories * 5000?).

const labels = ['М1', 'М2', 'М3', 'М4', 'М5', 'М6', 'М7', 'М8', 'М9', 'М10', 'М11', 'М12'];

// --- PESSIMISTIC DATA ---
const pessimisticData = {
    revenue: [0, 0, 150000, 405000, 621000, 809700, 1000000, 1200000, 1400000, 1600000, 1800000, 2000000],
    expenses: [500000, 80000, 550000, 562000, 655400, 738800, 850000, 950000, 105000, 1150000, 1250000, 1350000],
    profit: [-500000, -80000, -400000, -157000, -34900, 70820, 150000, 250000, 350000, 450000, 550000, 650000],
    clients: [0, 0, 30, 81, 124, 162, 200, 240, 280, 320, 360, 400]
};

// --- AVERAGE DATA ---
const averageData = {
    revenue: [0, 0, 375000, 1050000, 1590000, 2022000, 2500000, 3000000, 3500000, 4000000, 4500000, 5000000],
    expenses: [500000, 80000, 685000, 910000, 1126000, 1298800, 1500000, 1700000, 1900000, 2100000, 2300000, 2500000],
    profit: [-500000, -80000, -310000, 140000, 464000, 723200, 1000000, 1300000, 1600000, 1900000, 2200000, 2500000],
    clients: [0, 0, 75, 210, 318, 404, 500, 600, 700, 800, 900, 1000]
};

// --- POSITIVE DATA ---
const positiveData = {
    revenue: [0, 0, 562500, 1631250, 2780625, 4002625, 5200000, 6400000, 7600000, 8800000, 10000000, 11200000],
    expenses: [500000, 80000, 797500, 1217500, 1715000, 2241000, 2700000, 3200000, 3700000, 4200000, 4700000, 5200000],
    profit: [-500000, -80000, -235000, 413750, 1065000, 1761000, 2500000, 3200000, 3900000, 4600000, 5300000, 6000000],
    clients: [0, 0, 112, 326, 556, 800, 1040, 1280, 1520, 1760, 2000, 2400]
};

function createConfig(data) {
    return {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Выручка',
                    data: data.revenue,
                    backgroundColor: '#10B981', // Green
                    borderRadius: 4,
                    order: 2,
                    yAxisID: 'y'
                },
                {
                    label: 'Расходы',
                    data: data.expenses,
                    backgroundColor: '#EF4444', // Red
                    borderRadius: 4,
                    order: 3,
                    yAxisID: 'y'
                },
                {
                    label: 'Чистая Прибыль',
                    data: data.profit,
                    type: 'line',
                    borderColor: '#0F172A', // Navy
                    backgroundColor: '#0F172A',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 3,
                    order: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Клиенты (плат)',
                    data: data.clients,
                    type: 'line',
                    borderColor: '#3B82F6', // Blue
                    backgroundColor: '#3B82F6',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.3,
                    pointRadius: 0,
                    order: 0,
                    yAxisID: 'y1'
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
