# Windows Local Development: RMSS Proposal Email Backend

This version is prepared for Windows development with a React/Vite frontend. It allows **localhost** form origins only while you explicitly start the PHP server with `RMSS_LOCAL_DEV=1` and the incoming connection is from loopback. Production origins and defaults remain unchanged.

## 1. Requirements

- Windows PC with PHP 8.1+ (run `php -v`).
- Composer installed and on PATH (run `composer --version`).
- Existing React project with npm and `package.json`.
- Working SMTP mailbox and credentials (test mail uses real SMTP; no fake success).

## 2. Copy folder

Extract ZIP. Copy the `rmss-proposal-local-ready` folder **into the React project folder** (beside `package.json`) and rename it to `backend`. In your React project, the resulting structure should include:

```
YOUR-REACT-PROJECT/
  package.json
  src/
  vite.config.js          (if Vite)
  backend/
    public_html/api/submit-proposal.php
    private/composer.json
    private/rmss-email-config.php.example
    frontend/replace-handleProposalSubmit.jsx
```

## 3. SMTP setup in PowerShell

Open PowerShell in the project root:

```
cd .\backend\private
Copy-Item .\rmss-email-config.php.example .\rmss-email-config.php
notepad .\rmss-email-config.php
composer install --no-dev --optimize-autoloader
```

Replace the SMTP placeholder password with a real mailbox password. Set the notification `to` address; use the actual email provider SMTP host and port. **Never commit this config to Git** or publish it inside your web root. Check that `backend/private/vendor/autoload.php` exists.

## 4. Run PHP locally (PowerShell terminal A)

From the project root:

```
cd .\backend
$env:RMSS_LOCAL_DEV = '1'
php -S 127.0.0.1:8000 -t .\public_html
```

Keep terminal A running. Visiting `http://127.0.0.1:8000/api/submit-proposal.php` should display a JSON 405 method error; this **confirms endpoint reachable**, not SMTP delivery.

## 5. React handler

Find `handleProposalSubmit` in your full React component (the uploaded JSX was only the markup) and replace that handler with `backend/frontend/replace-handleProposalSubmit.jsx`. Do not replace the entire JSX form or CSS.

The handler makes a same-origin `fetch('/api/submit-proposal.php', ...)` request and sends selected services, counts/options, name, phone, and email.

## 6. Vite development proxy (if Vite)

Add a `server.proxy` field to the **existing** Vite config; do not overwrite other settings or plugins:

```
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    },
  },
},
```

In a second PowerShell terminal, from project root:

```
npm install
npm run dev
```

Open the Vite local URL, typically `http://localhost:5173`. Submit form. Browser Network tab should show POST `.../api/submit-proposal.php`, status 201 and JSON `success:true` when SMTP accepts the email. No CORS setting needed. If your frontend framework is CRA/Next instead of Vite, its proxy/routing will be different.

## 7. Troubleshooting

- **403**: either `RMSS_LOCAL_DEV` not set in the same terminal used to launch PHP, or origin not localhost/127.0.0.1.
- **404**: wrong PHP path or Vite proxy not configured/restarted.
- **503**: config invalid or `vendor/autoload.php` missing, or local rate-limits directory could not be created.
- **502**: SMTP send failed; check provider credentials, host/port and outbound network.
- **429**: 8 requests per IP/hour maximum; see `backend/private/rate-limits`. Clear local test rate-limit records only as needed, never expose them publicly.
- **Syntax/validation 422**: required fields or service details invalid.
- **201**: SMTP provider accepted mail, but final inbox delivery should be checked.

## 8. Production deployment

**Do not enable `RMSS_LOCAL_DEV` on public hosting.** Copy only PHP endpoint into the live `public_html/api` and private folder alongside live `public_html` as explained in `README-HOSTINGER.md`. Do not upload local test files, Vite proxy config as a server setting, or credentials to a public directory.
