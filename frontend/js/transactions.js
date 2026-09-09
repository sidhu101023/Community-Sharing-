let currentRequestStatus = "Pending";

async function loadMyRequests() {
    try {
        const transactions = await apiRequest("/transactions/my-requests");
        renderMyRequests(transactions.filter(item => item.status === currentRequestStatus));
    } catch (error) {
        document.getElementById("myRequests").textContent = error.message;
    }
}

function renderMyRequests(transactions) {
    const container = document.getElementById("myRequests");
    container.innerHTML = transactions.length ? transactions.map(transaction => transactionRow(transaction, `
        ${transaction.status === "Pending" ? actionButton(transaction._id, "Cancelled", "Cancel") : ""}
    `, "Owner", transaction.owner?.name)).join("") : "<p>No requests found for this state.</p>";
}

async function loadMyResources() {
    try {
        const transactions = await apiRequest("/transactions/my-resources");
        const container = document.getElementById("myResources");
        container.innerHTML = transactions.length ? transactions.map(transaction => {
            let actions = "";
            if (transaction.status === "Pending") {
                actions = actionButton(transaction._id, "Approved", "Approve") + actionButton(transaction._id, "Rejected", "Reject");
            } else if (transaction.status === "Approved") {
                actions = actionButton(transaction._id, "Completed", "Mark completed");
            }
            return transactionRow(transaction, actions, "Requester", transaction.requester?.name);
        }).join("") : "<p>No requests for your resources yet.</p>";
    } catch (error) {
        document.getElementById("myResources").textContent = error.message;
    }
}

function transactionRow(transaction, actions, label, person) {
    return `<div class="transaction-row"><div><strong>${escapeTransaction(transaction.resource?.name || "Removed resource")}</strong><small>${escapeTransaction(transaction.resource?.category || "")}</small></div><div>${label}: ${escapeTransaction(person || "Unknown")}</div><div>${new Date(transaction.createdAt).toLocaleDateString()}</div><div class="status">${transaction.status}</div><div>${actions}</div></div>`;
}

function actionButton(id, status, label) {
    return `<button type="button" data-id="${id}" data-status="${status}">${label}</button>`;
}

document.getElementById("myRequests")?.addEventListener("click", updateTransaction);
document.getElementById("myResources")?.addEventListener("click", updateTransaction);

async function updateTransaction(event) {
    const button = event.target.closest("button[data-id]");
    if (!button) return;
    try {
        await apiRequest(`/transactions/${button.dataset.id}/status`, {
            method: "PUT", body: JSON.stringify({ status: button.dataset.status })
        });
        await Promise.all([loadMyRequests(), loadMyResources()]);
    } catch (error) {
        alert(error.message);
    }
}

document.querySelectorAll(".request-tab").forEach(tab => tab.addEventListener("click", () => {
    document.querySelectorAll(".request-tab").forEach(item => item.classList.remove("active"));
    tab.classList.add("active");
    currentRequestStatus = tab.dataset.status;
    loadMyRequests();
}));

function escapeTransaction(value) {
    return String(value).replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" })[character]);
}

if (document.getElementById("myRequests")) {
    loadMyRequests();
    loadMyResources();
}
