# Forms → postbox

Every form on the site (Contact, the Services "Get Started" form, and the
footer newsletter signup) submits to **postbox**, the self-hosted BitMonkey
Tech mail service at `https://postbox.bitmonkeytech.com`. postbox emails each
submission to `info@bitmonkeytech.com` via Resend and returns proper JSON, so
the page can show real success/failure.

This replaced an earlier Google Apps Script + Gmail setup.

## How it works

1. Each `<form class="js-form">` has:
   - a hidden `<input name="form_name" …>` naming the form
   - a hidden honeypot `<input name="_gotcha" …>` (off-screen; bots fill it,
     people don't — postbox silently drops those)
   - a `<p class="form-status" aria-live="polite">` for the result message
2. `js/main.js` intercepts submit and `POST`s the `FormData` to
   `https://postbox.bitmonkeytech.com/f/bitmonkeytech` (`FORM_ID` in that file).
3. postbox checks the request `Origin` against its allowlist, drops honeypot
   hits, rate-limits, then emails the fields to `info@bitmonkeytech.com` with
   `Reply-To` set to the submitter. The notification is a branded HTML email.

## Configuration (in the `postbox` repo)

The `bitmonkeytech` entry in `BitMonkey-Tech/postbox`'s `clients.json`:

```json
{
  "bitmonkeytech": {
    "to": "info@bitmonkeytech.com",
    "allowedOrigins": [
      "https://bitmonkeytech.com",
      "https://www.bitmonkeytech.com",
      "https://bitmonkeytech.dev.bitmonkeytech.com"
    ],
    "subject": "New contact — bitmonkeytech.com",
    "brand": { "name": "BitMonkey Tech", "color": "#2563eb", "footer": "Sent via postbox.bitmonkeytech.com" }
  }
}
```

Manage it with the `forms` skill in the `bitmonkey-devops` plugin
(`/wire-forms`) or `register-form.mjs` in the `BitMonkey-Tech/ops` repo. To add
a new allowed origin (e.g. a new domain), update that entry and redeploy
postbox.

## Testing

```sh
# from an allowed origin -> 200 + an email at info@bitmonkeytech.com
curl -i -X POST https://postbox.bitmonkeytech.com/f/bitmonkeytech \
  -H 'Origin: https://bitmonkeytech.com' \
  -d 'form_name=Contact Form' -d 'email=you@example.com' -d 'message=test'

# wrong origin -> 403 ; unknown form id -> 404
```

Because postbox returns real JSON, the page's "Something went wrong" message
now means the send actually failed — check the postbox app logs in Dokploy
(structured JSON, one line per request) and the Resend dashboard.
