// js/auth.js — Shesheny Motors Authentication Module

window.SheshenyAuth = (() => {
    const sb = () => window.supabaseClient;

    // --- Core Auth Methods ---
    async function signUpWithEmail(email, password, fullName) {
        const { data, error } = await sb().auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName }
            }
        });
        return { data, error };
    }

    async function signInWithEmail(email, password) {
        const { data, error } = await sb().auth.signInWithPassword({ email, password });
        return { data, error };
    }

    async function signInWithGoogle() {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect') || 'index.html';
        
        // Finalized fix for subdirectory hosting (like GitHub Pages)
        const directory = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
        const finalRedirect = window.location.origin + directory + redirect;

        const { data, error } = await sb().auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: finalRedirect
            }
        });
        return { data, error };
    }

    async function signOut() {
        const { error } = await sb().auth.signOut();
        return { error };
    }

    async function getSession() {
        const { data: { session } } = await sb().auth.getSession();
        return session;
    }

    async function getUser() {
        const { data: { user } } = await sb().auth.getUser();
        return user;
    }

    function onAuthStateChange(callback) {
        return sb().auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
    }

    // --- UI Helpers ---
    function getUserDisplayName(user) {
        if (!user) return null;
        return user.user_metadata?.full_name 
            || user.user_metadata?.name 
            || user.email?.split('@')[0] 
            || 'User';
    }

    function getUserAvatar(user) {
        if (!user) return null;
        return user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
    }

    function getUserInitial(user) {
        const name = getUserDisplayName(user);
        return name ? name.charAt(0).toUpperCase() : '?';
    }

    // --- Header Integration ---
    async function initHeaderAuth() {
        const session = await getSession();
        updateHeaderUI(session?.user || null);

        onAuthStateChange((event, session) => {
            updateHeaderUI(session?.user || null);
        });
    }

    function updateHeaderUI(user) {
        // Desktop auth area
        const desktopAuthArea = document.getElementById('desktop-auth-area');
        // Mobile auth area
        const mobileAuthArea = document.getElementById('mobile-auth-area');

        if (!desktopAuthArea) return;

        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const currentSearch = window.location.search;
        const redirectParam = encodeURIComponent(currentPath + currentSearch);

        if (user) {
            const name = getUserDisplayName(user);
            const avatar = getUserAvatar(user);
            const initial = getUserInitial(user);

            const avatarHtml = avatar
                ? `<img src="${avatar}" alt="${name}" class="w-8 h-8 rounded-full object-cover border border-amber-200/30" />`
                : `<div class="w-8 h-8 rounded-full bg-amber-200/20 border border-amber-200/30 flex items-center justify-center text-amber-200 text-sm font-bold">${initial}</div>`;

            desktopAuthArea.innerHTML = `
                <div class="relative group" id="user-menu-wrapper">
                    <button class="flex items-center gap-2 hover:opacity-80 transition-opacity" id="user-menu-btn">
                        ${avatarHtml}
                        <span class="text-zinc-300 text-sm font-medium hidden lg:inline max-w-[120px] truncate">${name}</span>
                        <span class="material-symbols-outlined text-zinc-500 text-sm">expand_more</span>
                    </button>
                    <div id="user-dropdown" class="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 hidden opacity-0 transition-all duration-200 z-[70]">
                        <div class="px-4 py-3 border-b border-zinc-800">
                            <p class="text-sm font-medium text-zinc-200 truncate">${name}</p>
                            <p class="text-xs text-zinc-500 truncate">${user.email}</p>
                        </div>
                        <button id="btn-logout" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-800/50 transition-colors">
                            <span class="material-symbols-outlined text-base">logout</span>
                            Sign Out
                        </button>
                    </div>
                </div>
            `;

            // Setup dropdown toggle
            const menuBtn = document.getElementById('user-menu-btn');
            const dropdown = document.getElementById('user-dropdown');
            if (menuBtn && dropdown) {
                menuBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isOpen = !dropdown.classList.contains('hidden');
                    if (isOpen) {
                        dropdown.classList.add('opacity-0');
                        setTimeout(() => dropdown.classList.add('hidden'), 150);
                    } else {
                        dropdown.classList.remove('hidden');
                        requestAnimationFrame(() => dropdown.classList.remove('opacity-0'));
                    }
                });
                document.addEventListener('click', () => {
                    dropdown.classList.add('opacity-0');
                    setTimeout(() => dropdown.classList.add('hidden'), 150);
                });
            }

            // Setup logout
            const logoutBtn = document.getElementById('btn-logout');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async () => {
                    await signOut();
                    window.location.reload();
                });
            }

            // Mobile
            if (mobileAuthArea) {
                mobileAuthArea.innerHTML = `
                    <div class="flex flex-col items-center gap-3">
                        ${avatarHtml.replace('w-8 h-8', 'w-12 h-12').replace('text-sm', 'text-lg')}
                        <div class="text-center">
                            <p class="text-zinc-200 font-medium text-lg">${name}</p>
                            <p class="text-zinc-500 text-xs">${user.email}</p>
                        </div>
                        <button id="btn-logout-mobile" class="mt-2 text-red-400 text-base font-body flex items-center gap-2 border border-red-400/30 px-5 py-2 rounded-lg hover:bg-red-400/10 transition-colors">
                            <span class="material-symbols-outlined text-base">logout</span>
                            Sign Out
                        </button>
                    </div>
                `;
                const logoutMobile = document.getElementById('btn-logout-mobile');
                if (logoutMobile) {
                    logoutMobile.addEventListener('click', async () => {
                        await signOut();
                        window.location.reload();
                    });
                }
            }
        } else {
            desktopAuthArea.innerHTML = `
                <a href="login.html?redirect=${redirectParam}" class="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-2.5 rounded hover:scale-105 transition-transform duration-200 font-label font-medium text-sm">
                    Sign In
                </a>
            `;
            if (mobileAuthArea) {
                mobileAuthArea.innerHTML = `
                    <a href="login.html?redirect=${redirectParam}" class="text-2xl font-headline text-amber-200">Sign In</a>
                `;
            }
        }
    }

    return {
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        signOut,
        getSession,
        getUser,
        onAuthStateChange,
        getUserDisplayName,
        getUserAvatar,
        getUserInitial,
        initHeaderAuth,
        updateHeaderUI
    };
})();
