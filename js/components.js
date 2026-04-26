// js/components.js

class HeaderComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <nav class="fixed top-0 w-full z-50 bg-zinc-950/70 backdrop-blur-xl transition-all duration-300" id="main-nav">
                <div class="flex justify-between items-center px-4 md:px-12 py-4 md:py-6 w-full max-w-screen-2xl mx-auto">
                    <a href="index.html" class="text-xl font-headline font-bold tracking-tight text-amber-200">
                        Shesheny Motors
                    </a>
                    <div class="hidden md:flex items-center space-x-8" id="desktop-nav-links">
                        <a class="text-zinc-400 hover:text-zinc-100 transition-colors duration-200 font-body text-sm tracking-wide" href="index.html" data-i18n="nav_home">Home</a>
                        <a class="text-zinc-400 hover:text-zinc-100 transition-colors duration-200 font-body text-sm tracking-wide" href="inventory.html" data-i18n="nav_inventory">Inventory</a>
                        <a class="text-zinc-400 hover:text-zinc-100 transition-colors duration-200 font-body text-sm tracking-wide" href="favorites.html" data-i18n="nav_favorites">Favorites</a>
                        <a class="text-zinc-400 hover:text-zinc-100 transition-colors duration-200 font-body text-sm tracking-wide" href="about.html" data-i18n="nav_about">About</a>
                        <a class="text-zinc-400 hover:text-zinc-100 transition-colors duration-200 font-body text-sm tracking-wide" href="contact.html" data-i18n="nav_contact">Contact</a>
                    </div>
                    <div class="flex items-center space-x-3 md:space-x-4">
                        <button id="lang-toggle" class="text-zinc-400 hover:text-amber-200 font-body text-sm font-medium transition-colors">عربي</button>
                        <button id="currency-toggle" class="text-zinc-400 hover:text-amber-200 font-body text-sm font-medium transition-colors border border-zinc-700 px-2 py-1 rounded">EGP</button>
                        <button class="md:hidden text-zinc-400 hover:text-zinc-100" id="mobile-menu-btn">
                            <span class="material-symbols-outlined">menu</span>
                        </button>
                        <a class="hidden md:inline-block bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-2.5 rounded hover:scale-105 transition-transform duration-200 font-label font-medium text-sm" href="contact.html" data-i18n="nav_cta">Contact Us</a>
                    </div>
                </div>
            </nav>
            <!-- Mobile Drawer -->
            <div id="mobile-drawer" class="fixed inset-0 bg-zinc-950/95 z-[60] flex-col items-center justify-center space-y-8 hidden opacity-0 transition-opacity duration-300">
                <button id="close-mobile-btn" class="absolute top-6 right-6 text-zinc-400 hover:text-white">
                    <span class="material-symbols-outlined text-3xl">close</span>
                </button>
                <a href="index.html" class="text-2xl font-headline text-amber-200" data-i18n="nav_home">Home</a>
                <a href="inventory.html" class="text-2xl font-headline text-zinc-300" data-i18n="nav_inventory">Inventory</a>
                <a href="favorites.html" class="text-2xl font-headline text-zinc-300" data-i18n="nav_favorites">Favorites</a>
                <a href="about.html" class="text-2xl font-headline text-zinc-300" data-i18n="nav_about">About</a>
                <a href="contact.html" class="text-2xl font-headline text-zinc-300" data-i18n="nav_contact">Contact</a>
            </div>
        `;

        this._highlightActiveLink();
        this._setupMobileMenu();
    }

    _highlightActiveLink() {
        const path = window.location.pathname;
        const page = path.split("/").pop() || "index.html";
        
        // Desktop Links
        const links = this.querySelectorAll('#desktop-nav-links a');
        links.forEach(link => {
            if (link.getAttribute('href') === page) {
                link.className = "text-amber-200 font-medium border-b-2 border-amber-200 pb-1 font-body text-sm tracking-wide";
            }
        });
    }

    _setupMobileMenu() {
        const btn = this.querySelector('#mobile-menu-btn');
        const closeBtn = this.querySelector('#close-mobile-btn');
        const drawer = this.querySelector('#mobile-drawer');

        if(btn && drawer && closeBtn) {
            btn.addEventListener('click', () => {
                drawer.classList.remove('hidden');
                setTimeout(() => drawer.classList.remove('opacity-0'), 10);
                document.body.style.overflow = 'hidden';
            });

            closeBtn.addEventListener('click', () => {
                drawer.classList.add('opacity-0');
                setTimeout(() => {
                    drawer.classList.add('hidden');
                    document.body.style.overflow = '';
                }, 300);
            });
        }
    }
}

class FooterComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="w-full border-t border-zinc-800/20 bg-zinc-950 grid grid-cols-1 md:grid-cols-4 gap-12 px-12 py-20 relative z-10">
                <div>
                    <div class="text-lg font-headline italic text-amber-200/50 mb-6">Shesheny Motors</div>
                    <p class="font-body text-zinc-500 text-sm" data-i18n="footer_copyright">© 2024 Shesheny Motors. Private Gallery.</p>
                </div>
                <div>
                    <h4 class="font-headline text-amber-200 mb-6" data-i18n="footer_legal">Legal</h4>
                    <ul class="space-y-3 font-body text-sm">
                        <li><a class="text-zinc-500 hover:text-zinc-300 hover:translate-x-1 transition-transform duration-200 inline-block" href="#" data-i18n="footer_privacy">Privacy Policy</a></li>
                        <li><a class="text-zinc-500 hover:text-zinc-300 hover:translate-x-1 transition-transform duration-200 inline-block" href="#" data-i18n="footer_terms">Terms of Service</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-headline text-amber-200 mb-6" data-i18n="footer_contact">Contact</h4>
                    <ul class="space-y-3 font-body text-sm">
                        <li><a class="text-zinc-500 hover:text-zinc-300 hover:translate-x-1 transition-transform duration-200 inline-block" href="contact.html" data-i18n="footer_inquiries">Inquiries</a></li>
                        <li><a class="text-zinc-500 hover:text-zinc-300 hover:translate-x-1 transition-transform duration-200 inline-block" href="contact.html" data-i18n="footer_appointments">Appointments</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-headline text-amber-200 mb-6" data-i18n="footer_socials">Socials</h4>
                    <ul class="space-y-3 font-body text-sm" id="footer-socials">
                        <li><a class="text-zinc-500 hover:text-zinc-300 hover:translate-x-1 transition-transform duration-200 inline-block" href="#" id="footer-instagram" target="_blank">Instagram</a></li>
                        <li><a class="text-zinc-500 hover:text-zinc-300 hover:translate-x-1 transition-transform duration-200 inline-block" href="#" id="footer-facebook" target="_blank">Facebook</a></li>
                    </ul>
                </div>
            </footer>
        `;
        
        // Load dynamic socials from Supabase mock
        this._loadSocials();
    }

    async _loadSocials() {
        if(window.DbCache && window.supabaseClient) {
            const {data} = await window.DbCache.fetch('settings', () => window.supabaseClient.from('settings').select('*'));
            if(data && data.length > 0) {
                const settings = data[0];
                const ig = this.querySelector('#footer-instagram');
                const fb = this.querySelector('#footer-facebook');
                if(ig) ig.href = settings.instagram;
                if(fb) fb.href = settings.facebook;
            }
        }
    }
}

customElements.define('shesheny-header', HeaderComponent);
customElements.define('shesheny-footer', FooterComponent);

// Global Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('SW registered!', reg))
            .catch(err => console.log('SW registration failed', err));
    });
}
