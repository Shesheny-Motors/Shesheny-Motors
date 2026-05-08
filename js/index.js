// js/index.js
const optimizeImage = (url, width) => {
    if (!url) return '';
    if (url.includes('wsrv.nl')) return url;
    if (url.startsWith('https://')) {
        return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&output=webp&q=80`;
    }
    return url;
};

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Load Settings (Hero image & Event theme)
    if(window.DbCache && window.supabaseClient) {
        const {data: settingsData} = await window.DbCache.fetch('settings', () => window.supabaseClient.from('settings').select('*'));
        if(settingsData && settingsData.length > 0) {
            window.settingsData = settingsData.reduce((acc, row) => ({...acc, [row.key]: row.value}), {});
            
            const heroImg = document.getElementById('hero-img');
            if(heroImg && window.settingsData.hero_image) {
                heroImg.src = optimizeImage(window.settingsData.hero_image, 1600);
            }
            
            // Apply event theme
            if(window.settingsData.active_event && window.settingsData.active_event !== 'none') {
                document.body.classList.add(`theme-${window.settingsData.active_event}`);
            }
        }

        // 2. Load Featured Inventory
        const {data: vehicles} = await window.DbCache.fetch('products', () => window.supabaseClient.from('products').select('*').order('order_spotlight', { ascending: true }));
        if(vehicles) {
            const featured = vehicles.filter(v => v.is_spotlight).slice(0, 3);
            renderFeatured(featured);
        }
    }
});

document.addEventListener('languageChanged', async (e) => {
    if(window.DbCache && window.supabaseClient) {
        const {data: vehicles} = await window.DbCache.fetch('products', () => window.supabaseClient.from('products').select('*').order('order_spotlight', { ascending: true }));
        if(vehicles) {
            const featured = vehicles.filter(v => v.is_spotlight).slice(0, 3);
            renderFeatured(featured);
        }
    }
});

document.addEventListener('currencyChanged', (e) => {
    // Re-render featured prices if we were displaying them on cards 
    // Currently index doesn't show prices, but if it did, we'd handle it here.
});

function renderFeatured(vehicles) {
    const grid = document.getElementById('featured-grid');
    if(!grid) return;
    
    const isAr = window.I18n ? window.I18n.lang === 'ar' : (localStorage.getItem('site_lang') === 'ar');

    grid.innerHTML = vehicles.map(v => {
        const vName = (isAr && v.name_ar) ? v.name_ar : v.name;
        return `
        <div class="bg-surface-container-high rounded overflow-hidden group border border-outline-variant/10">
            <div class="h-64 overflow-hidden relative ${v.is_sold_out ? 'group-hover:[&>img]:grayscale-0 group-hover:[&>img]:mix-blend-normal' : ''}">
                <img alt="${vName}" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-in-out mix-blend-luminosity hover:mix-blend-normal ${v.is_sold_out ? 'grayscale mix-blend-normal' : ''}" src="${optimizeImage(v.image_url, 800)}" />
                ${v.is_sold_out ? '<div class="absolute inset-0 flex items-center justify-center z-10 bg-black/40"><span class="text-red-600 font-bold border-4 border-red-600 rounded px-6 py-2 transform -rotate-12 text-3xl uppercase tracking-widest bg-black/50 shadow-2xl backdrop-blur-sm">Sold Out</span></div>' : ''}
            </div>
            <div class="p-8">
                <h3 class="font-headline text-2xl font-semibold mb-2 text-on-surface">${vName}</h3>
                <div class="bg-surface-container-lowest p-4 rounded mb-6 mt-4 flex justify-between text-xs font-body text-on-surface-variant uppercase tracking-wider">
                    <div class="flex flex-col"><span class="text-outline mb-1" data-i18n="details_year">Year/Ver</span> ${v.version || '-'}</div>
                    <div class="flex flex-col"><span class="text-outline mb-1" data-i18n="details_miles">Miles</span> ${v.mileage || '-'}</div>
                    <div class="flex flex-col"><span class="text-outline mb-1" data-i18n="details_trans">Trans</span> ${v.transmission || '-'}</div>
                    <div class="flex flex-col"><span class="text-outline mb-1" data-i18n="details_hp">Fuel</span> ${v.fuel_type || '-'}</div>
                </div>
                <a href="/details/?id=${v.id}" class="block w-full py-3 border border-outline/30 text-primary hover:bg-surface-container-highest transition-colors duration-200 font-label text-sm uppercase tracking-wider rounded text-center" data-i18n="btn_details">View Details</a>
            </div>
        </div>
        `;
    }).join('');

    // Re-apply translations for the newly injected HTML
    if(window.I18n) window.I18n.applyLanguage();
}
