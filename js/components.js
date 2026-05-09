// js/components.js

class HeaderComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <nav class="fixed top-0 w-full z-50 bg-zinc-950/70 backdrop-blur-xl transition-all duration-300" id="main-nav">
                <div class="flex justify-between items-center px-4 md:px-12 py-4 md:py-6 w-full max-w-screen-2xl mx-auto">
                    <a href="/" class="text-xl font-headline font-bold tracking-tight text-amber-200">
                        Shesheny Motors
                    </a>
                    <div class="hidden md:flex items-center space-x-8 rtl:space-x-reverse" id="desktop-nav-links">
                        <a class="text-zinc-400 hover:text-zinc-100 transition-colors duration-200 font-body text-sm tracking-wide" href="/" data-i18n="nav_home">Home</a>
                        <a class="text-zinc-400 hover:text-zinc-100 transition-colors duration-200 font-body text-sm tracking-wide" href="/inventory/" data-i18n="nav_inventory">Inventory</a>
                        <a class="text-zinc-400 hover:text-zinc-100 transition-colors duration-200 font-body text-sm tracking-wide" href="/about/" data-i18n="nav_about">About</a>
                        <a class="text-zinc-400 hover:text-zinc-100 transition-colors duration-200 font-body text-sm tracking-wide" href="/contact/" data-i18n="nav_contact">Contact</a>
                        <a class="text-amber-200/80 hover:text-amber-200 transition-colors duration-200 font-body text-sm tracking-wide font-medium" href="/request/" data-i18n="nav_custom_request">Custom Request</a>
                    </div>
                    <div class="flex items-center space-x-3 md:space-x-4 rtl:space-x-reverse">
                        <a class="text-zinc-400 hover:text-zinc-100 transition-all duration-200 font-body text-sm tracking-wide flex items-center gap-2 group" href="/cart/">
                            <div class="relative bg-zinc-800/60 p-2 rounded-full border border-zinc-700/50 group-hover:border-amber-200/30 group-hover:bg-zinc-800">
                                <span class="material-symbols-outlined text-lg">shopping_bag</span>
                                <span id="cart-count-badge" class="absolute -top-1 -right-1 bg-amber-200 text-zinc-950 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full hidden">0</span>
                            </div>
                        </a>
                        <button id="lang-toggle" class="flex items-center gap-1.5 text-zinc-400 hover:text-amber-200 font-body text-xs font-semibold uppercase tracking-wider transition-all duration-200 bg-zinc-800/60 hover:bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-700/50 hover:border-amber-200/30">
                            <span class="material-symbols-outlined text-sm" style="font-size:14px">language</span>
                            <span id="lang-toggle-label">عربي</span>
                        </button>
                        <button class="md:hidden text-zinc-400 hover:text-zinc-100" id="mobile-menu-btn">
                            <span class="material-symbols-outlined">menu</span>
                        </button>
                        <div id="desktop-auth-area" class="hidden md:block">
                            <a class="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-2.5 rounded hover:scale-105 transition-transform duration-200 font-label font-medium text-sm" href="/login/" data-i18n="sign_in">Sign In</a>
                        </div>
                    </div>
                </div>
            </nav>
                <!-- Mobile Drawer -->
                <div id="mobile-drawer" class="fixed inset-0 z-[110] invisible transition-all duration-500 pointer-events-none">
                    <!-- Backdrop -->
                    <div id="drawer-backdrop" class="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm opacity-0 transition-opacity duration-500"></div>
                    
                    <!-- Content -->
                    <div id="drawer-content" class="absolute top-0 right-0 w-[280px] h-full bg-zinc-900 shadow-2xl translate-x-full transition-transform duration-500 ease-out flex flex-col pointer-events-auto">
                        <div class="p-6 flex justify-between items-center border-b border-white/5">
                            <span class="text-xs font-bold tracking-[0.2em] text-white/40 uppercase">Shesheny</span>
                            <button id="close-menu" class="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10 transition-colors">
                                <span class="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>                 <div class="flex flex-col items-center space-y-6 flex-grow justify-center">
                        <a href="/" class="text-3xl font-headline font-bold text-amber-200 tracking-tight" data-i18n="nav_home">Home</a>
                        <a href="/inventory/" class="text-3xl font-headline font-bold text-zinc-100 tracking-tight" data-i18n="nav_inventory">Inventory</a>
                        <a href="/favorites/" class="text-3xl font-headline font-bold text-zinc-100 tracking-tight" data-i18n="nav_favorites">Favorites</a>
                        <a href="/cart/" class="text-3xl font-headline font-bold text-zinc-100 tracking-tight" data-i18n="nav_cart">Cart</a>
                        <a href="/about/" class="text-3xl font-headline font-bold text-zinc-100 tracking-tight" data-i18n="nav_about">About</a>
                        <a href="/contact/" class="text-3xl font-headline font-bold text-zinc-100 tracking-tight" data-i18n="nav_contact">Contact</a>
                        <a href="/request/" class="text-2xl font-body font-semibold text-amber-200/80 tracking-widest uppercase py-4 border-y border-zinc-800/50 w-full text-center" data-i18n="nav_custom_request">Custom Request</a>
                    </div>
                    
                    <div class="flex flex-col items-center gap-6 pt-8 border-t border-zinc-800/50 p-6">
                        <div class="flex items-center gap-6 rtl:gap-6">
                            <button id="mobile-lang-toggle" class="bg-zinc-900 border border-zinc-800 text-zinc-400 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                <span class="material-symbols-outlined text-sm">language</span>
                                <span id="mobile-lang-label">عربي</span>
                            </button>
                        </div>
                        <div id="mobile-auth-area">
                            <!-- Auth content injected here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        this._highlightActiveLink();
        this._setupMobileMenu();
        this._initAuth();
    }

    _highlightActiveLink() {
        const path = window.location.pathname;
        
        // Desktop Links
        const links = this.querySelectorAll('#desktop-nav-links a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            // Match exact path or path with trailing slash
            if (href === path || href === path + '/' || href + '/' === path || (href === '/' && (path === '/' || path === '/index.html'))) {
                link.className = "text-amber-200 font-medium border-b-2 border-amber-200 pb-1 font-body text-sm tracking-wide";
            }
        });
    }

    _setupMobileMenu() {
        const drawer = this.querySelector('#mobile-drawer');
        const content = this.querySelector('#drawer-content');
        const backdrop = this.querySelector('#drawer-backdrop');
        const openBtn = this.querySelector('#mobile-menu-btn');
        const closeBtn = this.querySelector('#close-menu');

        const openDrawer = () => {
            drawer.classList.remove('invisible');
            drawer.classList.add('pointer-events-auto');
            setTimeout(() => {
                backdrop.classList.replace('opacity-0', 'opacity-100');
                content.classList.replace('translate-x-full', 'translate-x-0');
            }, 10);
            document.body.style.overflow = 'hidden';
        };

        const closeDrawer = () => {
            backdrop.classList.replace('opacity-100', 'opacity-0');
            content.classList.replace('translate-x-0', 'translate-x-full');
            drawer.classList.remove('pointer-events-auto');
            setTimeout(() => {
                drawer.classList.add('invisible');
            }, 500);
            document.body.style.overflow = '';
        };

        openBtn?.addEventListener('click', openDrawer);
        closeBtn?.addEventListener('click', closeDrawer);
        backdrop?.addEventListener('click', closeDrawer);
        
        // Close drawer when clicking on links
        this.querySelectorAll('#drawer-content a').forEach(link => {
            link.addEventListener('click', closeDrawer);
        });
    }

    _initAuth() {
        const checkAuth = () => {
            if (window.SheshenyAuth) {
                window.SheshenyAuth.initHeaderAuth();
            } else {
                setTimeout(checkAuth, 100);
            }
        };
        checkAuth();
    }
}

class FooterComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="w-full border-t border-zinc-800/20 bg-zinc-950 grid grid-cols-1 md:grid-cols-3 gap-12 px-12 py-20 relative z-10">
                <div>
                    <div class="text-lg font-headline italic text-amber-200/50 mb-6">Shesheny Motors</div>
                    <p class="font-body text-zinc-500 text-sm" data-i18n="footer_copyright">© 2024 Shesheny Motors. Private Gallery.</p>
                </div>
                <div>
                    <h4 class="font-headline text-amber-200 mb-6" data-i18n="footer_contact">Contact</h4>
                    <ul class="space-y-3 font-body text-sm">
                        <li><a class="text-zinc-500 hover:text-zinc-300 hover:translate-x-1 transition-transform duration-200 inline-block" href="/contact/" data-i18n="footer_inquiries">Inquiries</a></li>
                        <li><a class="text-zinc-500 hover:text-zinc-300 hover:translate-x-1 transition-transform duration-200 inline-block" href="/request/" data-i18n="footer_custom_request">Custom Request</a></li>
                        <li><a class="text-zinc-500 hover:text-zinc-300 hover:translate-x-1 transition-transform duration-200 inline-block" href="/contact/" data-i18n="footer_appointments">Appointments</a></li>
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
                const settings = data.reduce((acc, row) => ({...acc, [row.key]: row.value}), {});
                
                const parseLinks = (val) => {
                    try { return JSON.parse(val); } catch(e) { return [val]; }
                };

                const igLinks = parseLinks(settings.instagram_link);
                const fbLinks = parseLinks(settings.facebook_link);
                const ttLinks = parseLinks(settings.tiktok_link);

                const igEl = this.querySelector('#footer-instagram');
                const fbEl = this.querySelector('#footer-facebook');
                const socialsList = this.querySelector('#footer-socials');

                if(igEl && igLinks.length > 0) igEl.href = igLinks[0];
                if(fbEl && fbLinks.length > 0) fbEl.href = fbLinks[0];

                // Optionally add TikTok if it exists and wasn't in original HTML
                if(ttLinks.length > 0 && socialsList && !this.querySelector('#footer-tiktok')) {
                    const li = document.createElement('li');
                    li.innerHTML = `<a class="text-zinc-500 hover:text-zinc-300 hover:translate-x-1 transition-transform duration-200 inline-block" href="${ttLinks[0]}" id="footer-tiktok" target="_blank">TikTok</a>`;
                    socialsList.appendChild(li);
                }

                const waLinks = parseLinks(settings.whatsapp_number);
                if(waLinks.length > 0 && socialsList && !this.querySelector('#footer-whatsapp')) {
                    let waHref = waLinks[0];
                    if (!waHref.startsWith('http')) {
                        // Strip non-numeric characters and format as wa.me link
                        const cleanNum = waHref.replace(/\D/g, '');
                        // Assuming Egypt (+20) if it starts with 0
                        const formattedNum = cleanNum.startsWith('0') ? '2' + cleanNum : cleanNum;
                        waHref = `https://wa.me/${formattedNum}`;
                    }
                    const li = document.createElement('li');
                    li.innerHTML = `<a class="text-zinc-500 hover:text-zinc-300 hover:translate-x-1 transition-transform duration-200 inline-block" href="${waHref}" id="footer-whatsapp" target="_blank">WhatsApp</a>`;
                    socialsList.appendChild(li);
                }
            }
        }
    }
}

customElements.define('shesheny-header', HeaderComponent);
customElements.define('shesheny-footer', FooterComponent);

// Global Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registered!', reg))
            .catch(err => console.log('SW registration failed', err));
    });
}
