# Security Policy

Picho-RPG takes security seriously. If you believe you have found a vulnerability in the **front-end web client**, please follow the steps below.

## Supported versions

Only the `main` branch receives active security maintenance. Older tagged releases are not patched — if you're running an older deploy, please update before reporting.

| Version          | Supported          |
| ---------------- | ------------------ |
| `main` (latest)  | ✅                 |
| Older tags       | ❌                 |

## Reporting a vulnerability

**Please do not open a public GitHub issue.** Instead, send the details privately to:

📧 **security@picho.org**

If you'd like to use PGP, request the public key by replying to the same address.

In your report, please include as much of the following as you can:

- A clear description of the issue and its potential impact.
- Steps to reproduce (URLs, payloads, browser, OS).
- A proof of concept (screenshot, video, minimal repro repo) if available.
- The commit hash or deployed URL where you observed the issue.
- Your name or handle, in case you want to be credited.

You should receive an acknowledgement within **72 hours**. We aim to provide an initial assessment within **7 days**, and either a fix or a public advisory within **30 days**, depending on severity. If we need more time, we'll keep you informed.

## What's in scope

The front-end specifically. That includes:

- Cross-site scripting (stored, reflected, DOM-based).
- Content-injection through user-rendered content (markdown, EPUB, DOCX, PPTX, etc.).
- Authentication bypass on the GM-mode gate or other client-side guards.
- Sensitive data leaking into client storage, console, or network requests it shouldn't.
- Dependency vulnerabilities in production bundles (with a credible exploit path).

For backend issues, see the backend's [SECURITY.md](https://github.com/picho-org/picho-rpg-backend/blob/main/SECURITY.md).

## What's *not* a security issue

To save us both time, the following are explicitly **not** in scope here:

- Self-XSS that requires the victim to paste payloads into DevTools.
- Automated scanner output without a working proof of concept.
- Reports that depend on a compromised user device, browser extension or out-of-date browser.
- Lack of brute-force protection on a UI form when the underlying API already throttles.
- Missing CSP directives where there is no demonstrated exploit path.
- Theoretical timing attacks on the GM mode unlock.

## Disclosure policy

We follow a **coordinated disclosure** model:

1. You report privately.
2. We acknowledge, investigate, and develop a fix.
3. Once a fix is deployed, we publish an advisory crediting the reporter (unless they prefer to remain anonymous).

We don't currently run a bug-bounty program. We do, however, deeply appreciate responsibly disclosed reports and will publicly thank you in the advisory and in release notes.

Thank you for helping keep Picho-RPG and its users safe. 🛡️
