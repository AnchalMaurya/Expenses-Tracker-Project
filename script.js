let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const list = document.getElementById("list");
const totalIncomeEl = document.getElementById("total-income");
const totalExpensesEl = document.getElementById("total-expenses");
const balanceEl = document.getElementById("balance");
const weeklyAverageEl = document.getElementById("weekly-average");

// Canvas elements for charts
const weeklyChartCanvas = document.getElementById("weeklyChart");
const categoryChartCanvas = document.getElementById("categoryChart");

/* ---------------- ADD INCOME MODAL ---------------- */
document.getElementById("addIncomeBtn").onclick = () =>
  document.getElementById("incomeModal").style.display = "flex";

document.getElementById("addExpenseBtn").onclick = () =>
  document.getElementById("expenseModal").style.display = "flex";

document.querySelectorAll(".close").forEach(btn => {
  btn.addEventListener("click", () => {
    const modal = btn.dataset.close;
    document.getElementById(modal).style.display = "none";
  });
});

/* ---------------- ADD INCOME ---------------- */
document.getElementById("incomeForm").addEventListener("submit", e => {
  e.preventDefault();
  const t = {
    type: "income",
    title: incomeTitle.value,
    amount: +incomeAmount.value,
    date: incomeDate.value,
    category: "Income"
  };
  transactions.push(t);
  saveAndRender();
  incomeForm.reset(); 
  document.getElementById("incomeModal").style.display = "none";
});

/* ---------------- ADD EXPENSE ---------------- */
document.getElementById("expenseForm").addEventListener("submit", e => {
  e.preventDefault();
  const t = {
    type: "expense",
    title: expenseTitle.value,
    amount: +expenseAmount.value,
    date: expenseDate.value,
    category: expenseCategory.value
  };
  transactions.push(t);
  saveAndRender();
  expenseForm.reset();
  document.getElementById("expenseModal").style.display = "none";
});

/* ---------------- DELETE ---------------- */
function deleteTransaction(i) {
  transactions.splice(i, 1);
  saveAndRender();
}

/* ---------------- SEARCH ---------------- */
document.getElementById("search").addEventListener("input", renderTransactions);

/* ---------------- FILTERS ---------------- */
document.querySelectorAll("#filters button").forEach(btn => {
  btn.onclick = () => renderTransactions(btn.dataset.filter);
});

function calculateWeeklyAverage() {
  const today = new Date();
  const last7 = {};

  // Prepare last 7 days keys
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    last7[key] = 0;
  }

  // Add only expense amounts
  transactions.forEach(t => {
    if (t.type === "expense" && last7[t.date] !== undefined) {
      last7[t.date] += t.amount;
    }
  });

  // Calculate average of last 7 days
  const totalSpending = Object.values(last7).reduce((a, b) => a + b, 0);
  const weeklyAvg = totalSpending / 7;

  weeklyAverageEl.textContent = "₹ " + weeklyAvg.toFixed(2);
}

/* ---------------- Render Transactions ---------------- */
function renderTransactions(filter = "all") {
  list.innerHTML = "";

  let filtered = transactions.filter(t =>
    (filter === "all" || t.type === filter) &&
    t.title.toLowerCase().includes(search.value.toLowerCase())
  );

  filtered.forEach((t, index) => {
    const li = document.createElement("li");
    li.classList.add(t.type);
    li.innerHTML = `
      <span>${t.date} | ${t.title} (${t.category})</span>
      <span>${t.type === "income" ? "+" : "-"}₹${t.amount}</span>
      <button onclick="deleteTransaction(${index})">❌</button>
    `;
    list.appendChild(li);
  });

  updateOverview();
  updateReports();
  calculateWeeklyAverage();
}

/* ---------------- Update Calculations ---------------- */
function updateOverview() {
  const income = transactions.filter(t => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const expenses = transactions.filter(t => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  totalIncomeEl.textContent = "₹" + income;
  totalExpensesEl.textContent = "₹" + expenses;
  balanceEl.textContent = "₹" + (income - expenses);
}

function saveAndRender() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderTransactions();
}

/* ===================== WEEKLY + CATEGORY REPORTS ===================== */
let weeklyChart, categoryChart;

function updateReports() {
  /* ------------ WEEKLY SPENDING (LAST 7 DAYS) ------------ */
  const last7 = {};
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    last7[key] = 0;
  }

  transactions.forEach(t => {
    if (t.type === "expense" && last7[t.date] !== undefined) {
      last7[t.date] += t.amount;
    }
  });

  const weekLabels = Object.keys(last7);
  const weekValues = Object.values(last7);

  if (weeklyChart) weeklyChart.destroy();
  weeklyChart = new Chart(weeklyChartCanvas, {
    type: "line",
    data: {
      labels: weekLabels,
      datasets: [{
        label: "Spending (₹)",
        data: weekValues,
        borderWidth: 2,
        tension: 0.4
      }]
    }
  });

  /* ------------ CATEGORY DISTRIBUTION ------------ */
  const categories = {};
  transactions.forEach(t => {
    if (t.type === "expense") {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    }
  });

  if (categoryChart) categoryChart.destroy();
  categoryChart = new Chart(categoryChartCanvas, {
    type: "pie",
    data: {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: [
          "#0abcc3", "rgb(99, 138, 214)", "#f3885bff", "#68d668ff", "rgba(236, 104, 104, 1)", "rgb(193, 102, 226)"
        ]
      }]
    }
  });
}

renderTransactions();
