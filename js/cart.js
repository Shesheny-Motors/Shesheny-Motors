document.addEventListener('DOMContentLoaded', async () => {
    const cartIds = JSON.parse(localStorage.getItem('cart') || '[]');
    const depositIds = JSON.parse(localStorage.getItem('deposits') || '[]');

    const contentDiv = document.getElementById('cart-content');
    const emptyState = document.getElementById('empty-state');

    if (cartIds.length === 0) {
        contentDiv.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    if(window.DbCache && window.supabaseClient) {
        const { data: products } = await window.supabaseClient
            .from('products')
            .select('*')
            .in('id', cartIds);
            
        if(products && products.length > 0) {
            renderCart(products, depositIds);
        } else {
            contentDiv.classList.add('hidden');
            emptyState.classList.remove('hidden');
        }
    }
});

function renderCart(products, depositIds) {
    const contentDiv = document.getElementById('cart-content');
    contentDiv.innerHTML = products.map(v => {
        const isUsd = window.I18n ? window.I18n.currency === 'USD' : false;
        const exchangeRate = window.settingsData?.exchange_rate || 50;
        const priceUsd = v.price_egp / exchangeRate;
        const priceStr = window.I18n ? window.I18n.formatPrice(v.price_egp, priceUsd) : (isUsd ? `$${priceUsd.toLocaleString()}` : `${v.price_egp.toLocaleString()} EGP`);
        
        const hasDeposit = depositIds.includes(v.id);
        const depositBadge = hasDeposit ? 
            `<div class="absolute top-4 left-4 bg-primary text-on-primary text-xs font-bold px-3 py-1 rounded shadow-md z-10 flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">task_alt</span>
                Deposit Paid
            </div>` : '';

        return `
        <article class="bg-surface-container-high rounded flex flex-col overflow-hidden group border border-outline-variant/10 relative" id="cart-item-${v.id}">
            ${depositBadge}
            <button class="remove-btn absolute top-4 right-4 z-10 w-10 h-10 bg-surface/50 backdrop-blur-md rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:text-red-500 transition-all" data-id="${v.id}" title="Remove from cart">
                <span class="material-symbols-outlined">delete</span>
            </button>
            <div class="w-full aspect-[16/9] overflow-hidden relative">
                <img alt="${v.name}" class="w-full h-full object-cover transform group-hover:scale-[1.03] transition-transform duration-700 ease-out" src="${v.image_url}"/>
            </div>
            <div class="p-6 flex flex-col flex-grow justify-between">
                <div class="mb-4">
                    <h3 class="text-xl font-serif text-on-surface mb-1">${v.name}</h3>
                    <span class="text-lg font-serif text-primary">${priceStr}</span>
                </div>
                
                <a href="details.html?id=${v.id}" class="w-full py-2 border border-outline/30 text-primary font-body text-sm font-medium hover:bg-surface-container-lowest transition-colors duration-200 rounded tracking-wide block text-center" data-i18n="btn_details">
                    View Details
                </a>
            </div>
        </article>
        `;
    }).join('');

    // Attach remove listeners
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.getAttribute('data-id'));
            removeFromCart(id);
        });
    });

    if(window.I18n) window.I18n.applyLanguage();
}

function removeFromCart(id) {
    let cartIds = JSON.parse(localStorage.getItem('cart') || '[]');
    cartIds = cartIds.filter(fid => fid !== id);
    localStorage.setItem('cart', JSON.stringify(cartIds));

    const itemElement = document.getElementById(`cart-item-${id}`);
    if (itemElement) {
        itemElement.remove();
    }

    if (cartIds.length === 0) {
        document.getElementById('cart-content').classList.add('hidden');
        document.getElementById('empty-state').classList.remove('hidden');
    }
}
