// js/i18n.js
// Handles language, LTR/RTL, and Currency

class I18nManager {
    constructor() {
        this.lang = localStorage.getItem('site_lang') || 'en';
        this.currency = localStorage.getItem('site_currency') || 'EGP';
        this.exchangeRate = 1;
        this.translations = {};
        
        this.init();
    }

    async init() {
        // Load translations
        try {
            const res = await fetch('/translations.json');
            this.translations = await res.json();
        } catch (e) {
            console.error("Failed to load translations.json", e);
        }

        // Fetch Exchange Rate from settings
        if(window.DbCache && window.supabaseClient) {
            const {data} = await window.DbCache.fetch('settings', () => window.supabaseClient.from('settings').select('*'));
            if(data && data.length > 0) {
                this.exchangeRate = data[0].exchange_rate || 50;
            }
        }

        // Apply settings
        this.applyLanguage();
        this.applyCurrency();

        // Setup listeners (wait for components to be injected)
        setTimeout(() => this.setupListeners(), 100);
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

        // Update toggle button text
        const langToggle = document.getElementById('lang-toggle');
        if (langToggle) {
            langToggle.textContent = this.lang === 'en' ? 'عربي' : 'English';
        }
    }

    applyCurrency() {
        const toggle = document.getElementById('currency-toggle');
        if(toggle) {
            toggle.textContent = this.currency;
        }
        
        // Custom event for other scripts to re-render prices
        document.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency: this.currency, rate: this.exchangeRate } }));
    }

    setupListeners() {
        const langToggle = document.getElementById('lang-toggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => {
                this.lang = this.lang === 'en' ? 'ar' : 'en';
                localStorage.setItem('site_lang', this.lang);
                this.applyLanguage();
            });
        }

        const currencyToggle = document.getElementById('currency-toggle');
        if (currencyToggle) {
            currencyToggle.addEventListener('click', () => {
                this.currency = this.currency === 'EGP' ? 'USD' : 'EGP';
                localStorage.setItem('site_currency', this.currency);
                this.applyCurrency();
            });
        }
    }

    formatPrice(priceEgp, priceUsd) {
        if(this.currency === 'USD') {
            return '$' + priceUsd.toLocaleString();
        } else {
            return priceEgp.toLocaleString() + ' EGP';
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    // We wait slightly so components.js injects headers
    setTimeout(() => {
        window.I18n = new I18nManager();
    }, 50);
});
