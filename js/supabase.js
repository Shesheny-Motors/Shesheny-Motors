// js/supabase.js

const SUPABASE_URL = 'https://yftmwkzkdwctddfnphxq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VzbFnwl8UnlTylnCxVxhcw_QWwje5Rx';

if (window.supabase) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
    console.error("Supabase SDK not loaded!");
}
