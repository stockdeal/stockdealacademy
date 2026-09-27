// Sends a registration to the Google Sheet (see google-sheet/SETUP.md).
const SHEET_URL = "https://script.google.com/macros/s/AKfycbyBMQAQ5QXk7JBXcfWI902Aa-LCREn5YG52JNp9Kn60T-D9fTaA4777NJkyFaBZ-Mjn/exec";

async function submitLead(payload) {
    if (!SHEET_URL.startsWith("https://")) {
        return { ok: false, error: "Registration isn't switched on yet. Please call us instead." };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
        // No custom headers on purpose: a plain text/plain POST avoids a CORS preflight,
        // which Apps Script web apps do not answer.
        const res = await fetch(SHEET_URL, {
            method: "POST",
            body: JSON.stringify({ ...payload, page: location.pathname.split("/").pop() || "index.html" }),
            signal: controller.signal,
        });
        const data = await res.json();
        return data.ok ? { ok: true } : { ok: false, error: data.error || "Something went wrong. Please try again." };
    } catch {
        return { ok: false, error: "We couldn't send your details. Please check your internet and try again." };
    } finally {
        clearTimeout(timer);
    }
}
