// js/supabase.js

const SUPABASE_URL = 'https://yftmwkzkdwctddfnphxq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmdG13a3prZHdjdGRkZm5waHhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxOTkzNzksImV4cCI6MjA5Mjc3NTM3OX0.cVe4uXTdzJdTR_7EDxv_7weklZHqIzm5HkU0MUk0-Jw';

if (window.supabase) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
    console.error("Supabase SDK not loaded!");
}
