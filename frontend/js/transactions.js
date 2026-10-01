let currentRequestStatus = "Pending";
let allMyRequests = [];
let allMyResources = [];
let activeTransactions = [];
let transactionHistory = [];

async function loadTransactions() {
    const sections = ["myRequests", "myResources", "activeTransactions", "transactionHistory"];
    try {
        [allMyRequests, allMyResources, activeTransactions, transactionHistory] = await Promise.all([
            apiRequest("/transactions/my-requests"),
            apiRequest("/transactions/my-resources"),
            apiRequest("/transactions/active"),
            apiRequest("/transactions/history")
        ]);
        renderMyRequests();
        renderOwnerRequests();
        renderActiveTransactions();
        renderHistory();
    } catch (error) {
        sections.forEach(id => {
            const node = document.getElementById(id);
            if (node) node.innerHTML = `<p class="transaction-message">${escapeTransaction(error.message)}</p>`;
        });
    }
}

function renderMyRequests() {
    const items = allMyRequests.filter(transaction => transaction.status === currentRequestStatus);
    const content = items.map(transaction => {
        let actions = "";
        if (transaction.status === "Pending") {
            actions = actionButton(transaction._id, "status", "Cancelled", "Cancel Request");
        } else if (transaction.status === "Approved") {
            actions = `<span class="inline-note">See Active Transactions</span>`;
        }
        return transactionRow(transaction, actions, "Owner", transaction.owner?.name);
    }).join("");
    renderEmptyAware("myRequests", content, "No requests found for this state.");
}

function renderOwnerRequests() {
    const content = allMyResources.map(transaction => {
        let actions = "";
        if (transaction.status === "Pending") {
            actions = actionButton(transaction._id, "status", "Approved", "Accept") +
                actionButton(transaction._id, "status", "Rejected", "Reject");
        }
        return transactionRow(transaction, actions, "Requester", transaction.requester?.name);
    }).join("");
    renderEmptyAware("myResources", content, "No requests for your resources yet.");
}

function renderActiveTransactions() {
    const content = activeTransactions.map(transaction => {
        const currentUserId = getCurrentUserId();
        const isOwner = String(transaction.owner?._id) === String(currentUserId);
        const currentUserCompleted = isOwner ? transaction.ownerCompleted : transaction.requesterCompleted;
        const actions = currentUserCompleted
            ? `<span class="inline-note">Waiting for the other participant</span>`
            : actionButton(transaction._id, "complete", "", "Mark as Completed");
        const completion = `<div class="completion-state">Owner: ${transaction.ownerCompleted ? "Complete" : "Pending"} | Requester: ${transaction.requesterCompleted ? "Complete" : "Pending"}</div>`;
        const contact = contactBlock(transaction);
        return transactionRow(transaction, `${completion}${actions}${contact}`, isOwner ? "Requester" : "Owner", isOwner ? transaction.requester?.name : transaction.owner?.name);
    }).join("");
    renderEmptyAware("activeTransactions", content, "No active transactions.");
}

function renderHistory() {
    const content = transactionHistory.map(transaction => {
        const currentUserId = getCurrentUserId();
        const isOwner = String(transaction.owner?._id) === String(currentUserId);
        const otherPerson = isOwner ? transaction.requester?.name : transaction.owner?.name;
        return transactionRow(transaction, transaction.status === "Completed" ? `<span class="inline-note">Completed</span>` : "", "Other participant", otherPerson);
    }).join("");
    renderEmptyAware("transactionHistory", content, "No transaction history yet.");
}

function renderEmptyAware(id, content, emptyMessage) {
    const node = document.getElementById(id);
    if (node) node.innerHTML = content || `<p class="transaction-message">${emptyMessage}</p>`;
}

function transactionRow(transaction, actions, label, person) {
    const resource = transaction.resource || {};
    const image = resource.image || "https://placehold.co/120x80/png?text=Resource";
    const location = resource.location?.address || "Location unavailable";
    const date = transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : "Unknown date";
    return `<article class="transaction-row">
        <div class="transaction-resource">
            <img src="${escapeTransaction(image)}" alt="${escapeTransaction(resource.name || "Resource")}" onerror="this.src='https://placehold.co/120x80/png?text=Resource'">
            <div><strong>${escapeTransaction(resource.name || "Removed resource")}</strong><small>${escapeTransaction(resource.category || "")}</small></div>
        </div>
        <div><span class="transaction-label">${escapeTransaction(label)}</span>${escapeTransaction(person || "Unknown")}<small>${escapeTransaction(location)}</small></div>
        <div>${escapeTransaction(date)}</div>
        <div class="status status-${escapeTransaction(transaction.status.toLowerCase())}">${escapeTransaction(transaction.status)}</div>
        <div class="transaction-actions">${actions}</div>
    </article>`;
}

function contactBlock(transaction) {
    const owner = transaction.owner || {};
    const requester = transaction.requester || {};
    return `<div class="contact-info"><strong>Contact information</strong><br>
        Owner: ${escapeTransaction(owner.name)} | ${escapeTransaction(owner.phone || "Mobile unavailable")} | ${escapeTransaction(owner.email || "Email unavailable")}<br>
        Requester: ${escapeTransaction(requester.name)} | ${escapeTransaction(requester.phone || "Mobile unavailable")} | ${escapeTransaction(requester.email || "Email unavailable")}
    </div>`;
}

function actionButton(id, action, status, label) {
    return `<button type="button" data-id="${escapeTransaction(id)}" data-action="${action}" data-status="${escapeTransaction(status)}">${escapeTransaction(label)}</button>`;
}

function getCurrentUserId() {
    try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        return user?._id || user?.id;
    } catch (error) {
        return null;
    }
}

document.addEventListener("click", async event => {
    const button = event.target.closest("button[data-id][data-action]");
    if (!button || button.disabled) return;
    button.disabled = true;
    try {
        const endpoint = button.dataset.action === "complete"
            ? `/transactions/${button.dataset.id}/complete`
            : `/transactions/${button.dataset.id}/status`;
        const body = button.dataset.action === "complete" ? undefined : JSON.stringify({ status: button.dataset.status });
        await apiRequest(endpoint, { method: "PUT", ...(body ? { body } : {}) });
        await loadTransactions();
    } catch (error) {
        button.disabled = false;
        alert(error.message);
    }
});

document.querySelectorAll(".request-tab").forEach(tab => tab.addEventListener("click", () => {
    document.querySelectorAll(".request-tab").forEach(item => item.classList.remove("active"));
    tab.classList.add("active");
    currentRequestStatus = tab.dataset.status;
    renderMyRequests();
}));

function escapeTransaction(value) {
    return String(value || "").replace(/[&<>'"]/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;"
    }[character]));
}

if (document.getElementById("myRequests")) loadTransactions();
