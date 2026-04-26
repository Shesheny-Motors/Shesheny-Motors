// js/inventory.js

let allVehicles = [];

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Fetch data
    if(window.DbCache && window.supabaseClient) {
        const {data: settingsData} = await window.DbCache.fetch('settings', () => window.supabaseClient.from('settings').select('*'));
        if(settingsData && settingsData.length > 0) {
            window.settingsData = settingsData.reduce((acc, row) => ({...acc, [row.key]: row.value}), {});
        }

        const {data} = await window.DbCache.fetch('products', () => window.supabaseClient.from('products').select('*').eq('is_sold_out', false));
        if(data) {
            allVehicles = data;
            populateFilters(allVehicles);
            renderGrid(allVehicles);
        }
    }

    // 2. Setup Filter Listeners
    document.getElementById('filter-brand').addEventListener('change', applyFilters);
    document.getElementById('filter-color').addEventListener('change', applyFilters);
    document.getElementById('filter-condition').addEventListener('change', applyFilters);
    
    const priceSlider = document.getElementById('filter-price');
    priceSlider.addEventListener('input', (e) => {
        updatePriceDisplay(e.target.value);
    });
    priceSlider.addEventListener('change', applyFilters);
});

document.addEventListener('currencyChanged', (e) => {
    // Re-evaluate slider min/max based on currency
    if(allVehicles.length > 0) {
        updatePriceSliderLimits();
        renderGrid(allVehicles); // Re-render to show new currency
    }
});

function populateFilters(vehicles) {
    const brands = [...new Set(vehicles.map(v => v.category))].filter(Boolean);
    const origins = [...new Set(vehicles.map(v => v.origin))].filter(Boolean);

    const brandSelect = document.getElementById('filter-brand');
    brandSelect.innerHTML = '<option value="">All Categories</option>';
    brands.forEach(b => brandSelect.add(new Option(b, b)));

    const colorSelect = document.getElementById('filter-color');
    colorSelect.innerHTML = '<option value="">All Origins</option>';
    origins.forEach(c => colorSelect.add(new Option(c, c)));

    updatePriceSliderLimits();
}

function updatePriceSliderLimits() {
    if(allVehicles.length === 0) return;

    const isUsd = window.I18n ? window.I18n.currency === 'USD' : false;
    const exchangeRate = window.settingsData?.exchange_rate || 50;
    const maxPrice = Math.max(...allVehicles.map(v => isUsd ? (v.price_egp / exchangeRate) : v.price_egp));
    
    const slider = document.getElementById('filter-price');
    slider.max = maxPrice;
    slider.value = maxPrice;
    updatePriceDisplay(maxPrice);
}

function updatePriceDisplay(val) {
    const display = document.getElementById('price-display');
    const isUsd = window.I18n ? window.I18n.currency === 'USD' : false;
    display.textContent = window.I18n ? window.I18n.formatPrice(val, val) : (isUsd ? `$${val}` : `${val} EGP`);
}

function applyFilters() {
    const brand = document.getElementById('filter-brand').value;
    const color = document.getElementById('filter-color').value;
    const condition = document.getElementById('filter-condition').value;
    const maxPrice = parseFloat(document.getElementById('filter-price').value);

    const isUsd = window.I18n ? window.I18n.currency === 'USD' : false;

    const filtered = allVehicles.filter(v => {
        const exchangeRate = window.settingsData?.exchange_rate || 50;
        const vPrice = isUsd ? (v.price_egp / exchangeRate) : v.price_egp;
        return (brand === '' || v.category === brand) && // Using category as the primary filter instead of brand for now
               (color === '' || v.origin === color) && // Using origin instead of color
               (condition === '' || (v.is_imported ? 'Imported' : 'Egyptian') === condition) &&
               (vPrice <= maxPrice);
    });

    renderGrid(filtered);
}

function renderGrid(vehicles) {
    const grid = document.getElementById('inventory-grid');
    if(!grid) return;

    if(vehicles.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center text-on-surface-variant font-body">No vehicles found matching your criteria.</div>`;
        return;
    }

    grid.innerHTML = vehicles.map(v => {
        const isUsd = window.I18n ? window.I18n.currency === 'USD' : false;
        const exchangeRate = window.settingsData?.exchange_rate || 50;
        const priceUsd = v.price_egp / exchangeRate;
        const priceStr = window.I18n ? window.I18n.formatPrice(v.price_egp, priceUsd) : (isUsd ? `$${priceUsd.toLocaleString()}` : `${v.price_egp.toLocaleString()} EGP`);
        
        // Check favorites (assuming a fav array in localStorage)
        const favs = JSON.parse(localStorage.getItem('favs') || '[]');
        const isFav = favs.includes(v.id);
        const heartIcon = isFav ? 'favorite' : 'favorite_border';

        return `
        <article class="bg-surface-container-high rounded flex flex-col overflow-hidden group hover:bg-surface-container-highest transition-colors duration-300 border border-outline-variant/10 relative">
            <button class="fav-btn absolute top-4 right-4 z-10 w-10 h-10 bg-surface/50 backdrop-blur-md rounded-full flex items-center justify-center text-primary hover:scale-110 transition-transform" data-id="${v.id}">
                <span class="material-symbols-outlined">${heartIcon}</span>
            </button>
            <div class="w-full aspect-[16/9] overflow-hidden relative">
                <img alt="${v.name}" class="w-full h-full object-cover transform group-hover:scale-[1.03] transition-transform duration-700 ease-out mix-blend-luminosity hover:mix-blend-normal" src="${v.image_url}"/>
            </div>
            <div class="p-8 flex flex-col flex-grow justify-between">
                <div>
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-2xl font-serif text-on-surface">${v.name}</h3>
                        <span class="text-xl font-serif text-primary">${priceStr}</span>
                    </div>
                </div>
                <!-- Specs Blade Mini -->
                <div class="bg-surface-container-lowest p-4 rounded flex items-center justify-between text-xs font-body text-on-surface-variant mb-6 border border-outline-variant/10">
                    <div class="flex flex-col items-center">
                        <span class="uppercase tracking-wider opacity-60 mb-1" data-i18n="details_year">Year/Ver</span>
                        <span class="text-on-surface font-medium">${v.version || '-'}</span>
                    </div>
                    <div class="w-px h-8 bg-outline-variant/30"></div>
                    <div class="flex flex-col items-center">
                        <span class="uppercase tracking-wider opacity-60 mb-1" data-i18n="details_miles">Miles</span>
                        <span class="text-on-surface font-medium">${v.mileage || '-'}</span>
                    </div>
                    <div class="w-px h-8 bg-outline-variant/30"></div>
                    <div class="flex flex-col items-center">
                        <span class="uppercase tracking-wider opacity-60 mb-1" data-i18n="details_trans">Trans</span>
                        <span class="text-on-surface font-medium">${v.transmission || '-'}</span>
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
            toggleFavorite(id, e.currentTarget);
        });
    });

    if(window.I18n) window.I18n.applyLanguage();
}

function toggleFavorite(id, btn) {
    let favs = JSON.parse(localStorage.getItem('favs') || '[]');
    const icon = btn.querySelector('span');

    if(favs.includes(id)) {
        favs = favs.filter(fid => fid !== id);
        icon.textContent = 'favorite_border';
    } else {
        favs.push(id);
        icon.textContent = 'favorite';
    }
    
    localStorage.setItem('favs', JSON.stringify(favs));
}
