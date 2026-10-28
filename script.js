/* =====================================
   EXPENSEFLOW
   EXPENSE TRACKER APPLICATION
===================================== */


/* =====================================
   DATA
===================================== */

let transactions =
    JSON.parse(localStorage.getItem("expenseFlowTransactions")) || [];


/* =====================================
   DOM ELEMENTS
===================================== */

const modalOverlay =
    document.getElementById("modalOverlay");

const openModalBtn =
    document.getElementById("openModalBtn");

const closeModalBtn =
    document.getElementById("closeModalBtn");

const cancelBtn =
    document.getElementById("cancelBtn");

const transactionForm =
    document.getElementById("transactionForm");

const transactionName =
    document.getElementById("transactionName");

const transactionAmount =
    document.getElementById("transactionAmount");

const transactionCategory =
    document.getElementById("transactionCategory");

const transactionDate =
    document.getElementById("transactionDate");

const transactionDescription =
    document.getElementById("transactionDescription");

const transactionType =
    document.getElementById("transactionType");


/* =====================================
   CHART VARIABLES
===================================== */

let incomeExpenseChart;

let categoryChart;


/* =====================================
   DEFAULT DATE
===================================== */

transactionDate.value =
    new Date().toISOString().split("T")[0];


/* =====================================
   MODAL
===================================== */

openModalBtn.addEventListener("click", openModal);

closeModalBtn.addEventListener("click", closeModal);

cancelBtn.addEventListener("click", closeModal);


modalOverlay.addEventListener("click", function(event) {

    if (event.target === modalOverlay) {

        closeModal();

    }

});


function openModal() {

    modalOverlay.classList.add("show");

}


function closeModal() {

    modalOverlay.classList.remove("show");

    transactionForm.reset();

    transactionDate.value =
        new Date().toISOString().split("T")[0];

    setTransactionType("expense");

}


/* =====================================
   TRANSACTION TYPE
===================================== */

const typeButtons =
    document.querySelectorAll(".type-btn");


typeButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        const selectedType =
            button.dataset.type;

        setTransactionType(selectedType);

    });

});


function setTransactionType(type) {

    transactionType.value = type;

    typeButtons.forEach(function(button) {

        button.classList.remove("active");

        if (button.dataset.type === type) {

            button.classList.add("active");

        }

    });

}


/* =====================================
   ADD TRANSACTION
===================================== */

transactionForm.addEventListener("submit", function(event) {

    event.preventDefault();


    const name =
        transactionName.value.trim();

    const amount =
        Number(transactionAmount.value);

    const category =
        transactionCategory.value;

    const date =
        transactionDate.value;

    const description =
        transactionDescription.value.trim();

    const type =
        transactionType.value;


    if (!name || amount <= 0 || !date) {

        alert("Please enter valid transaction details.");

        return;

    }


    const newTransaction = {

        id: Date.now(),

        name: name,

        amount: amount,

        category: category,

        date: date,

        description: description,

        type: type

    };


    transactions.push(newTransaction);


    saveTransactions();

    updateApplication();

    closeModal();

});


/* =====================================
   SAVE DATA
===================================== */

function saveTransactions() {

    localStorage.setItem(
        "expenseFlowTransactions",
        JSON.stringify(transactions)
    );

}


/* =====================================
   TOTAL CALCULATIONS
===================================== */

function calculateTotals() {

    let income = 0;

    let expense = 0;


    transactions.forEach(function(transaction) {

        if (transaction.type === "income") {

            income += transaction.amount;

        } else {

            expense += transaction.amount;

        }

    });


    const balance =
        income - expense;


    return {
        income,
        expense,
        balance
    };

}


/* =====================================
   UPDATE SUMMARY
===================================== */

function updateSummary() {

    const totals =
        calculateTotals();


    document.getElementById("totalIncome")
        .textContent =
        formatCurrency(totals.income);


    document.getElementById("totalExpense")
        .textContent =
        formatCurrency(totals.expense);


    document.getElementById("balance")
        .textContent =
        formatCurrency(totals.balance);


    let savingsRate = 0;


    if (totals.income > 0) {

        savingsRate =
            ((totals.income - totals.expense)
                / totals.income) * 100;

    }


    document.getElementById("savingsRate")
        .textContent =
        Math.max(0, savingsRate).toFixed(1) + "%";

}


/* =====================================
   CURRENCY
===================================== */

function formatCurrency(amount) {

    return new Intl.NumberFormat("en-IN", {

        style: "currency",

        currency: "INR",

        maximumFractionDigits: 2

    }).format(amount);

}


/* =====================================
   RECENT TRANSACTIONS
===================================== */

function renderRecentTransactions() {

    const container =
        document.getElementById("recentTransactions");


    if (transactions.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    💳
                </div>

                <p>No transactions yet.</p>

            </div>

        `;

        return;

    }


    const recent =
        [...transactions]

            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )

            .slice(0, 5);


    container.innerHTML =
        recent.map(function(transaction) {

            return `

                <div class="recent-row">

                    <div>

                        <strong>
                            ${escapeHTML(transaction.name)}
                        </strong>

                        <small>
                            ${transaction.category}
                            •
                            ${formatDate(transaction.date)}
                        </small>

                    </div>

                    <strong class="${
                        transaction.type === "income"
                            ? "income-text"
                            : "expense-text"
                    }">

                        ${
                            transaction.type === "income"
                                ? "+"
                                : "-"
                        }

                        ${formatCurrency(transaction.amount)}

                    </strong>

                </div>

            `;

        }).join("");


}


/* =====================================
   TRANSACTION TABLE
===================================== */

function renderTransactions() {

    const table =
        document.getElementById("transactionTable");


    const search =
        document.getElementById("searchInput")
            .value
            .toLowerCase();


    const typeFilter =
        document.getElementById("typeFilter")
            .value;


    const categoryFilter =
        document.getElementById("categoryFilter")
            .value;


    let filtered =
        transactions.filter(function(transaction) {


            const matchesSearch =
                transaction.name
                    .toLowerCase()
                    .includes(search);


            const matchesType =
                typeFilter === "all" ||
                transaction.type === typeFilter;


            const matchesCategory =
                categoryFilter === "all" ||
                transaction.category === categoryFilter;


            return (
                matchesSearch &&
                matchesType &&
                matchesCategory
            );

        });


    filtered.sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    );


    if (filtered.length === 0) {

        table.innerHTML = `

            <tr>

                <td colspan="6">

                    <div class="empty-state">

                        <div class="empty-state-icon">
                            🔍
                        </div>

                        No transactions found.

                    </div>

                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML =
        filtered.map(function(transaction) {

            return `

                <tr>

                    <td>

                        <div class="transaction-name">

                            ${escapeHTML(transaction.name)}

                        </div>

                        <div class="transaction-description">

                            ${
                                escapeHTML(
                                    transaction.description || ""
                                )
                            }

                        </div>

                    </td>


                    <td>

                        <span class="badge">

                            ${transaction.category}

                        </span>

                    </td>


                    <td>

                        ${formatDate(transaction.date)}

                    </td>


                    <td>

                        ${
                            transaction.type === "income"
                                ? "Income"
                                : "Expense"
                        }

                    </td>


                    <td class="${
                        transaction.type === "income"
                            ? "income-text"
                            : "expense-text"
                    }">

                        ${
                            transaction.type === "income"
                                ? "+"
                                : "-"
                        }

                        ${formatCurrency(transaction.amount)}

                    </td>


                    <td>

                        <button
                            class="delete-btn"
                            onclick="deleteTransaction(${transaction.id})"
                        >

                            🗑

                        </button>

                    </td>

                </tr>

            `;

        }).join("");

}


/* =====================================
   DELETE
===================================== */

function deleteTransaction(id) {

    const confirmed =
        confirm("Delete this transaction?");


    if (!confirmed) {

        return;

    }


    transactions =
        transactions.filter(
            transaction =>
                transaction.id !== id
        );


    saveTransactions();

    updateApplication();

}


/* =====================================
   CATEGORY FILTER
===================================== */

function populateCategoryFilter() {

    const select =
        document.getElementById("categoryFilter");


    const categories =
        [...new Set(
            transactions.map(
                transaction =>
                    transaction.category
            )
        )];


    select.innerHTML =
        `<option value="all">
            All Categories
        </option>`;


    categories.forEach(function(category) {

        select.innerHTML += `

            <option value="${category}">
                ${category}
            </option>

        `;

    });

}


/* =====================================
   CATEGORY TOTALS
===================================== */

function getCategoryTotals() {

    const totals = {};


    transactions

        .filter(
            transaction =>
                transaction.type === "expense"
        )

        .forEach(function(transaction) {

            if (!totals[transaction.category]) {

                totals[transaction.category] = 0;

            }


            totals[transaction.category] +=
                transaction.amount;

        });


    return totals;

}


/* =====================================
   CATEGORY CHART
===================================== */

function renderCategoryChart() {

    const canvas =
        document.getElementById("categoryChart");


    const categoryTotals =
        getCategoryTotals();


    const labels =
        Object.keys(categoryTotals);


    const values =
        Object.values(categoryTotals);


    if (categoryChart) {

        categoryChart.destroy();

    }


    categoryChart =
        new Chart(canvas, {

            type: "doughnut",

            data: {

                labels: labels,

                datasets: [{

                    data: values,

                    borderWidth: 0

                }]

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,

                cutout: "68%",

                plugins: {

                    legend: {

                        display: false

                    }

                }

            }

        });


    renderCategoryLegend(categoryTotals);

}


/* =====================================
   CATEGORY LEGEND
===================================== */

function renderCategoryLegend(categoryTotals) {

    const legend =
        document.getElementById("categoryLegend");


    const total =
        Object.values(categoryTotals)
            .reduce(
                (sum, value) =>
                    sum + value,
                0
            );


    if (total === 0) {

        legend.innerHTML =
            `<p class="empty-state">
                No expense data yet.
            </p>`;

        return;

    }


    legend.innerHTML =
        Object.entries(categoryTotals)

            .sort(
                (a, b) =>
                    b[1] - a[1]
            )

            .map(function([category, amount]) {

                const percentage =
                    (amount / total) * 100;


                return `

                    <div class="legend-item">

                        <span class="legend-name">

                            ${category}

                        </span>

                        <strong>

                            ${percentage.toFixed(1)}%

                        </strong>

                    </div>

                `;

            }).join("");

}


/* =====================================
   DAILY / WEEKLY / MONTHLY
===================================== */

function isToday(dateString) {

    const date =
        new Date(dateString);

    const today =
        new Date();


    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    );

}


function isThisWeek(dateString) {

    const date =
        new Date(dateString);

    const today =
        new Date();


    const day =
        today.getDay();


    const difference =
        day === 0 ? 6 : day - 1;


    const monday =
        new Date(today);


    monday.setDate(
        today.getDate() - difference
    );


    monday.setHours(0, 0, 0, 0);


    return date >= monday &&
        date <= today;

}


function isThisMonth(dateString) {

    const date =
        new Date(dateString);

    const today =
        new Date();


    return (
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );

}


/* =====================================
   ANALYTICS
===================================== */

function updateAnalytics() {

    const daily =
        getExpensesByCondition(isToday);


    const weekly =
        getExpensesByCondition(isThisWeek);


    const monthly =
        getExpensesByCondition(isThisMonth);


    document.getElementById("dailyExpense")
        .textContent =
        formatCurrency(daily);


    document.getElementById("weeklyExpense")
        .textContent =
        formatCurrency(weekly);


    document.getElementById("monthlyExpense")
        .textContent =
        formatCurrency(monthly);


    renderAnalyticsCategories();

}


function getExpensesByCondition(condition) {

    return transactions

        .filter(function(transaction) {

            return (
                transaction.type === "expense" &&
                condition(transaction.date)
            );

        })

        .reduce(function(total, transaction) {

            return total + transaction.amount;

        }, 0);

}


/* =====================================
   ANALYTICS CATEGORY BARS
===================================== */

function renderAnalyticsCategories() {

    const container =
        document.getElementById("analyticsCategories");


    const totals =
        getCategoryTotals();


    const entries =
        Object.entries(totals)

            .sort(
                (a, b) =>
                    b[1] - a[1]
            );


    if (entries.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                No expense data available.

            </div>

        `;

        return;

    }


    const maximum =
        Math.max(
            ...entries.map(
                entry => entry[1]
            )
        );


    container.innerHTML =
        entries.map(function([category, amount]) {

            const percentage =
                (amount / maximum) * 100;


            return `

                <div class="analytics-category">

                    <div class="analytics-category-header">

                        <span>
                            ${category}
                        </span>

                        <strong>
                            ${formatCurrency(amount)}
                        </strong>

                    </div>


                    <div class="progress">

                        <div
                            class="progress-bar"
                            style="width:${percentage}%"
                        ></div>

                    </div>

                </div>

            `;

        }).join("");

}


/* =====================================
   PERIOD CHART
===================================== */

function renderIncomeExpenseChart(period = "monthly") {

    const canvas =
        document.getElementById(
            "incomeExpenseChart"
        );


    const result =
        generatePeriodData(period);


    if (incomeExpenseChart) {

        incomeExpenseChart.destroy();

    }


    incomeExpenseChart =
        new Chart(canvas, {

            type: "bar",

            data: {

                labels: result.labels,

                datasets: [

                    {

                        label: "Income",

                        data: result.income,

                        borderRadius: 5

                    },

                    {

                        label: "Expense",

                        data: result.expense,

                        borderRadius: 5

                    }

                ]

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,

                interaction: {

                    intersect: false,

                    mode: "index"

                },

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            callback: function(value) {

                                return "₹" + value;

                            }

                        }

                    }

                }

            }

        });

}


/* =====================================
   PERIOD DATA
===================================== */

function generatePeriodData(period) {

    const labels = [];

    const income = [];

    const expense = [];


    const today =
        new Date();


    if (period === "daily") {

        for (let i = 6; i >= 0; i--) {

            const date =
                new Date(today);

            date.setDate(
                today.getDate() - i
            );


            const key =
                date.toISOString()
                    .split("T")[0];


            labels.push(
                date.toLocaleDateString(
                    "en-IN",
                    {
                        weekday: "short"
                    }
                )
            );


            income.push(
                getAmountForDate(
                    key,
                    "income"
                )
            );


            expense.push(
                getAmountForDate(
                    key,
                    "expense"
                )
            );

        }

    }


    else if (period === "weekly") {

        for (let i = 3; i >= 0; i--) {

            const start =
                new Date(today);

            start.setDate(
                today.getDate() -
                (i * 7) -
                today.getDay() +
                1
            );


            const end =
                new Date(start);

            end.setDate(
                start.getDate() + 6
            );


            labels.push(
                `Week ${4 - i}`
            );


            income.push(
                getAmountForRange(
                    start,
                    end,
                    "income"
                )
            );


            expense.push(
                getAmountForRange(
                    start,
                    end,
                    "expense"
                )
            );

        }

    }


    else {

        for (let i = 5; i >= 0; i--) {

            const date =
                new Date(today.getFullYear(),
                    today.getMonth() - i,
                    1);


            const month =
                date.getMonth();


            const year =
                date.getFullYear();


            labels.push(
                date.toLocaleDateString(
                    "en-IN",
                    {
                        month: "short"
                    }
                )
            );


            income.push(
                getAmountForMonth(
                    month,
                    year,
                    "income"
                )
            );


            expense.push(
                getAmountForMonth(
                    month,
                    year,
                    "expense"
                )
            );

        }

    }


    return {
        labels,
        income,
        expense
    };

}


/* =====================================
   AMOUNT BY DATE
===================================== */

function getAmountForDate(date, type) {

    return transactions

        .filter(function(transaction) {

            return (
                transaction.date === date &&
                transaction.type === type
            );

        })

        .reduce(
            (sum, transaction) =>
                sum + transaction.amount,
            0
        );

}


/* =====================================
   AMOUNT BY RANGE
===================================== */

function getAmountForRange(
    start,
    end,
    type
) {

    return transactions

        .filter(function(transaction) {

            const date =
                new Date(transaction.date);


            return (
                date >= start &&
                date <= end &&
                transaction.type === type
            );

        })

        .reduce(
            (sum, transaction) =>
                sum + transaction.amount,
            0
        );

}


/* =====================================
   AMOUNT BY MONTH
===================================== */

function getAmountForMonth(
    month,
    year,
    type
) {

    return transactions

        .filter(function(transaction) {

            const date =
                new Date(transaction.date);


            return (
                date.getMonth() === month &&
                date.getFullYear() === year &&
                transaction.type === type
            );

        })

        .reduce(
            (sum, transaction) =>
                sum + transaction.amount,
            0
        );

}


/* =====================================
   DATE FORMAT
===================================== */

function formatDate(dateString) {

    return new Date(dateString)
        .toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

}


/* =====================================
   XSS PROTECTION
===================================== */

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* =====================================
   NAVIGATION
===================================== */

const navItems =
    document.querySelectorAll(
        ".nav-item[data-section]"
    );


navItems.forEach(function(item) {

    item.addEventListener("click", function() {

        const section =
            item.dataset.section;

        showSection(section);

    });

});


const viewAllBtn =
    document.querySelector(".view-all-btn");


viewAllBtn.addEventListener(
    "click",
    function() {

        showSection("transactions");

    }
);


function showSection(section) {

    document.querySelectorAll(".section")
        .forEach(function(element) {

            element.classList.remove(
                "active-section"
            );

        });


    document.getElementById(
        section + "Section"
    ).classList.add(
        "active-section"
    );


    navItems.forEach(function(item) {

        item.classList.remove("active");

        if (
            item.dataset.section === section
        ) {

            item.classList.add("active");

        }

    });


    const titles = {

        dashboard: "Dashboard",

        transactions: "Transactions",

        analytics: "Analytics"

    };


    document.getElementById(
        "pageTitle"
    ).textContent =
        titles[section];

}


/* =====================================
   SEARCH / FILTER
===================================== */

document.getElementById(
    "searchInput"
).addEventListener(
    "input",
    renderTransactions
);


document.getElementById(
    "typeFilter"
).addEventListener(
    "change",
    renderTransactions
);


document.getElementById(
    "categoryFilter"
).addEventListener(
    "change",
    renderTransactions
);


/* =====================================
   PERIOD SELECT
===================================== */

document.getElementById(
    "periodSelect"
).addEventListener(
    "change",
    function() {

        renderIncomeExpenseChart(
            this.value
        );

    }
);


/* =====================================
   UPDATE EVERYTHING
===================================== */

function updateApplication() {

    updateSummary();

    renderRecentTransactions();

    populateCategoryFilter();

    renderTransactions();

    renderCategoryChart();

    updateAnalytics();

    renderIncomeExpenseChart(
        document.getElementById(
            "periodSelect"
        ).value
    );

}


/* =====================================
   START APPLICATION
===================================== */

updateApplication();