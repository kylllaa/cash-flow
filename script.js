let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

function addRow(date = '', details = '', amount = 0, service = 0) {
  const tableBody = document.getElementById('tableBody');
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><input type="date" class="date" value="${date}"></td>
    <td><input type="text" value="${details}" placeholder="Details"></td>
    <td><input type="number" class="amount" value="${amount}" min="0"></td>
    <td><input type="number" class="service" value="${service}" min="0"></td>
    <td><input type="number" class="supplier" value="${(amount - service).toFixed(2)}" readonly></td>
  `;
  tableBody.appendChild(row);
  attachSaveEvents(row);
}

function attachSaveEvents(row) {
  row.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
      saveTransactions();
      calculateSummary();
    });
  });
}

function saveTransactions() {
  const rows = document.querySelectorAll('#tableBody tr');
  transactions = [];
  rows.forEach(r => {
    const amount = parseFloat(r.querySelector('.amount').value) || 0;
    const service = parseFloat(r.querySelector('.service').value) || 0;
    r.querySelector('.supplier').value = (amount - service).toFixed(2);
    transactions.push({
      date: r.querySelector('.date').value,
      details: r.querySelector('input[type="text"]').value,
      amount: amount,
      service: service
    });
  });
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function calculateSummary() {
  const summaryBody = document.getElementById('summaryBody');
  summaryBody.innerHTML = '';
  let dailyTotals = {};
  let grandTotal = 0;

  transactions.forEach(t => {
    if (t.date) {
      dailyTotals[t.date] = (dailyTotals[t.date] || 0) + t.service;
      grandTotal += t.service;
    }
  });

  for (let date in dailyTotals) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${date}</td><td>₱${dailyTotals[date].toFixed(2)}</td>`;
    summaryBody.appendChild(tr);
  }
  document.getElementById('grandIncome').textContent = `₱${grandTotal.toFixed(2)}`;
}

function calculateAndDownloadPDF() {
  calculateSummary();

  document.getElementById('pdfTable').innerHTML = document.getElementById('cashFlowTable').innerHTML;
  document.getElementById('pdfSummary').innerHTML = document.getElementById('dailySummaryTable').innerHTML;

  const element = document.getElementById('pdfContent');
  html2pdf().from(element).save(`Transaction_History_${new Date().toISOString().slice(0,10)}.pdf`);
}

if (transactions.length) {
  transactions.forEach(t => addRow(t.date, t.details, t.amount, t.service));
  calculateSummary();
} else {
  addRow();
}
