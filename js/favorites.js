// js/favorites.js

document.addEventListener('DOMContentLoaded', async () => {
    if(window.DbCache && window.supabaseClient) {
        const {data: vehicles} = await window.DbCache.fetch('vehicles', () => window.supabaseClient.from('vehicles').select('*'));
        if(vehicles) {
            renderFavorites(vehicles);
        }
    }
});

document.addEventListener('currencyChanged', (e) => {
    // Re-render to show new currency
    if(window.DbCache && window.supabaseClient) {
        window.DbCache.fetch('vehicles', () => window.supabaseClient.from('vehicles').select('*')).then(({data}) => {
            if(data) renderFavorites(data);
        });
    }
});

function renderFavorites(allVehicles) {
    const grid = document.getElementById('favorites-grid');
    if(!grid) return;

    let favs = JSON.parse(localStorage.getItem('favs') || '[]');
    const favVehicles = allVehicles.filter(v => favs.includes(v.id));

    if(favVehicles.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center text-on-surface-variant font-body text-lg py-12" data-i18n="fav_empty">You have no saved vehicles yet.</div>`;
        if(window.I18n) window.I18n.applyLanguage();
        return;
    }

    grid.innerHTML = favVehicles.map(v => {
        const isUsd = window.I18n ? window.I18n.currency === 'USD' : false;
        const priceStr = window.I18n ? window.I18n.formatPrice(v.price_egp, v.price_usd) : (isUsd ? `$${v.price_usd.toLocaleString()}` : `${v.price_egp.toLocaleString()} EGP`);

        return `
        <article class="bg-surface-container-high rounded flex flex-col overflow-hidden group hover:bg-surface-container-highest transition-colors duration-300 border border-outline-variant/10 relative">
            <button class="fav-btn absolute top-4 right-4 z-10 w-10 h-10 bg-surface/50 backdrop-blur-md rounded-full flex items-center justify-center text-primary hover:scale-110 transition-transform" data-id="${v.id}">
                <span class="material-symbols-outlined">favorite</span>
            </button>
            <div class="w-full aspect-[16/9] overflow-hidden relative">
                <img alt="${v.model}" class="w-full h-full object-cover transform group-hover:scale-[1.03] transition-transform duration-700 ease-out mix-blend-luminosity hover:mix-blend-normal" src="${v.thumbnail}"/>
            </div>
            <div class="p-8 flex flex-col flex-grow justify-between">
                <div>
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-2xl font-serif text-on-surface">${v.brand} ${v.model}</h3>
                        <span class="text-xl font-serif text-primary">${priceStr}</span>
                    </div>
                </div>
                <!-- Specs Blade Mini -->
                <div class="bg-surface-container-lowest p-4 rounded flex items-center justify-between text-xs font-body text-on-surface-variant mb-6 border border-outline-variant/10">
                    <div class="flex flex-col items-center">
                        <span class="uppercase tracking-wider opacity-60 mb-1" data-i18n="details_year">Year</span>
                        <span class="text-on-surface font-medium">${v.year}</span>
                    </div>
                    <div class="w-px h-8 bg-outline-variant/30"></div>
                    <div class="flex flex-col items-center">
                        <span class="uppercase tracking-wider opacity-60 mb-1" data-i18n="details_miles">Miles</span>
                        <span class="text-on-surface font-medium">${v.miles}</span>
                    </div>
                    <div class="w-px h-8 bg-outline-variant/30"></div>
                    <div class="flex flex-col items-center">
                        <span class="uppercase tracking-wider opacity-60 mb-1" data-i18n="details_0_60">0-60</span>
                        <span class="text-on-surface font-medium">${v.acceleration}s</span>
                    </div>
                </div>
                <a href="details.html?id=${v.id}" class="w-full py-3 border border-outline/30 text-primary font-body text-sm font-medium hover:bg-surface-container-lowest transition-colors duration-200 rounded tracking-wide block text-center" data-i18n="btn_details">
                    View Details
                </a>
            </div>
        </article>
    `}).join('');

    // Attach favorites listener
    document.querySelectorAll('.fav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.getAttribute('data-id'));
            removeFavorite(id, e.currentTarget);
        });
    });

    if(window.I18n) window.I18n.applyLanguage();
}

function removeFavorite(id, btn) {
    let favs = JSON.parse(localStorage.getItem('favs') || '[]');
    favs = favs.filter(fid => fid !== id);
    localStorage.setItem('favs', JSON.stringify(favs));
    
    // Remove the card visually
    const card = btn.closest('article');
    if(card) {
        card.remove();
    }

    const grid = document.getElementById('favorites-grid');
    if(grid && grid.children.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center text-on-surface-variant font-body text-lg py-12" data-i18n="fav_empty">You have no saved vehicles yet.</div>`;
        if(window.I18n) window.I18n.applyLanguage();
    }
}
