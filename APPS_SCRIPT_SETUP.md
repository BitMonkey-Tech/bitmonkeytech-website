# Wiring the site's forms to email info@bitmonkeytech.com

The site's three forms (Contact, the Services "Get Started" form, and the
footer newsletter signup) are plain HTML — a static page has no server of
its own, so on its own it can't send email. This connects them to a tiny
script running on **your** Google account, which uses `GmailApp` (part of
Google Workspace) to actually send the email. No third-party form service,
no Netlify — just Google.

## 1. Create the Apps Script project

1. Go to **[script.google.com](https://script.google.com)** and sign in
   with your BitMonkey Tech Google account.
2. Click **New project**.
3. Delete the placeholder code in the editor and paste in the script
   below.
4. Click the project name at the top ("Untitled project") and rename it
   to something like **BitMonkey Tech — Website Forms**.

```javascript
// BitMonkey Tech website form handler.
// Receives a POST from the site's contact/inquiry/newsletter forms and
// emails the submission to NOTIFY_EMAIL via Gmail.

const NOTIFY_EMAIL = 'info@bitmonkeytech.com';

// Friendly labels for the raw field names the forms send.
const FIELD_LABELS = {
  'first-name': 'First Name',
  'last-name': 'Last Name',
  'email': 'Email',
  'message': 'Message',
  'help': 'What can we help with',
};

function doPost(e) {
  try {
    const data = e.parameter;
    const formName = data.form_name || 'Website Form';

    const lines = Object.keys(data)
      .filter(key => key !== 'form_name' && data[key])
      .map(key => `${FIELD_LABELS[key] || key}: ${data[key]}`);

    GmailApp.sendEmail(NOTIFY_EMAIL, `${formName} — BitMonkey Tech website`, lines.join('\n'), {
      replyTo: data.email || NOTIFY_EMAIL,
    });

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 2. Deploy it as a Web App

1. Click **Deploy** (top right) → **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description**: `v1`
   - **Execute as**: **Me** (your account — this is what lets it send
     mail through your Gmail)
   - **Who has access**: **Anyone** (the site itself has no login, so
     the script needs to accept requests from anyone; it will only ever
     *send an email to you*, it can't do anything else)
4. Click **Deploy**.
5. The first time, Google will ask you to **authorize** the script —
   click through the consent screens (it'll warn "Google hasn't
   verified this app" since it's your own personal script; click
   **Advanced → Go to BitMonkey Tech... (unsafe)** → **Allow**).
6. Copy the **Web app URL** it gives you — it looks like
   `https://script.google.com/macros/s/AKfycb.../exec`.

## 3. Connect it to the site

1. Open `js/main.js` in this project.
2. Find this line near the bottom:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
   ```
3. Replace **only the quoted value on that one line** with the URL you
   copied in step 2.6. Do not do a project-wide find/replace of
   `PASTE_YOUR...` — a few lines below there's a guard
   (`GOOGLE_SCRIPT_URL.includes("PASTE_YOUR")`) that shows the "not
   connected yet" message. If you overwrite the string in that guard too,
   the check becomes always-true and **every submission silently stops
   before it's sent**.
4. Save, then test each form on the live site — a submission should
   land in the info@bitmonkeytech.com inbox within a few seconds.

## Updating the script later

If you ever edit the script code, you need to **redeploy** for the
change to take effect: Deploy → Manage deployments → pencil/edit icon →
change Version to "New version" → Deploy. Editing the code alone does
NOT update the live Web App URL's behavior until you do this.

## Troubleshooting

- **No network request fires at all** (check the browser's Network tab on
  submit): the `GOOGLE_SCRIPT_URL.includes("PASTE_YOUR")` guard in
  `js/main.js` is matching. Make sure `PASTE_YOUR` still appears *only*
  inside that guard, and that `GOOGLE_SCRIPT_URL` itself is your real
  `…/exec` URL. See step 3 above.
- **Request fires but nothing arrives**: the browser can't read the
  response (`mode: 'no-cors'` — the page always shows "Thanks!" even on
  failure), so debug the script directly:
  - Open the `…/exec` URL in a browser. There's no `doGet`, so you should
    see a Google error like *"Script function not found: doGet"* — that
    means it's deployed and public. A **sign-in page** instead means
    step 2.3's **"Who has access"** is wrong — it must be **Anyone**, not
    "Anyone with Google account" (the site visitor isn't logged in).
  - If you edited the script after deploying, **redeploy a new version**
    (see "Updating the script later" above) — edits aren't live until then.
  - Confirm the URL ends in **`/exec`**, not `/dev`.
- **Emails end up in Spam**: mark one as "Not spam" once — Gmail learns
  from that.
