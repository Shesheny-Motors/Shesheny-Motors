// js/inventory.js
const optimizeImage = (url, width) => {
    if (!url) return '';
    if (url.includes('wsrv.nl')) return url;
    if (url.startsWith('https://')) {
        return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&output=webp&q=80`;
    }
    return url;
};

let allVehicles = [];

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Fetch data
    if(window.DbCache && window.supabaseClient) {
        const {data: settingsData} = await window.DbCache.fetch('settings', () => window.supabaseClient.from('settings').select('*'));
        if(settingsData && settingsData.length > 0) {
            window.settingsData = settingsData.reduce((acc, row) => ({...acc, [row.key]: row.value}), {});
        }

        const {data} = await window.DbCache.fetch('products', () => window.supabaseClient.from('products').select('*').eq('is_sold_out', false));
        const {data: brandsData} = await window.DbCache.fetch('brands', () => window.supabaseClient.from('brands').select('*'));
        const {data: categoriesData} = await window.DbCache.fetch('categories', () => window.supabaseClient.from('categories').select('*'));
        if(brandsData) window.allBrands = brandsData;
        if(categoriesData) window.allCategories = categoriesData;

        if(data) {
            allVehicles = data;
            populateFilters(allVehicles);
            renderGrid(allVehicles);
        }
    }

    // 2. Setup Filter Listeners
    document.getElementById('filter-category').addEventListener('change', applyFilters);
    document.getElementById('filter-brand').addEventListener('change', applyFilters);
});

document.addEventListener('currencyChanged', (e) => {
    // Re-evaluate slider min/max based on currency
    if(allVehicles.length > 0) {
        updatePriceSliderLimits();
        renderGrid(allVehicles); // Re-render to show new currency
    }
});

function populateFilters(vehicles) {
    const brands = window.allBrands || [];
    const categories = window.allCategories || [...new Set(vehicles.map(v => v.category))].filter(Boolean);

    const categorySelect = document.getElementById('filter-category');
    categorySelect.innerHTML = '<option value="" style="background:#353534;color:#e5e2e1;">All Types</option>';
    if (Array.isArray(categories) && categories.length > 0 && typeof categories[0] === 'object') {
        categories.forEach(c => {
            const opt = new Option(c.name, c.name);
            opt.style.background = '#353534';
            opt.style.color = '#e5e2e1';
            categorySelect.add(opt);
        });
    } else {
        categories.forEach(c => {
            const opt = new Option(c, c);
            opt.style.background = '#353534';
            opt.style.color = '#e5e2e1';
            categorySelect.add(opt);
        });
    }

    const brandContainer = document.getElementById('filter-brand-container');
    if (brandContainer) {
        brandContainer.innerHTML = `
            <button class="brand-filter-btn active flex items-center justify-center w-14 h-14 text-xs font-bold border-2 border-outline-variant rounded-xl hover:border-primary transition-all duration-300 data-[active=true]:bg-primary data-[active=true]:text-on-primary data-[active=true]:border-primary text-on-surface-variant uppercase shadow-lg shadow-black/20" data-brand="" title="All Brands">All</button>
            ${brands.map(b => `<button class="brand-filter-btn flex items-center justify-center w-14 h-14 border-2 border-outline-variant rounded-xl hover:border-primary transition-all duration-300 data-[active=true]:border-primary data-[active=true]:bg-primary/10 data-[active=true]:shadow-[0_0_20px_rgba(233,193,118,0.15)] text-on-surface-variant overflow-hidden p-2 shadow-lg shadow-black/20 group" data-brand="${b.id}" title="${b.name}">${b.logo_url ? `<img src="${b.logo_url}" alt="${b.name}" class="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500" />` : `<span class="text-xs font-bold uppercase">${b.name.slice(0,2)}</span>`}</button>`).join('')}
        `;
        
        document.querySelectorAll('.brand-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.brand-filter-btn').forEach(b => {
                    b.removeAttribute('data-active');
                    b.classList.remove('bg-primary', 'text-on-primary', 'border-primary', 'active', 'bg-primary/10', 'shadow-[0_0_12px_rgba(233,193,118,0.2)]');
                    b.classList.add('text-on-surface-variant', 'border-outline-variant');
                });
                const clicked = e.currentTarget;
                clicked.setAttribute('data-active', 'true');
                clicked.classList.add('border-primary', 'active', 'shadow-[0_0_12px_rgba(233,193,118,0.2)]');
                clicked.classList.remove('text-on-surface-variant', 'border-outline-variant');
                // 'All' button gets solid fill, brand cubes get tinted background
                if (clicked.getAttribute('data-brand') === '') {
                    clicked.classList.add('bg-primary', 'text-on-primary');
                } else {
                    clicked.classList.add('bg-primary/10');
                }
                
                const hiddenInput = document.getElementById('filter-brand');
                if (hiddenInput) {
                    hiddenInput.value = clicked.getAttribute('data-brand');
                    hiddenInput.dispatchEvent(new Event('change'));
                }
            });
        });
        
        // initialize first active state
        const firstBtn = document.querySelector('.brand-filter-btn.active');
        if(firstBtn) {
            firstBtn.setAttribute('data-active', 'true');
            firstBtn.classList.add('bg-primary', 'text-on-primary', 'border-primary');
            firstBtn.classList.remove('text-on-surface-variant', 'border-outline-variant');
        }
    }
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
    const category = document.getElementById('filter-category').value;
    const brand = document.getElementById('filter-brand').value;

    const filtered = allVehicles.filter(v => {
        return (category === '' || v.category === category) &&
               (brand === '' || v.brand_id == brand);
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
        
        // Check cart
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const inCart = cart.includes(v.id);
        const cartIcon = inCart ? 'remove_shopping_cart' : 'add_shopping_cart';

        return `
        <article class="bg-surface-container-high rounded flex flex-col overflow-hidden group hover:bg-surface-container-highest transition-colors duration-300 border border-outline-variant/10 relative">
            <button class="cart-btn absolute top-4 right-4 z-10 w-10 h-10 bg-surface/50 backdrop-blur-md rounded-full flex items-center justify-center text-primary hover:scale-110 transition-transform" data-id="${v.id}" title="${inCart ? 'Remove from Cart' : 'Add to Cart'}">
                <span class="material-symbols-outlined">${cartIcon}</span>
            </button>
            <div class="w-full aspect-[16/9] overflow-hidden relative">
                <img alt="${v.name}" class="w-full h-full object-cover transform group-hover:scale-[1.03] transition-transform duration-700 ease-out" src="${optimizeImage(v.image_url, 800)}" />
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

    // Attach cart listener
    document.querySelectorAll('.cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.getAttribute('data-id'));
            toggleCart(id, e.currentTarget);
        });
    });

    if(window.I18n) window.I18n.applyLanguage();
}

function toggleCart(id, btn) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const icon = btn.querySelector('span');

    if(cart.includes(id)) {
        cart = cart.filter(fid => fid !== id);
        icon.textContent = 'add_shopping_cart';
        btn.title = 'Add to Cart';
    } else {
        cart.push(id);
        icon.textContent = 'remove_shopping_cart';
        btn.title = 'Remove from Cart';
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
}
