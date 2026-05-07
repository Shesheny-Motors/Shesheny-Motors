// js/i18n.js
// Handles language, LTR/RTL, and Currency

class I18nManager {
    constructor() {
        this.lang = localStorage.getItem('site_lang') || 'en';
        this.currency = localStorage.getItem('site_currency') || 'EGP';
        this.exchangeRate = 50; // Default EGP to USD rate
        this.translations = {};
        
        this.init();
    }

    async init() {
        // Load translations
        try {
            const res = await fetch('translations.json');
            this.translations = await res.json();
        } catch (e) {
            console.error("Failed to load translations.json", e);
        }

        // Fetch Exchange Rate from settings
        if(window.DbCache && window.supabaseClient) {
            try {
                const {data} = await window.DbCache.fetch('settings', () => window.supabaseClient.from('settings').select('*'));
                if(data && data.length > 0) {
                    const settings = data.reduce((acc, row) => ({...acc, [row.key]: row.value}), {});
                    if (settings.exchange_rate) {
                        this.exchangeRate = parseFloat(settings.exchange_rate) || 50;
                    }
                }
            } catch(e) {
                console.error("Failed to load exchange rate", e);
            }
        }

        // Apply settings
        this.applyLanguage();
        this.applyCurrency();

        // Setup listeners
        this.setupListeners();
    }

    applyLanguage() {
        document.documentElement.lang = this.lang;
        document.body.dir = this.lang === 'ar' ? 'rtl' : 'ltr';

        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (this.translations[this.lang] && this.translations[this.lang][key]) {
                if(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = this.translations[this.lang][key];
                } else {
                    el.innerHTML = this.translations[this.lang][key];
                }
            }
        });

        // Update toggle labels
        ['lang-toggle-label', 'mobile-lang-label'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.textContent = this.lang === 'en' ? 'عربي' : 'English';
        });
    }

    applyCurrency() {
        // Update toggle labels
        ['currency-toggle-label', 'mobile-currency-label'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.textContent = this.currency;
        });
        
        // Dispatch event for price re-rendering
        document.dispatchEvent(new CustomEvent('currencyChanged', { 
            detail: { currency: this.currency, rate: this.exchangeRate } 
        }));
    }


    setupListeners() {
        const handleLang = () => {
            this.lang = this.lang === 'en' ? 'ar' : 'en';
            localStorage.setItem('site_lang', this.lang);
            this.applyLanguage();
            document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: this.lang } }));
        };

        const handleCurrency = () => {
            this.currency = this.currency === 'EGP' ? 'USD' : 'EGP';
            localStorage.setItem('site_currency', this.currency);
            this.applyCurrency();
        };

        // Delegate to document to handle dynamic/header elements
        document.addEventListener('click', (e) => {
            const langBtn = e.target.closest('#lang-toggle, #mobile-lang-toggle');
            const currBtn = e.target.closest('#currency-toggle, #mobile-currency-toggle');
            
            if (langBtn) {
                e.preventDefault();
                handleLang();
            }
            if (currBtn) {
                e.preventDefault();
                handleCurrency();
            }
        });
    }

    formatPrice(priceEgp, priceUsd) {
        if (!priceEgp && !priceUsd) return '';
        if(this.currency === 'USD') {
            const usd = priceUsd || Math.round(priceEgp / this.exchangeRate);
            return '$' + Number(Math.round(usd)).toLocaleString('en-US', {maximumFractionDigits: 0});
        } else {
            return Number(Math.round(priceEgp)).toLocaleString('en-US', {maximumFractionDigits: 0}) + ' EGP';
        }
    }

    translate(key) {
        if (this.translations[this.lang] && this.translations[this.lang][key]) {
            return this.translations[this.lang][key];
        }
        return key;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.I18n = new I18nManager();
});
