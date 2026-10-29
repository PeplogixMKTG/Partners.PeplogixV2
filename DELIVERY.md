# Peplogix Partner Portal

The public landing page and full guided inquiry are implemented using React, TypeScript, Express, and managed MySQL. Submissions and confidential logo/branding asset bytes are stored durably in private database tables. Authenticated authorized admins can list inquiries, inspect all submitted details, and download assets from the team dashboard at `/dashboard`. No email or CRM integration is configured.

A private one-time activation code enables the owner to authorize their real Manus-authenticated account for the dashboard. No visitor is granted access automatically. The activation code is not part of the repository or public website.

## Verification evidence
- TypeScript check passed.
- 17 unit/integration tests passed after targeted review fixes.
- Desktop 1440px and mobile 390px had no horizontal overflow and no JavaScript errors.
- Desktop full form tested all conditional service sections, existing website, Other text fields, catalog search, backward navigation, logo upload, live color changes, color skip, PDF asset upload, review, required accuracy confirmation, actual submission and success screen.
- Mobile full form tested wholesale-only branding skip, backward preservation, touch viewport and actual submission.
- Database rows were inspected to verify full persistence, then only the exact two labelled browser test submissions and their two test assets were removed.
- Repeated request ID returned exactly the original opaque submission result, without another inquiry.
- Unauthenticated dashboard APIs and asset downloads return 401; API responses are private/no-store.

## Domain and integrations
The requested production address is `partners.peplogixpeptide.com`. Custom-domain DNS has not been connected and no changes have been made to the main Peplogix website. Publish the recorded version to the managed host and then connect the custom subdomain from hosting/domain settings with domain-owner access. Do not imply the requested custom address is live until DNS/TLS configuration is confirmed.

Focused mobile regressions passed after review: unsupported SVG rejection without server upload, real mobile logo upload/removal, cleanup, reset, live color updates, and a non-branded submission with no hidden attached file IDs. Removed temporary uploads were confirmed absent in MySQL. Unclaimed abandoned uploads expire after 24 hours and are lazily purged on the next upload; submitted files are never included in that cleanup.
