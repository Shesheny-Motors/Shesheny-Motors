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

        setupDepositModal();
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
    
    document.getElementById('spec-miles').textContent = currentVehicle.mileage || '-';
    document.getElementById('spec-trans').textContent = currentVehicle.transmission || '-';
    document.getElementById('spec-fuel').textContent = currentVehicle.fuel_type || '-';
    document.getElementById('spec-version').textContent = currentVehicle.version || '-';

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
    const inquireBtn = document.getElementById('btn-inquire');

    const vehicleName = `${currentVehicle.version} ${currentVehicle.name}`;
    const msg = encodeURIComponent(`Hello, I'm interested in the ${vehicleName}.`);
    
    if(whatsappBtn) whatsappBtn.href = `https://wa.me/${settings.whatsapp_number.replace(/\D/g,'')}?text=${msg}`;
    if(callBtn) callBtn.href = `tel:${settings.phone_number.replace(/\D/g,'')}`;
    if(inquireBtn) inquireBtn.href = `contact.html?vehicle=${encodeURIComponent(vehicleName)}`;
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
            // Removed scrollIntoView as it causes unexpected page scrolling
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

function setupDepositModal() {
    const btnDeposit = document.getElementById('btn-deposit');
    const modal = document.getElementById('deposit-modal');
    const closeBtn = document.getElementById('close-deposit');
    
    const step1 = document.getElementById('deposit-step-1');
    const step2 = document.getElementById('deposit-step-2');
    const btnAgree = document.getElementById('btn-agree-terms');
    
    const form = document.getElementById('deposit-form');
    const receiptInput = document.getElementById('dep-receipt');
    const fileNameDisplay = document.getElementById('dep-file-name');
    const btnSubmit = document.getElementById('btn-submit-deposit');

    if(!btnDeposit || !modal) return;

    // Check if car already has deposit
    if (currentVehicle.is_sold_out) {
        btnDeposit.textContent = "Sold Out";
        btnDeposit.classList.add("opacity-50", "cursor-not-allowed");
        btnDeposit.disabled = true;
    }

    btnDeposit.addEventListener('click', () => {
        if (currentVehicle.is_sold_out) return;
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        step1.classList.remove('hidden');
        step2.classList.add('hidden');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    });

    btnAgree.addEventListener('click', () => {
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
    });

    receiptInput.addEventListener('change', (e) => {
        if(e.target.files.length > 0) {
            fileNameDisplay.textContent = e.target.files[0].name;
            fileNameDisplay.classList.add('text-white');
            fileNameDisplay.classList.remove('text-stone-400');
        } else {
            fileNameDisplay.textContent = "Click or drag image here";
            fileNameDisplay.classList.add('text-stone-400');
            fileNameDisplay.classList.remove('text-white');
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('dep-name').value;
        const phone = document.getElementById('dep-phone').value;
        const email = document.getElementById('dep-email').value;
        const receipt = receiptInput.files[0];
        
        if(!receipt) {
            alert("Please upload a receipt.");
            return;
        }

        btnSubmit.disabled = true;
        btnSubmit.textContent = "Uploading...";

        try {
            // Upload receipt to Supabase Storage
            const fileExt = receipt.name.split('.').pop();
            const fileName = `receipt-${Date.now()}.${fileExt}`;
            const { data: uploadData, error: uploadError } = await window.supabaseClient.storage
                .from('vehicle-images')
                .upload(`deposits/${fileName}`, receipt);

            if(uploadError) throw uploadError;

            const receiptUrl = window.supabaseClient.storage
                .from('vehicle-images')
                .getPublicUrl(`deposits/${fileName}`).data.publicUrl;

            // Insert into deposits table
            const { error: insertError } = await window.supabaseClient.from('deposits').insert([
                {
                    car_id: currentVehicle.id,
                    name: name,
                    phone: phone,
                    email: email,
                    image_url: receiptUrl,
                    status: 'pending'
                }
            ]);

            if(insertError) throw insertError;

            // Also mark car as sold_out immediately to prevent others from making deposits
            // Assuming this is what we want (or maybe wait for approval). 
            // The prompt asks for an indicator. Let's just create the deposit for now.
            // "put an indecator for cars that have a deposit on them"
            
            // Mark it temporarily locally to give user feedback
            
            alert("Deposit submitted successfully! We will contact you shortly.");
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            
            // Add to local deposits for UI indicator
            let depositIds = JSON.parse(localStorage.getItem('deposits') || '[]');
            if(!depositIds.includes(currentVehicle.id)) {
                depositIds.push(currentVehicle.id);
                localStorage.setItem('deposits', JSON.stringify(depositIds));
            }

            // Re-fetch or update UI
            btnDeposit.textContent = "Deposit Pending";
            btnDeposit.classList.add("opacity-50", "cursor-not-allowed");
            btnDeposit.disabled = true;

        } catch (error) {
            console.error("Error submitting deposit:", error);
            alert("Failed to submit deposit. Please try again or contact support.");
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.textContent = "Submit Deposit";
        }
    });
}
