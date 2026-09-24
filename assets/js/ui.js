// Shared popup that replaces the browser's alert().
// Usage: await showAlert("Saved!", { type: "success", title: "Thank you" });
// Closes via the X, the OK button, Escape, or a click anywhere.

const ALERT_STYLES = {
    success: { color: "text-green-600", bg: "bg-green-100", title: "Success", icon: '<path d="M20 6 9 17l-5-5"/>' },
    error: { color: "text-red-600", bg: "bg-red-100", title: "Something went wrong", icon: '<path d="M18 6 6 18M6 6l12 12"/>' },
    info: { color: "text-blue-600", bg: "bg-blue-100", title: "Notice", icon: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>' },
};

function showAlert(message, options = {}) {
    const style = ALERT_STYLES[options.type] || ALERT_STYLES.info;
    const title = options.title || style.title;

    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className =
            "fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 cursor-pointer";
        overlay.setAttribute("role", "alertdialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.setAttribute("aria-labelledby", "sda-alert-title");

        const card = document.createElement("div");
        card.className = "relative w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-2xl";

        const closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.setAttribute("aria-label", "Close");
        closeBtn.className =
            "absolute right-3 top-3 rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700";
        closeBtn.innerHTML =
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';

        const iconWrap = document.createElement("div");
        iconWrap.className = `mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${style.bg} ${style.color}`;
        iconWrap.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${style.icon}</svg>`;

        const h = document.createElement("h2");
        h.id = "sda-alert-title";
        h.className = "mb-2 text-lg font-semibold text-gray-900";
        h.textContent = title;

        const p = document.createElement("p");
        p.className = "mb-5 text-sm text-gray-600";
        p.textContent = message;

        const okBtn = document.createElement("button");
        okBtn.type = "button";
        okBtn.className =
            "w-full rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-orange-600";
        okBtn.textContent = "OK";

        const hint = document.createElement("p");
        hint.className = "mt-3 text-xs text-gray-400";
        hint.textContent = "Click anywhere to close";

        card.append(closeBtn, iconWrap, h, p, okBtn, hint);
        overlay.appendChild(card);

        const previouslyFocused = document.activeElement;

        function close() {
            document.removeEventListener("keydown", onKey);
            overlay.remove();
            if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
            resolve();
        }
        function onKey(e) {
            if (e.key === "Escape" || e.key === "Enter") {
                e.preventDefault();
                close();
            }
        }

        overlay.addEventListener("click", close);
        document.addEventListener("keydown", onKey);

        document.body.appendChild(overlay);
        okBtn.focus();
    });
}
