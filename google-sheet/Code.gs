/**
 * Stock Deal Academy - lead capture.
 * Paste this into Extensions > Apps Script inside your Google Sheet (see SETUP.md).
 * Every website form posts here and each valid submission becomes one row.
 */

var NOTIFY_EMAIL = "stockdeal20@gmail.com"; // optional: e.g. "sales@stockdealacademy.com" to get an email per lead. Leave "" for none.
var SHEET_NAME = "Leads";
var HEADERS = [
  "Timestamp", "Source", "Name", "Phone", "WhatsApp", "Email", "City",
  "Interested In", "Best Time", "Message", "Consent", "Page", "Status", "Notes"
];
var SOURCES = ["SCHOLARSHIP", "JOIN_FREE", "CONTACT", "REGISTER"];
var DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
var STATUS_OPTIONS = ["New", "Called", "Interested", "Follow up", "Enrolled", "Not interested", "Wrong number"];

function doGet() {
  return json_({ ok: true, service: "SDA lead capture" });
}

function doPost(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    // Hidden trap field: real visitors never fill it, bots do. Pretend success and save nothing.
    if (data.website) return json_({ ok: true });

    var lead = validate_(data);
    if (lead.error) return json_({ ok: false, error: lead.error });

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var sheet = getSheet_();
      if (isDuplicate_(sheet, lead)) return json_({ ok: true });
      sheet.appendRow([
        Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss"),
        lead.source, safe_(lead.name), lead.phone, lead.whatsapp, safe_(lead.email), safe_(lead.city),
        safe_(lead.interest), safe_(lead.bestTime), safe_(lead.message), lead.consent, safe_(lead.page),
        "New", ""
      ]);
    } finally {
      lock.releaseLock();
    }

    notify_(lead);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: "Something went wrong. Please try again." });
  }
}

function validate_(d) {
  var source = clean_(d.source, 20);
  if (SOURCES.indexOf(source) < 0) return { error: "Invalid request." };

  var lead = {
    source: source,
    name: clean_(d.name, 100),
    phone: phone_(d.phone),
    whatsapp: phone_(d.whatsapp),
    email: clean_(d.email, 150),
    city: clean_(d.city, 80),
    interest: clean_(d.interest, 80),
    bestTime: clean_(d.bestTime, 40),
    message: cleanMultiline_(d.message, 1500),
    page: clean_(d.page, 100),
    consent: source === "JOIN_FREE" ? "Notice shown" : (d.consent === true || d.consent === "yes" ? "Yes" : "")
  };

  if (!lead.phone && !lead.email) return { error: "Please enter a phone number or an email." };
  if (lead.phone && !/^[6-9][0-9]{9}$/.test(lead.phone)) return { error: "Please enter a valid 10-digit mobile number." };
  if (lead.whatsapp && !/^[6-9][0-9]{9}$/.test(lead.whatsapp)) return { error: "Please enter a valid 10-digit WhatsApp number." };
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) return { error: "Please enter a valid email." };
  if (source !== "JOIN_FREE" && !lead.name) return { error: "Please enter your name." };
  if (source !== "JOIN_FREE" && !lead.consent) return { error: "Please tick the box to agree to be contacted." };
  if (source === "JOIN_FREE" && !lead.phone) return { error: "Please enter a valid 10-digit mobile number." };
  if ((source === "SCHOLARSHIP" || source === "REGISTER") && (!lead.phone || !lead.email)) {
    return { error: "Please enter both your mobile number and email." };
  }
  if (source === "CONTACT" && !lead.email) return { error: "Please enter your email." };
  return lead;
}

// Strips control characters (newlines included) so a field can't break out of its
// single-line context, e.g. injecting extra lines into the notification email's subject.
function clean_(v, max) {
  if (typeof v !== "string") return "";
  return v.replace(/[\r\n\t\x00-\x1F\x7F]+/g, " ").trim().slice(0, max);
}

// Same idea, but keeps single newlines for free-text fields like the contact message.
function cleanMultiline_(v, max) {
  if (typeof v !== "string") return "";
  return v.replace(/\r\n?/g, "\n").replace(/[\t\x00-\x09\x0B-\x1F\x7F]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, max);
}

// Accepts "98765 43210", "+91 98765-43210", "919876543210" and returns 10 digits.
function phone_(v) {
  var s = clean_(v, 20).replace(/[\s\-()]/g, "");
  if (/^\+91[0-9]{10}$/.test(s)) s = s.slice(3);
  else if (/^91[0-9]{10}$/.test(s)) s = s.slice(2);
  return s;
}

// Stops values like "=HYPERLINK(...)" from running as spreadsheet formulas.
function safe_(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.getRange("D:E").setNumberFormat("@");
    var rule = SpreadsheetApp.newDataValidation().requireValueInList(STATUS_OPTIONS, true).build();
    sheet.getRange("M2:M").setDataValidation(rule);
  }
  return sheet;
}

function isDuplicate_(sheet, lead) {
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var start = Math.max(2, last - 49);
  var rows = sheet.getRange(start, 1, last - start + 1, HEADERS.length).getValues();
  var now = new Date().getTime();
  for (var i = 0; i < rows.length; i++) {
    var t = new Date(String(rows[i][0]).replace(" ", "T") + "+05:30").getTime();
    if (isNaN(t) || now - t > DUPLICATE_WINDOW_MS) continue;
    var samePerson = (lead.phone && String(rows[i][3]) === lead.phone) || (lead.email && rows[i][5] === lead.email);
    if (rows[i][1] === lead.source && samePerson) return true;
  }
  return false;
}

function notify_(lead) {
  if (!NOTIFY_EMAIL) return;
  try {
    MailApp.sendEmail(
      NOTIFY_EMAIL,
      "New lead: " + (lead.name || lead.phone) + " (" + lead.source + ")",
      "Name: " + lead.name + "\nPhone: " + lead.phone + "\nWhatsApp: " + lead.whatsapp + "\nEmail: " + lead.email +
      "\nCity: " + lead.city + "\nInterested in: " + lead.interest + "\nBest time: " + lead.bestTime +
      "\nMessage: " + lead.message + "\nPage: " + lead.page
    );
  } catch (err) {
    // An email problem must never lose the lead; it is already saved in the sheet.
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
