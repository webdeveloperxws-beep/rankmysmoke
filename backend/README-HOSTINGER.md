# Rank My Smoke Store — Custom Proposal Email Backend

This package connects the existing **Customize My Plan** React form to your mailbox. It does not replace the existing design or require a third-party form collector.

For uploading the complete site, follow [HOSTINGER-UPLOAD-README.txt](../HOSTINGER-UPLOAD-README.txt). The redeploy archive includes the built React site, PHP endpoint, PHPMailer dependencies, and the supplied SMTP configuration. Keep the ZIP private and extract it into the domain folder so `private/` remains outside `public_html/`.

## 1) File placement (PHP-enabled Hostinger Web Hosting)

Upload and extract the archive into the directory containing your domain's `public_html` directory (not inside `public_html`). The intended structure is:

```text
domains/rankmysmokestore.com/
├── public_html/
│   ├── ... built React site files ...
│   └── api/
│       └── submit-proposal.php            <- copy from public_html/api/
└── private/                                <- OUTSIDE public_html
    ├── rmss-email-config.php              <- supplied SMTP configuration
    ├── composer.json
    └── vendor/                            <- included in the archive
```

If you upload the archive into a different directory layout, adjust the `$privateDir` line of `submit-proposal.php` accordingly. Do **not** put the email password in frontend JS/CSS, Git, or a publicly accessible web directory.

## 2) SMTP config

The redeploy archive includes the supplied `private/rmss-email-config.php`. Keep it outside `public_html` and do not share the archive publicly. Edit the config on the server only if SMTP settings need to change:

- SMTP username: the mailbox used to send notification mail (by default `contact@rankmysmokestore.com`).
- SMTP password: **that mailbox's email password**, not your Hostinger account password.
- `notification.to`: which mailbox should receive new submissions (by default `contact@rankmysmokestore.com`). It can be another address.
- SMTP host/port: for **Hostinger Email**, `smtp.hostinger.com` and port `465` (SSL) or `587` (STARTTLS). If you use Titan/Google Workspace/another email provider, replace host/port with those shown in your email provider's settings.

## 3) Frontend and dependencies

The archive already includes the built frontend and PHPMailer. No source edit or dependency installation is needed for redeployment. The Hostinger site must have PHP 8.1 or later enabled.

## 4) Test end-to-end

1. Open `https://rankmysmokestore.com/api/submit-proposal.php` in a browser. A deployed PHP endpoint should show JSON with `Method not allowed. Use POST.` (HTTP 405). If you see HTML, a 404, source code, or a hosting error, your server routing is not serving this PHP endpoint correctly.
2. Open the live `Customize My Plan` tab and select 2–3 services with differing quantities/options.
3. Enter valid contact details and click **Submit Details**.
4. Browser DevTools > Network: check `POST /api/submit-proposal.php` returns **201** with `success:true`.
5. Check the configured destination mailbox's **Inbox** and **Spam/Junk**. Confirm it contains the exact selected services and quantities. The email sender should be your SMTP mailbox; **Reply-To** should be the customer's email.
6. Negative tests: no selected services, malformed phone/email, repeated rapid submissions. These should show meaningful errors.

If PHP returns 503: config is missing/incomplete or PHPMailer not installed. If it returns 502: SMTP could not send (verify account credentials, host/port, ability to log into Webmail, and SPF/DKIM of your email domain). If 404 or HTML: likely wrong document root, SPA rewrite interception, or PHP not enabled for this site. If 403: incorrect Origin/domain.

## Security and limitations

- Rejects other origins (browser same-origin only), oversized/non-JSON bodies, invalid contact fields and unrecognized service titles.
- HTML is escaped and the email subject is constant; SMTP credentials never go to browser.
- Rate limit: maximum 8 submission attempts per IP per hour, stored under the private directory.
- A response of 201 means your SMTP provider accepted the message, not guaranteed final delivery to the inbox. Check spam and sender DNS authentication.
- Server must execute PHP. If this website runs entirely on a Node-only server, a Node/Express endpoint is required instead. A public site visit cannot confirm that runtime.
- PHP syntax and the production frontend build should be checked when regenerating the archive; live SMTP delivery still needs an end-to-end test from the deployed site.
