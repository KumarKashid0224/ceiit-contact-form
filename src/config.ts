/** Settings come from the .env files, so dev and production can point at different backends. */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL_LEAD = import.meta.env.VITE_API_BASE_URL_LEAD;
export const TENANT_ID = Number(import.meta.env.VITE_TENANT_ID) || 1;
export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

export const BRAND_NAME = "CEIIT";
export const BRAND_LOGO_URL = "https://images.siliconmount.com/upload_files/smts/CEIIT_LOGO.png";
