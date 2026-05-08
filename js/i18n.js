// js/i18n.js
// Handles language, and LTR/RTL

class I18nManager {
    constructor() {
        this.lang = localStorage.getItem('site_lang') || 'en';
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

        // Apply settings
        this.applyLanguage();

        // Setup listeners
        this.setupListeners();
    }

    applyLanguage() {
        document.documentElement.lang = this.lang;
        document.body.dir = this.lang === 'ar' ? 'rtl' : 'ltr';

        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const val = this.translations[this.lang]?.[key];
            if (!val) return;

            const tag = el.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') {
                el.placeholder = val;
            } else if (tag === 'OPTION') {
                el.textContent = val;
            } else {
                el.innerHTML = val;
            }
        });

        // Update toggle labels
        ['lang-toggle-label', 'mobile-lang-label'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.textContent = this.lang === 'en' ? 'عربي' : 'English';
        });
    }

    setupListeners() {
        const handleLang = () => {
            this.lang = this.lang === 'en' ? 'ar' : 'en';
            localStorage.setItem('site_lang', this.lang);
            this.applyLanguage();
            document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: this.lang } }));
        };

        // Delegate to document to handle dynamic/header elements
        document.addEventListener('click', (e) => {
            const langBtn = e.target.closest('#lang-toggle, #mobile-lang-toggle');
            
            if (langBtn) {
                e.preventDefault();
                handleLang();
            }
        });
    }

    formatPrice(priceEgp) {
        if (!priceEgp) return '';
        return Number(Math.round(priceEgp)).toLocaleString('en-US', {maximumFractionDigits: 0}) + ' EGP';
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
