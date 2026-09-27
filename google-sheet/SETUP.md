# Connect the website forms to a Google Sheet

Free, no server, no card. Takes about 5 minutes.

1. Go to https://sheets.google.com and create a blank sheet. Name it "SDA Leads".
2. In the sheet: **Extensions > Apps Script**.
3. Delete the sample code, paste in everything from `Code.gs` (this folder), and click **Save**.
4. Optional: at the top of the script set `NOTIFY_EMAIL = "you@example.com"` to get an email for every new lead.
5. Click **Deploy > New deployment**.
   - Click the gear next to "Select type" and choose **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy** and allow the permissions. If Google says "Google hasn't verified this app", click **Advanced > Go to (project name) (unsafe)**. This is your own script, so it is safe.
6. Copy the **Web app URL** (it ends in `/exec`).
7. Open `assets/js/leads.js` and paste it in place of `PASTE_YOUR_WEB_APP_URL_HERE`.
8. Submit a test registration on the site. A "Leads" tab appears in your sheet with the row.

## Notes

- The Sheet's **Status** column has a dropdown (New, Called, Interested, ...) and **Notes** is free text, for the sales team.
- If you change `Code.gs` later, redeploy: **Deploy > Manage deployments > pencil icon > Version: New version > Deploy**. The URL stays the same.
- The web address is visible in the page source. That is fine: it can only add rows, it never reveals any data. Junk is blocked by a hidden trap field, server-side validation and a 10-minute duplicate check.
- To let more people see the leads, use the Sheet's **Share** button.
