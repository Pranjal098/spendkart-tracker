// Local Ledger Database Core
let transactions = JSON.parse(localStorage.getItem('nexus_ledger')) || [
    { id: 1, title: 'Inflow Injection', amount: 3500.00, type: 'income', category: 'Salary', date: '2026-05-10' },
    { id: 2, title: 'Server Subscriptions', amount: 150.00, type: 'expense', category: 'Rent', date: '2026-05-12' },
    { id: 3, title: 'Client Lunch Layout', amount: 65.20, type: 'expense', category: 'Food', date: '2026-05-14' }
];

// Dynamic Category Registry Array State
let customCategories = JSON.parse(localStorage.getItem('nexus_categories')) || [
    'Shopping', 'Food', 'Rent', 'Entertainment', 'Salary', 'Misc'
];

// Budget limit parameters configuration memory footprint
let budgetLimits = JSON.parse(localStorage.getItem('nexus_limits')) || {
    Shopping: 1000,
    Food: 500,
    Rent: 1500,
    Entertainment: 300,
    Misc: 500
};

let categoryChart = null;

// Registry Bindings
const totalBalanceEl = document.getElementById('totalBalance');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpensesEl = document.getElementById('totalExpenses');
const cardBalanceDisplay = document.getElementById('cardBalanceDisplay');
const transactionTableBody = document.getElementById('transactionTableBody');
const transactionForm = document.getElementById('transactionForm');
const modalOverlay = document.getElementById('modalOverlay');

// Modal Control Interceptors
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

// Dropdown Content Generator
function renderCategoryDropdowns() {
    const txSelect = document.getElementById('txCategory');
    const budgetSelect = document.getElementById('budgetCategory');
    
    if (!txSelect || !budgetSelect) return;

    txSelect.innerHTML = '';
    budgetSelect.innerHTML = '';

    customCategories.forEach(cat => {
        const option = `<option value="${cat}">${cat === 'Rent' ? 'Rent & Utilities' : cat}</option>`;
        txSelect.insertAdjacentHTML('beforeend', option);
        
        // Exclude revenue categories from structural spending constraints form
        if (cat !== 'Salary') {
            budgetSelect.insertAdjacentHTML('beforeend', option);
        }
    });
}

// Computational Analytics Engine
function processFinancialTelemetry() {
    let incomeSum = 0;
    let expenseSum = 0;
    
    // Dynamically initialize counters based on category mapping state
    let categoryDistribution = {};
    customCategories.forEach(c => categoryDistribution[c] = 0);

    transactions.forEach(tx => {
        const amt = parseFloat(tx.amount);
        if (tx.type === 'income') {
            incomeSum += amt;
        } else {
            expenseSum += amt;
            if (categoryDistribution[tx.category] !== undefined) {
                categoryDistribution[tx.category] += amt;
            } else {
                if(!categoryDistribution['Misc']) categoryDistribution['Misc'] = 0;
                categoryDistribution['Misc'] += amt;
            }
        }
    });

    const totalNetBalance = incomeSum - expenseSum;

    // Direct UI Strings Render
    if(totalBalanceEl) totalBalanceEl.innerText = `$${totalNetBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if(cardBalanceDisplay) cardBalanceDisplay.innerText = `$${totalNetBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if(totalIncomeEl) totalIncomeEl.innerText = `$${incomeSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if(totalExpensesEl) totalExpensesEl.innerText = `$${expenseSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    updateBudgetProgressBars(categoryDistribution);
    refreshFintechCharts(categoryDistribution);
}

// Dynamic Limits Progress Component Renderer
function updateBudgetProgressBars(distributionData) {
    const container = document.getElementById('budgetBarsContainer');
    if (!container) return;
    container.innerHTML = '';

    // Loop through limits to create matching view parameters
    Object.keys(budgetLimits).forEach(categoryKey => {
        // Skip rendering if category has been custom deleted or doesn't map out
        if (!customCategories.includes(categoryKey) || categoryKey === 'Salary') return;

        const spent = distributionData[categoryKey] || 0;
        const limitMax = budgetLimits[categoryKey];
        const percentage = Math.min((spent / limitMax) * 100, 100);

        let trackColor = 'bg-indigo-600';
        if (percentage >= 90) {
            trackColor = 'bg-rose-500';
        } else if (percentage >= 75) {
            trackColor = 'bg-amber-500';
        }

        const barMarkup = `
            <div>
                <div class="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    <span>${categoryKey === 'Rent' ? '🏠 Rent & Utilities' : categoryKey}</span>
                    <span class="text-slate-700 font-semibold">$${spent.toFixed(2)} / $${parseFloat(limitMax).toFixed(2)}</span>
                </div>
                <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500 ${trackColor}" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', barMarkup);
    });
}

function renderTransactionHistoryLogs() {
    if(!transactionTableBody) return;
    transactionTableBody.innerHTML = '';
    
    const operationalQueue = [...transactions].reverse();

    operationalQueue.forEach(tx => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50/60 transition group border-b border-slate-100";
        
        const styleTag = tx.type === 'income' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-slate-700 bg-slate-50 border-slate-100';
        const operatorSymbol = tx.type === 'income' ? '+' : '-';

        tr.innerHTML = `
            <td class="p-4 pl-6 font-bold text-slate-800">${escapeHtml(tx.title)}</td>
            <td class="p-4 text-slate-500 font-medium">${tx.category}</td>
            <td class="p-4 text-slate-400 text-xs font-mono">${tx.date}</td>
            <td class="p-4">
                <span class="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${styleTag}">
                    ${tx.type === 'income' ? 'Settled' : 'Debit'}
                </span>
            </td>
            <td class="p-4 pr-6 text-right font-black text-sm ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}">
                ${operatorSymbol}$${parseFloat(tx.amount).toFixed(2)}
            </td>
            <td class="p-4 text-center">
                <button onclick="wipeRecord(${tx.id})" class="text-slate-300 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                    <i data-lucide="trash" class="w-4 h-4"></i>
                </button>
            </td>
        `;
        transactionTableBody.appendChild(tr);
    });
    lucide.createIcons();
}

// Fintech Chart Rendering (Line Graph Style — Dynamic Extraction)
function refreshFintechCharts(distributionData) {
    const canvas = document.getElementById('categoryChart');
    if(!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Filter out Salary revenue vector out of expenditure graphs line maps
    const chartLabels = customCategories.filter(c => c !== 'Salary');
    const dataPoints = chartLabels.map(label => distributionData[label] || 0);

    if (categoryChart) {
        categoryChart.data.labels = chartLabels;
        categoryChart.data.datasets[0].data = dataPoints;
        categoryChart.update();
        return;
    }

    categoryChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [{
                data: dataPoints,
                borderColor: '#4F46E5',
                borderWidth: 3,
                pointBackgroundColor: '#4F46E5',
                pointRadius: 4,
                tension: 0.35,
                fill: true,
                backgroundColor: 'rgba(79, 70, 229, 0.04)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: '#F1F5F9' }, ticks: { color: '#94A3B8', font: { weight: '600', size: 11 } }, border: { display: false } },
                x: { grid: { display: false }, ticks: { color: '#64748B', font: { weight: '600', size: 12 } } }
            }
        }
    });
}

// Quick Actions Handler
window.quickTransfer = function(targetName, defaultAmount) {
    const confirmation = confirm(`Authorize instant quick transfer node of $${defaultAmount} to ${targetName}?`);
    if (!confirmation) return;

    transactions.push({
        id: Date.now(),
        title: `Transfer to ${targetName}`,
        amount: defaultAmount,
        type: 'expense',
        category: 'Misc',
        date: new Date().toISOString().split('T')[0]
    });
    commitState();
};

transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    transactions.push({
        id: Date.now(),
        title: document.getElementById('txTitle').value,
        amount: parseFloat(document.getElementById('txAmount').value),
        type: document.getElementById('txType').value,
        category: document.getElementById('txCategory').value,
        date: document.getElementById('txDate').value
    });
    commitState();
    closeModal();
});

// Target limits form tracking observer
const budgetForm = document.getElementById('budgetForm');
if (budgetForm) {
    budgetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const categorySelection = document.getElementById('budgetCategory').value;
        const maximumThreshold = parseFloat(document.getElementById('budgetAmount').value);

        if (maximumThreshold > 0) {
            budgetLimits[categorySelection] = maximumThreshold;
            localStorage.setItem('nexus_limits', JSON.stringify(budgetLimits));
            processFinancialTelemetry();
            budgetForm.reset();
        }
    });
}

// CATEGORY REGISTRY LOGIC COUPLING OBSERVER
const categoryForm = document.getElementById('categoryForm');
if (categoryForm) {
    categoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputEl = document.getElementById('newCategoryName');
        const nodeName = inputEl.value.trim();

        // Prevent duplicate nodes tracking failures inside arrays
        if (nodeName && !customCategories.includes(nodeName)) {
            customCategories.push(nodeName);
            // Assign baseline constraint threshold for the new node vector parameters
            budgetLimits[nodeName] = 500; 

            localStorage.setItem('nexus_categories', JSON.stringify(customCategories));
            localStorage.setItem('nexus_limits', JSON.stringify(budgetLimits));

            renderCategoryDropdowns();
            processFinancialTelemetry();
            categoryForm.reset();
            alert(`Category Node "${nodeName}" deployed successfully to the ledger configuration matrices!`);
        } else {
            alert("Node parameters allocation failure: Category node already configured.");
        }
    });
}

window.wipeRecord = function(id) {
    transactions = transactions.filter(t => t.id !== id);
    commitState();
};

function commitState() {
    localStorage.setItem('nexus_ledger', JSON.stringify(transactions));
    processFinancialTelemetry();
    renderTransactionHistoryLogs();
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Single Page Tab Navigation Route Execution
const navLinks = document.querySelectorAll('.nav-link');
const tabContents = document.querySelectorAll('.tab-content');
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');

const pageMeta = {
    dashboard: { title: "Financial Overview", subtitle: "Live monitoring structural balance telemetry values." },
    transactions: { title: "Operations Ledger", subtitle: "Deep-history indexing parameters of all active ledger accounts." },
    budgets: { title: "Limits & Goals", subtitle: "Adjust performance caps and execution parameter boundaries." },
    settings: { title: "Nexus Parameters", subtitle: "Configure interface configurations and clear system state nodes." }
};

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const route = link.getAttribute('data-tab');

        navLinks.forEach(l => {
            l.classList.remove('bg-indigo-50', 'text-indigo-600', 'font-semibold');
            l.classList.add('text-slate-500', 'font-medium');
        });

        link.classList.remove('text-slate-500', 'font-medium');
        link.classList.add('bg-indigo-50', 'text-indigo-600', 'font-semibold');

        tabContents.forEach(content => content.classList.add('hidden'));
        document.getElementById(`tab-${route}`).classList.remove('hidden');

        if(pageMeta[route]) {
            pageTitle.innerText = pageMeta[route].title;
            pageSubtitle.innerText = pageMeta[route].subtitle;
        }
    });
});

// Boot Initializer Hook
document.addEventListener('DOMContentLoaded', () => {
    renderCategoryDropdowns();
    processFinancialTelemetry();
    renderTransactionHistoryLogs();
});
