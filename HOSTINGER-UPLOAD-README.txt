Rank My Smoke Store - Hostinger Redeploy

This is a ready-to-extract redeploy archive for the Hostinger domain folder.
It contains the current built website, proposal API, PHPMailer, and the supplied
SMTP configuration.

Deploy
------
1. In Hostinger File Manager, open the domain folder containing public_html
   (usually domains/rankmysmokestore.com/).
2. Upload this ZIP into that folder and extract it there. If asked, overwrite
   the existing website files.
3. Confirm public_html/ and private/ are side by side. Do NOT extract inside
   public_html; the SMTP configuration must remain outside the web root.
4. Once deployment is verified, remove the uploaded ZIP from the server.

The archive includes PHPMailer under private/vendor. The site's server must
support PHP 8.1 or later. No npm, Composer, or SMTP reconfiguration is needed.
Keep private/rmss-email-config.php outside public_html. Do not share the ZIP
publicly because it contains the SMTP configuration.

Verify
------
Visit https://rankmysmokestore.com/api/submit-proposal.php. A JSON response
with HTTP 405 ("Method not allowed. Use POST.") means PHP is handling the route.
Then submit a test proposal from Customize My Plan and check the destination
mailbox's inbox and spam folder.

The archive does not include runtime rate-limit data; the endpoint creates it
under private/ as needed. Check the destination mailbox's inbox and spam folder
after submitting a test proposal.
