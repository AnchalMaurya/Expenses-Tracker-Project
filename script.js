const form = document.getElementById('expense-form');
const tableBody = document.querySelector('#expense-table tbody');
const totalEl = document.getElementById('total');
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

function render() {
    tableBody.innerHTML = '';
    let total = 0;
    expenses.forEach((exp, index) => {
        total += exp.amount;
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td>${exp.desc}</td>
        <td>Rs.${exp.amount.toFixed(2)}</td>
        <td>${exp.category}</td>
        <td>${exp.date}</td>
        <td><button onclick="removeExpense(${index})">Remove</button></td>
        `;
        tableBody.appendChild(tr);
    });
    totalEl.textContent = total.toFixed(2);
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

form.addEventListener('submit', e => {
    e.preventDefault();
    const desc = document.getElementById('desc').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = new Date().toLocaleDateString();
    expenses.push({ desc, amount, category, date });
    form.reset();
    render();
});

function removeExpense(index) {
    expenses.splice(index, 1);
    render();
}

render();