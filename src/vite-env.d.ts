/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Finance service: serves the public course list */
  readonly VITE_API_BASE_URL: string;
  /** Lead generation service: receives the contact form */
  readonly VITE_API_BASE_URL_LEAD: string;
  /** CRM tenant the enquiries are created under (CEIIT = 1) */
  readonly VITE_TENANT_ID: string;
  /** Google reCAPTCHA Enterprise site key */
  readonly VITE_RECAPTCHA_SITE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
