// Shared auth/session handling for all pages.
// Talks to the Express backend (backend/) instead of the old localStorage("isAuth") stub.

const API_BASE = window.location.port === "5173"
    ? "http://localhost:4000/api"
    : "/api";

async function fetchCurrentUser() {
    try {
        const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
        if (!res.ok) return null;
        const data = await res.json();
        return data.user;
    } catch {
        return null;
    }
}

async function submitLead(payload) {
    try {
        const res = await fetch(`${API_BASE}/leads`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) return { ok: false, error: data.error || "Something went wrong." };
        return { ok: true };
    } catch {
        return { ok: false, error: "Could not reach the server. Please try again later." };
    }
}

async function logout() {
    try {
        await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
    } finally {
        window.location.href = "index.html";
    }
}

function renderAuthUI(user) {
    const authDesktop = document.getElementById("auth-desktop");
    const authMobile = document.getElementById("auth-mobile");
    if (!authDesktop || !authMobile) return;

    if (user) {
        const adminLink = user.role === "ADMIN"
            ? `<a href="admin.html" class="border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-100">Admin</a>`
            : "";
        authDesktop.innerHTML = `
          ${adminLink}
          <img src="images/user.png" alt="Profile" class="h-8 w-8 rounded-full object-cover">
          <button id="logout-btn" class="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md transition-colors">Logout</button>
        `;
        authMobile.innerHTML = `
          ${adminLink}
          <button id="logout-btn-mobile" class="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md transition-colors">Logout</button>
        `;
    } else {
        authDesktop.innerHTML = `
          <a href="login.html" class="border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-100">Login</a>
          <a href="register.html" class="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md">Sign Up</a>
        `;
        authMobile.innerHTML = `
          <a href="login.html" class="border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-100 text-center">Login</a>
          <a href="register.html" class="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md text-center">Sign Up</a>
        `;
    }

    const logoutBtn = document.getElementById("logout-btn");
    const logoutBtnMobile = document.getElementById("logout-btn-mobile");
    [logoutBtn, logoutBtnMobile].forEach((btn) => {
        if (btn) btn.addEventListener("click", logout);
    });
}

async function initAuthUI() {
    const user = await fetchCurrentUser();
    renderAuthUI(user);
    return user;
}
