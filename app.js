// Local application state memory management layer
let transactions = JSON.parse(localStorage.getItem('spendkart_txs')) || [
    { id: 1, title: 'Freelance Design', amount: 1200.00, type: 'income', category: 'Salary', date: '2026-05-15' },
    { id: 2, title: 'Grocery Run', amount: 84.50, type: 'expense', category: 'Food', date: '2026-05-18' },
    { id: 3, title: 'Monthly Gym Pass', amount: 60.00, type: 'expense', category: 'Entertainment', date: '2026-05-20' }
];

let categoryChart = null;

// DOM Element Registry Mapping
const totalBalanceEl = document.getElementById('totalBalance');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpensesEl = document.getElementById('totalExpenses');
const transactionTableBody = document.getElementById('transactionTableBody');
const transactionForm = document.getElementById('transactionForm');
const modalOverlay = document.getElementById('modalOverlay');

// Modal Display Control Pipelines
document.getElementById('openModalBtn').addEventListener('click', () => {
    modalOverlay.classList.remove('hidden');
    setTimeout(() => modalOverlay.classList.add('active'), 10);
    document.getElementById('txDate').value = new Date().toISOString().split('T')[0];
});

function closeModal() {
    modalOverlay.classList.remove('active');
    setTimeout(() => modalOverlay.classList.add('hidden'), 300);
    transactionForm.reset();
}
document.getElementById('closeModalBtn').addEventListener('click', closeModal);

// Ledger Update and Visual Computation Logic
function calculateMetrics() {
    let incomeSum = 0;
    let expenseSum = 0;

    let categoryDistribution = { Shopping: 0, Food: 0, Rent: 0, Entertainment: 0, Salary: 0, Misc: 0 };

    transactions.forEach(tx => {
        const amt = parseFloat(tx.amount);
        if (tx.type === 'income') {
            incomeSum += amt;
        } else {
            expenseSum += amt;
            if (categoryDistribution[tx.category] !== undefined) {
                categoryDistribution[tx.category] += amt;
            } else {
                categoryDistribution['Misc'] += amt;
            }
        }
    });

    const netSavings = incomeSum - expenseSum;

    // Numerical Formatting Injection
    totalBalanceEl.innerText = `$${netSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    totalIncomeEl.innerText = `$${incomeSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    totalExpensesEl.innerText = `$${expenseSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Text Summary Label Injection
    Object.keys(categoryDistribution).forEach(cat => {
        const targetEl = document.getElementById(`stat-${cat}`);
        if(targetEl) {
            targetEl.innerText = `$${categoryDistribution[cat].toFixed(2)}`;
        }
    });

    refreshVisualCharts(categoryDistribution);
}

function renderTableLogs() {
    transactionTableBody.innerHTML = '';
    
    // Show newest transactions first
    const itemsToRender = [...transactions].reverse();

    itemsToRender.forEach(tx => {
        const row = document.createElement('tr');
        row.className = "hover:bg-slate-50/50 transition duration-150 group border-b border-slate-100";
        
        const typeStyle = tx.type === 'income' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50';
        const amountPrefix = tx.type === 'income' ? '+' : '-';

        row.innerHTML = `
            <td class="p-4 pl-6 font-semibold text-slate-800">${escapeHtml(tx.title)}</td>
            <td class="p-4 text-slate-500">${tx.category}</td>
            <td class="p-4 text-slate-400 text-xs">${tx.date}</td>
            <td class="p-4">
                <span class="text-xs px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider ${typeStyle}">
                    ${tx.type}
                </span>
            </td>
            <td class="p-4 pr-6 text-right font-bold text-base ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}">
                ${amountPrefix}$${parseFloat(tx.amount).toFixed(2)}
            </td>
            <td class="p-4 text-center">
                <button onclick="deleteRecord(${tx.id})" class="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition duration-200">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </td>
        `;
        transactionTableBody.appendChild(row);
    });
    lucide.createIcons();
}

// ChartJS Graph Update Hook
function refreshVisualCharts(distributionData) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    const labelMapping = ['Shopping', 'Food', 'Rent & Utilities', 'Entertainment', 'Miscellaneous'];
    const numericalPayload = [
        distributionData.Shopping,
        distributionData.Food,
        distributionData.Rent,
        distributionData.Entertainment,
        distributionData.Misc
    ];

    if (categoryChart) {
        categoryChart.data.datasets[0].data = numericalPayload;
        categoryChart.update();
        return;
    }

    categoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labelMapping,
            datasets: [{
                label: 'Expenses Volume ($)',
                data: numericalPayload,
                backgroundColor: [
                    'rgba(79, 70, 229, 0.85)',  // Indigo
                    'rgba(16, 185, 129, 0.85)', // Emerald
                    'rgba(245, 158, 11, 0.85)', // Amber
                    'rgba(239, 68, 68, 0.85)',   // Rose
                    'rgba(100, 116, 139, 0.85)' // Slate
                ],
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    grid: { color: '#F1F5F9' },
                    ticks: { color: '#94A3B8', font: { weight: '600', size: 11 } },
                    border: { dash: [5, 5] }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#64748B', font: { weight: '600', size: 12 } }
                }
            }
        }
    });
}

// Transaction Ledger Mutators
transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newTx = {
        id: Date.now(),
        title: document.getElementById('txTitle').value,
        amount: parseFloat(document.getElementById('txAmount').value),
        type: document.getElementById('txType').value,
        category: document.getElementById('txCategory').value,
        date: document.getElementById('txDate').value
    };

    transactions.push(newTx);
    commitStateToMemory();
    closeModal();
});

window.deleteRecord = function(id) {
    transactions = transactions.filter(tx => tx.id !== id);
    commitStateToMemory();
};

function commitStateToMemory() {
    localStorage.setItem('spendkart_txs', JSON.stringify(transactions));
    calculateMetrics();
    renderTableLogs();
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Initial Boot Hook
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    calculateMetrics();
    renderTableLogs();
});