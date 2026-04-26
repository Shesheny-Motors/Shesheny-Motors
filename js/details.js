// js/details.js

let currentVehicle = null;
let currentGalleryIndex = 0;
let galleryImages = [];
let slidesInterval = null;

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));

    if(!id) {
        window.location.href = 'inventory.html';
        return;
    }

    // 1. Fetch data
    if(window.DbCache && window.supabaseClient) {
        const {data: settingsData} = await window.DbCache.fetch('settings', () => window.supabaseClient.from('settings').select('*'));
        if(settingsData && settingsData.length > 0) {
            window.settingsData = settingsData.reduce((acc, row) => ({...acc, [row.key]: row.value}), {});
        }

        const {data: vehicles} = await window.DbCache.fetch('products', () => window.supabaseClient.from('products').select('*'));
        
        if(vehicles) {
            currentVehicle = vehicles.find(v => v.id === id);
            if(currentVehicle) {
                renderVehicleDetails();
                setupGallery();
            }
        }

        if(settingsData && settingsData.length > 0) {
            setupContactButtons(window.settingsData);
        }
    }
});

document.addEventListener('currencyChanged', (e) => {
    if(currentVehicle) {
        updatePriceDisplay();
    }
});

function renderVehicleDetails() {
    document.getElementById('detail-title').textContent = currentVehicle.name;
    document.getElementById('detail-year').textContent = currentVehicle.version || '-';
    
    document.getElementById('spec-hp').textContent = currentVehicle.fuel_type || '-';
    document.getElementById('spec-0-60').textContent = currentVehicle.transmission || '-';
    document.getElementById('spec-miles').textContent = currentVehicle.mileage || '-';

    updatePriceDisplay();

    if(currentVehicle.diagnostics_url) {
        const videoContainer = document.getElementById('video-container');
        videoContainer.classList.remove('hidden');
        if (currentVehicle.diagnostics_url.match(/\.(mp4|webm)$/i)) {
             videoContainer.innerHTML = `<video class="w-full h-full object-cover" controls src="${currentVehicle.diagnostics_url}"></video>`;
        } else {
             videoContainer.innerHTML = `<iframe class="w-full h-full" src="${currentVehicle.diagnostics_url}" frameborder="0" allowfullscreen></iframe>`;
        }
    }
}

function updatePriceDisplay() {
    const priceEl = document.getElementById('detail-price');
    const isUsd = window.I18n ? window.I18n.currency === 'USD' : false;
    const exchangeRate = window.settingsData?.exchange_rate || 50;
    const priceUsd = currentVehicle.price_egp / exchangeRate;
    const priceStr = window.I18n ? window.I18n.formatPrice(currentVehicle.price_egp, priceUsd) : (isUsd ? `$${priceUsd.toLocaleString()}` : `${currentVehicle.price_egp.toLocaleString()} EGP`);
    priceEl.textContent = priceStr;
}

function setupContactButtons(settings) {
    const whatsappBtn = document.getElementById('btn-whatsapp');
    const callBtn = document.getElementById('btn-call');

    // Create a pre-filled whatsapp message
    const msg = encodeURIComponent(`Hello, I'm interested in the ${currentVehicle.version} ${currentVehicle.name}.`);
    
    whatsappBtn.href = `https://wa.me/${settings.whatsapp_number.replace(/\D/g,'')}?text=${msg}`;
    callBtn.href = `tel:${settings.phone_number.replace(/\D/g,'')}`;
}

function setupGallery() {
    galleryImages = [currentVehicle.image_url, ...(currentVehicle.gallery || [])];
    
    const thumbsContainer = document.getElementById('gallery-thumbs');
    thumbsContainer.innerHTML = galleryImages.map((img, idx) => `
        <img class="gallery-thumb h-28 w-48 object-cover rounded-sm snap-start cursor-pointer transition-opacity ${idx === 0 ? 'border-2 border-[#c5a059] opacity-100' : 'opacity-50 hover:opacity-100'}" 
             src="${img}" 
             data-index="${idx}" />
    `).join('');

    setMainImage(0);

    document.querySelectorAll('.gallery-thumb').forEach(thumb => {
        thumb.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.getAttribute('data-index'));
            setMainImage(idx);
            resetSlideshow();
        });
    });

    document.getElementById('gallery-prev').addEventListener('click', () => {
        let newIdx = currentGalleryIndex - 1;
        if(newIdx < 0) newIdx = galleryImages.length - 1;
        setMainImage(newIdx);
        resetSlideshow();
    });

    document.getElementById('gallery-next').addEventListener('click', () => {
        let newIdx = currentGalleryIndex + 1;
        if(newIdx >= galleryImages.length) newIdx = 0;
        setMainImage(newIdx);
        resetSlideshow();
    });

    startSlideshow();
}

function setMainImage(index) {
    currentGalleryIndex = index;
    const mainImg = document.getElementById('detail-hero-img');
    
    // Add quick fade effect
    mainImg.style.opacity = 0;
    setTimeout(() => {
        mainImg.src = galleryImages[index];
        mainImg.style.opacity = 0.9;
    }, 200);

    // Highlight thumbnail
    document.querySelectorAll('.gallery-thumb').forEach((thumb, idx) => {
        if(idx === index) {
            thumb.classList.add('border-2', 'border-[#c5a059]', 'opacity-100');
            thumb.classList.remove('opacity-50');
            // Scroll thumb into view
            thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
            thumb.classList.remove('border-2', 'border-[#c5a059]', 'opacity-100');
            thumb.classList.add('opacity-50');
        }
    });
}

function startSlideshow() {
    if(galleryImages.length <= 1) return;
    slidesInterval = setInterval(() => {
        let newIdx = currentGalleryIndex + 1;
        if(newIdx >= galleryImages.length) newIdx = 0;
        setMainImage(newIdx);
    }, 4000);
}

function resetSlideshow() {
    clearInterval(slidesInterval);
    startSlideshow();
}
