# CEIIT Contact Form

A one-page contact form for the CEIIT website. The "Contact Us" button on the website opens this app. When a visitor submits it, the SiliconMount CRM creates the contact, lead, enquiry and a follow-up task automatically.

It uses the same look as the CRM (colours, Inter font, components) and works on phones, tablets and desktops.

## How it works

1. On load, the course dropdown is filled from `GET {VITE_API_BASE_URL}/api/courses/filter?tenant_id=1` (finance service, no login needed). If the list cannot be loaded, a free-text course field is shown instead.
2. The visitor fills in the form and ticks the reCAPTCHA. The Submit button stays disabled until the captcha is ticked.
3. On submit, the form is posted to `POST {VITE_API_BASE_URL_LEAD}/v1/contact-form` (lead generation service, no login needed) with tenant 1 (CEIIT).
4. The CRM creates the contact, lead, enquiry (when the course matches) and a next-day follow-up task, and assigns them by the tenant's assignment rules.
5. The visitor sees a thank-you screen.

| Field | Required | Notes |
|---|---|---|
| Full Name | Yes | |
| Mobile Number | Yes | 10-digit Indian number |
| Email | No | Format is checked |
| Course Interested | No | Dropdown of active CEIIT courses |
| Message | No | |

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev        # http://localhost:3005
```

Other scripts:

```bash
npm run build      # type-check and build into dist/
npm run preview    # serve the built dist/ locally
npm run lint
```

## Configuration

Settings are read at build time from the `.env` file, which points at the dev backend.

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Finance service (course list) |
| `VITE_API_BASE_URL_LEAD` | Lead generation service (form submission) |
| `VITE_TENANT_ID` | CRM tenant the enquiries go to (CEIIT = `1`) |
| `VITE_RECAPTCHA_SITE_KEY` | Google reCAPTCHA Enterprise site key (public by design) |

For another environment, put the values in `.env.production` (or `.env.production.local`, which is not committed) before running `npm run build`.

## Deploy

`npm run build` produces a static site in `dist/`. Upload it to any static host (Nginx, Apache, S3, Netlify, etc.). It is a single page, so no routing setup is needed.

After deploying:

1. Add the site's domain to the reCAPTCHA key's allowed domains in the Google Cloud console, otherwise the captcha shows an "invalid domain" error.
2. Point the "Contact Us" button on the CEIIT website at the deployed URL.

## Notes

- The reCAPTCHA is checked in the browser only; the backend does not verify the token yet.
- The UI components in `src/components/ui` are copied from the CRM so both look the same.
