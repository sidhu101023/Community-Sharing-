const profilePanel = document.getElementById("profilePanel");

async function loadProfile() {
    const details = document.getElementById("profileDetails");
    if (!details || !localStorage.getItem("token")) return;
    try {
        const user = await apiRequest("/users/profile");
        const location = user.location?.address || "No location selected";
        const stats = user.stats || {};
        details.innerHTML = `
            <div class="profile-item"><span>Full Name</span><strong>${escapeProfile(user.name)}</strong></div>
            <div class="profile-item"><span>Email</span><strong>${escapeProfile(user.email)}</strong></div>
            <div class="profile-item"><span>Location</span><strong>${escapeProfile(location)}</strong></div>
            <div class="profile-stat"><span>Resources Shared</span><strong>${stats.resourcesShared || 0}</strong></div>
            <div class="profile-stat"><span>Resources Requested</span><strong>${stats.resourcesRequested || 0}</strong></div>
            <div class="profile-stat"><span>Successful Transactions</span><strong>${stats.successfulTransactions || 0}</strong></div>`;
    } catch (error) {
        details.textContent = "Please login first.";
    }
}

function escapeProfile(value) {
    return String(value || "").replace(/[&<>'"]/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;"
    })[character]);
}

document.getElementById("profileBtn")?.addEventListener("click", () => {
    if (localStorage.getItem("token")) loadProfile();
});

document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "resources.html";
});
