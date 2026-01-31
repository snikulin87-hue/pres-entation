import Reveal from 'reveal.js';
import Chart from 'chart.js/auto';

const deck = new Reveal();
deck.initialize({
  hash: true,
  embedded: false,
  controls: true,
  progress: true,
  center: true,
  transition: 'slide'
});

// Financial Chart
const ctx = document.getElementById('financeChart');
if (ctx) {
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'],
      datasets: [
        {
          label: 'Cumulative Cash Flow (Pessimistic)',
          data: [-0.5, -0.58, -0.98, -1.13, -1.17, -1.1],
          borderColor: '#ff4d4d',
          tension: 0.4
        },
        {
          label: 'Cumulative Cash Flow (Average)',
          data: [-0.5, -0.58, -0.89, -0.75, -0.28, 0.43],
          borderColor: '#ffffff',
          tension: 0.4
        },
        {
          label: 'Cumulative Cash Flow (Positive)',
          data: [-0.5, -0.58, -0.81, -0.4, 0.66, 2.42],
          borderColor: '#00f3ff', // Neon Blue
          borderWidth: 3,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: 'white' } },
        title: { display: true, text: 'Million Rubles', color: '#a0a0a0' }
      },
      scales: {
        y: { 
           grid: { color: 'rgba(255,255,255,0.1)' },
           ticks: { color: '#a0a0a0' }
        },
        x: { 
           grid: { color: 'rgba(255,255,255,0.1)' },
           ticks: { color: '#a0a0a0' }
        }
      }
    }
  });
}
