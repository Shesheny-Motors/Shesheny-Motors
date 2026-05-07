// Supabase Configuration
// This file exports the Supabase client instance for use across the application.

// Ensure the Supabase library is loaded before this script runs.
// Add <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> to your HTML head.

const SUPABASE_URL = "https://yftmwkzkdwctddfnphxq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmdG13a3prZHdjdGRkZm5waHhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxOTkzNzksImV4cCI6MjA5Mjc3NTM3OX0.cVe4uXTdzJdTR_7EDxv_7weklZHqIzm5HkU0MUk0-Jw";

// Expose key globally for admin usage
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

// Initialize the client if the library is available
if (typeof window.supabase !== "undefined") {
  if (window.supabase.createClient) {
    // First time initialization: Library is present
    const client = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          storageKey: "legend-admin-auth",
          storage: window.localStorage,
        },
      },
    );
    // Overwrite the library object with the client instance
    // This allows 'supabase' global to be used for queries (supabase.from...)
    window.supabase = client;
  } else {
    // Already initialized (window.supabase is now the client)
    console.log("Supabase client already initialized.");
  }
} else {
  console.warn(
    "Supabase JS library not loaded. Ensure the CDN script is included in your HTML.",
  );
}

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

window.dbCache = {
    get: (key) => {
        const cached = localStorage.getItem(key);
        if (!cached) return null;
        try {
            const { timestamp, data } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TTL) return data;
        } catch (e) {}
        return null;
    },
    set: (key, data) => {
        localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
    },
    clear: (...keys) => {
        keys.forEach(k => {
            localStorage.removeItem(k);
            // Invalidate front-end DbCache keys as well
            if (k === 'products_all') localStorage.removeItem('db_cache_products');
            if (k === 'brands_all') localStorage.removeItem('db_cache_brands');
            if (k === 'categories_all') localStorage.removeItem('db_cache_categories');
            if (k === 'settings_all') localStorage.removeItem('db_cache_settings');
        });
    }
};
