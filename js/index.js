// js/index.js

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Load Settings (Hero image & Event theme)
    if(window.DbCache && window.supabaseClient) {
        const {data: settings} = await window.DbCache.fetch('settings', () => window.supabaseClient.from('settings').select('*'));
        if(settings && settings.length > 0) {
            const heroImg = document.getElementById('hero-img');
            if(heroImg) {
                heroImg.src = settings[0].hero_image;
            }
            
            // Apply event theme
            if(settings[0].active_event && settings[0].active_event !== 'none') {
                document.body.classList.add(`theme-${settings[0].active_event}`);
            }
        }

        // 2. Load Featured Inventory
        const {data: vehicles} = await window.DbCache.fetch('vehicles', () => window.supabaseClient.from('vehicles').select('*'));
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
    
    grid.innerHTML = vehicles.map(v => `
        <div class="bg-surface-container-high rounded overflow-hidden group border border-outline-variant/10">
            <div class="h-64 overflow-hidden relative">
                <img alt="${v.model}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out mix-blend-luminosity hover:mix-blend-normal" src="${v.thumbnail}"/>
            </div>
            <div class="p-8">
                <h3 class="font-headline text-2xl font-semibold mb-2 text-on-surface">${v.brand} ${v.model}</h3>
                <div class="bg-surface-container-lowest p-4 rounded mb-6 mt-4 flex justify-between text-xs font-body text-on-surface-variant uppercase tracking-wider">
                    <div class="flex flex-col"><span class="text-outline mb-1" data-i18n="details_year">Year</span> ${v.year}</div>
                    <div class="flex flex-col"><span class="text-outline mb-1" data-i18n="details_miles">Miles</span> ${v.miles}</div>
                    <div class="flex flex-col"><span class="text-outline mb-1" data-i18n="details_0_60">0-60</span> ${v.acceleration}s</div>
                    <div class="flex flex-col"><span class="text-outline mb-1" data-i18n="details_hp">HP</span> ${v.hp}</div>
                </div>
                <a href="details.html?id=${v.id}" class="block w-full py-3 border border-outline/30 text-primary hover:bg-surface-container-highest transition-colors duration-200 font-label text-sm uppercase tracking-wider rounded text-center" data-i18n="btn_details">View Details</a>
            </div>
        </div>
    `).join('');

    // Re-apply translations for the newly injected HTML
    if(window.I18n) window.I18n.applyLanguage();
}
