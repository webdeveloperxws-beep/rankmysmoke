<?php
declare(strict_types=1);

/**
 * Rank My Smoke Store: same-origin custom proposal email endpoint.
 * Install to: domains/rankmysmokestore.com/public_html/api/submit-proposal.php
 * Requires PHP 8.1+ and PHPMailer (installed under ../private/vendor).
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');

function respond(int $status, string $message, bool $success = false): never
{
    http_response_code($status);
    echo json_encode(
        ['success' => $success, 'message' => $message],
        JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE
    );
    exit;
}

function cleanText(mixed $value, int $maxBytes): ?string
{
    if (!is_string($value)) {
        return null;
    }
    $text = trim(strip_tags($value));
    $text = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $text);
    if (!is_string($text) || $text === '' || strlen($text) > $maxBytes) {
        return null;
    }
    return $text;
}

function html(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, 'Method not allowed. Use POST.');
}

// Production origins only by default. On an explicitly opted-in loopback
// dev server, permit local React preview origins (Vite / localhost).
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$productionOrigins = [
    'https://rankmysmokestore.com',
    'https://www.rankmysmokestore.com',
];
$localDevEnabled = getenv('RMSS_LOCAL_DEV') === '1';
$loopbackRequest = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true);
$localOrigin = preg_match('~^http://(?:localhost|127\.0\.0\.1)(?::[0-9]{1,5})?$~D', $origin) === 1;
if ($origin !== '' && !in_array($origin, $productionOrigins, true)
    && !($localDevEnabled && $loopbackRequest && $localOrigin)) {
    respond(403, 'Submission origin not allowed.');
}

$contentType = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
if ($contentType !== 'application/json') {
    respond(415, 'Please submit JSON data.');
}

if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 16384) {
    respond(413, 'Submission is too large.');
}

$raw = file_get_contents('php://input', false, null, 0, 16385);
if ($raw === false || strlen($raw) > 16384) {
    respond(413, 'Submission is too large.');
}

try {
    $data = json_decode($raw, true, 10, JSON_THROW_ON_ERROR);
} catch (JsonException $e) {
    respond(400, 'Invalid submission format.');
}
if (!is_array($data) || array_is_list($data)) {
    respond(400, 'Invalid submission format.');
}

// Unrendered honeypot: always blank for normal frontend submissions.
if (!empty($data['website'])) {
    respond(400, 'Submission rejected.');
}

$fullName = cleanText($data['fullName'] ?? null, 120);
$phone = cleanText($data['phone'] ?? null, 40);
$email = cleanText($data['email'] ?? null, 254);
if ($fullName === null || $phone === null || $email === null ||
    filter_var($email, FILTER_VALIDATE_EMAIL) === false ||
    !preg_match('/^[0-9+().\s\-]{7,40}$/', $phone)) {
    respond(422, 'Enter a valid name, phone number and email address.');
}

$services = $data['services'] ?? null;
if (!is_array($services) || !array_is_list($services) || count($services) < 1 || count($services) > 10) {
    respond(422, 'Select between 1 and 10 services.');
}

$allowedTitles = [
    'Website', 'Product & Store Setup', 'Google Maps / GBP',
    'Website SEO Setup', 'Store Compliance Setup',
    'Social Media Starter', 'Review & Trust Profiles',
    'Analytics & Tracking', 'Exclusive Growth Roadmap', 'Launch Support',
];
$rows = [];
$seen = [];
foreach ($services as $service) {
    if (!is_array($service)) {
        respond(422, 'Invalid selected service.');
    }
    $id = cleanText($service['id'] ?? null, 80);
    $title = cleanText($service['title'] ?? null, 100);
    $type = cleanText($service['type'] ?? null, 20);
    $label = cleanText($service['label'] ?? 'Selection', 70);
    $value = $service['value'] ?? null;
    if (is_int($value) || is_float($value)) {
        $value = (string) $value;
    }
    $value = cleanText($value, 100);
    if ($id === null || $title === null || $type === null || $label === null || $value === null ||
        !in_array($title, $allowedTitles, true) ||
        !in_array($type, ['counter', 'select', 'simple'], true) ||
        isset($seen[$title])) {
        respond(422, 'Invalid selected service details.');
    }
    if ($type === 'counter' && (!ctype_digit($value) || (int) $value < 1 || (int) $value > 10000)) {
        respond(422, 'Quantity must be between 1 and 10000.');
    }
    $seen[$title] = true;
    $rows[] = ['title' => $title, 'label' => $label, 'value' => $value];
}

// Config and dependencies must be outside public_html.
$privateDir = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'private';
$configPath = $privateDir . DIRECTORY_SEPARATOR . 'rmss-email-config.php';
$autoloadPath = $privateDir . DIRECTORY_SEPARATOR . 'vendor/autoload.php';
if (!is_file($configPath) || !is_file($autoloadPath)) {
    error_log('RMSS proposal: missing private email config or PHPMailer dependency.');
    respond(503, 'Email service is not configured. Please contact support.');
}
$config = require $configPath;
if (!is_array($config)) {
    respond(503, 'Email service is not configured.');
}
$smtp = $config['smtp'] ?? [];
$notification = $config['notification'] ?? [];
if (!is_array($smtp) || !is_array($notification) ||
    empty($smtp['host']) || empty($smtp['username']) || empty($smtp['password']) ||
    ($smtp['password'] === 'REPLACE_WITH_MAILBOX_PASSWORD') ||
    empty($notification['to']) ||
    filter_var($notification['to'], FILTER_VALIDATE_EMAIL) === false ||
    filter_var($smtp['username'], FILTER_VALIDATE_EMAIL) === false ||
    !in_array((int) ($smtp['port'] ?? 0), [465, 587], true)) {
    error_log('RMSS proposal: SMTP config incomplete.');
    respond(503, 'Email service is not configured. Please contact support.');
}

// Persistent per-IP throttling on the server, with a file lock for concurrency.
$rateDir = $privateDir . DIRECTORY_SEPARATOR . 'rate-limits';
if (!is_dir($rateDir) && !@mkdir($rateDir, 0750, true) && !is_dir($rateDir)) {
    respond(503, 'Submission is temporarily unavailable.');
}
$ipHash = hash('sha256', (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
$rateFile = $rateDir . DIRECTORY_SEPARATOR . $ipHash . '.json';
$handle = @fopen($rateFile, 'c+');
if (!$handle || !flock($handle, LOCK_EX)) {
    if ($handle) fclose($handle);
    respond(503, 'Submission is temporarily unavailable.');
}
$existing = stream_get_contents($handle);
$attempts = json_decode($existing === false ? '[]' : $existing, true);
if (!is_array($attempts)) $attempts = [];
$now = time();
$attempts = array_values(array_filter($attempts, static fn ($t): bool => is_int($t) && $t >= $now - 3600));
if (count($attempts) >= 8) {
    flock($handle, LOCK_UN);
    fclose($handle);
    header('Retry-After: 3600');
    respond(429, 'Too many submissions. Please try again later.');
}
$attempts[] = $now;
rewind($handle);
ftruncate($handle, 0);
fwrite($handle, json_encode($attempts));
fflush($handle);
flock($handle, LOCK_UN);
fclose($handle);

require $autoloadPath;

$timeUtc = gmdate('Y-m-d H:i:s') . ' UTC';
$reference = strtoupper(bin2hex(random_bytes(4)));
$rowsHtml = '';
$rowsPlain = [];
foreach ($rows as $index => $row) {
    $rowsHtml .= '<tr><td style="padding:10px;border-bottom:1px solid #dcebf0">'
        . ($index + 1) . '. ' . html($row['title'])
        . '</td><td style="padding:10px;border-bottom:1px solid #dcebf0">'
        . html($row['label']) . ': <strong>' . html($row['value']) . '</strong></td></tr>';
    $rowsPlain[] = ($index + 1) . '. ' . $row['title'] . ' — ' . $row['label'] . ': ' . $row['value'];
}

$htmlBody = '<!doctype html><html><body style="margin:0;padding:24px;background:#eefaff;font-family:Arial,sans-serif;color:#0c1728">'
    . '<div style="max-width:680px;margin:auto;background:white;border:1px solid #d6edf6;border-radius:12px;overflow:hidden">'
    . '<div style="background:#16a2c8;color:#fff;padding:22px 25px"><h2 style="margin:0">New Custom Proposal Request</h2></div>'
    . '<div style="padding:24px"><p><b>Reference:</b> ' . $reference . '<br><b>Received:</b> ' . $timeUtc . '</p>'
    . '<h3>Customer details</h3><p><b>Name:</b> ' . html($fullName) . '<br><b>Phone:</b> ' . html($phone)
    . '<br><b>Email:</b> ' . html($email) . '</p>'
    . '<h3>Selected priorities (' . count($rows) . ')</h3>'
    . '<table style="border-collapse:collapse;width:100%;font-size:14px">' . $rowsHtml . '</table>'
    . '<p style="color:#47616c;font-size:12px;margin-top:24px">Source: rankmysmokestore.com / Customize My Plan</p>'
    . '</div></div></body></html>';
$plainBody = "NEW CUSTOM PROPOSAL REQUEST\nReference: {$reference}\nReceived: {$timeUtc}\n\n"
    . "Name: {$fullName}\nPhone: {$phone}\nEmail: {$email}\n\n"
    . 'Selected priorities (' . count($rows) . "):\n" . implode("\n", $rowsPlain)
    . "\n\nSource: rankmysmokestore.com / Customize My Plan";

try {
    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = (string) $smtp['host'];
    $mail->SMTPAuth = true;
    $mail->Username = (string) $smtp['username'];
    $mail->Password = (string) $smtp['password'];
    $mail->Port = (int) $smtp['port'];
    $mail->SMTPSecure = $mail->Port === 465
        ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS
        : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Timeout = 15;
    $mail->CharSet = 'UTF-8';
    $mail->setFrom((string) $smtp['username'], (string) ($notification['from_name'] ?? 'Rank My Smoke Store'));
    $mail->addAddress((string) $notification['to']);
    $mail->addReplyTo($email, $fullName);
    $mail->isHTML(true);
    $mail->Subject = '[RMSS] New Custom Proposal Request #' . $reference;
    $mail->Body = $htmlBody;
    $mail->AltBody = $plainBody;
    $mail->send();
    respond(201, 'Your proposal request was submitted successfully.', true);
} catch (Throwable $e) {
    $errorRef = strtoupper(bin2hex(random_bytes(4)));
    error_log('RMSS proposal email delivery failed; reference=' . $errorRef);
    respond(502, 'Unable to send your request right now. Please try again or contact us directly.');
}
