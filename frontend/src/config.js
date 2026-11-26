// Central place for branding, API endpoints and shared limits.
// API endpoints come ONLY from the environment (frontend/.env). VITE_* values
// are public by design — never put API keys or secrets here.
const required = (name, value) => {
  const clean = (value || "").trim().replace(/\/$/, "");
  if (!clean) throw new Error(`${name} must be set in frontend/.env`);
  return clean;
};

export const API_ROOT = required("VITE_API_URL", import.meta.env.VITE_API_URL);
export const TAJWEED_API_URL = required(
  "VITE_TAJWEED_API_URL",
  import.meta.env.VITE_TAJWEED_API_URL,
);

// Keep this in sync with TAJWEED_MAX_SECONDS on the backend.
export const MAX_RECORD_SECONDS = 30;
export const WIND_DOWN_MINUTES = 15;

// Change the product name here to rebrand the whole UI consistently.
export const BRAND = {
  name: "Halal GTA",
  short: "Halal",
  tag: "#HalalGTA",
  logo: "/Neon Halal Vice City Skyline.png",
};
