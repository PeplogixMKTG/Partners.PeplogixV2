# Full-entry Resend notifications — sources checked November 2, 2026

https://resend.com/docs/api-reference/emails/send-email documents POST /emails, required from/to/subject, HTML/plain-text bodies, Reply-To, max 50 recipients, and Idempotency-Key retained for 24 hours. Implementation uses https://api.resend.com/emails with Bearer authorization and a fixed per-inquiry key, never a client-visible key.

https://resend.com/docs/api-reference/errors documents permanent configuration errors for unverified sender domains (403), invalid keys, validation errors, and transient network/server/rate-limit cases. Provider response bodies may contain email addresses; store only a safe error code, not those bodies.

https://resend.com/docs/dashboard/domains/introduction requires ownership verification of a sending domain and recommends subdomains for reputation isolation.

https://vercel.com/marketplace/resend documents that the Vercel integration stores RESEND_API_KEY in the Vercel project.

The user's authenticated Resend account named peplogix was inspected through My Browser on November 2. Its Domains page https://resend.com/domains displayed 'No domains yet'. Sender domain, DNS provider, team recipients, current live site URL, API credential provisioning and actual receipt are not confirmed. No real email has been sent during preparation.
