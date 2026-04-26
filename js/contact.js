// js/contact.js

document.addEventListener('DOMContentLoaded', async () => {
    // Fetch Map settings
    if(window.DbCache && window.supabaseClient) {
        const {data: settingsData} = await window.DbCache.fetch('settings', () => window.supabaseClient.from('settings').select('*'));
        if(settingsData && settingsData.length > 0) {
            const settings = settingsData.reduce((acc, row) => ({...acc, [row.key]: row.value}), {});
            
            // 1. Map Embed
            const mapContainer = document.getElementById('map-container');
            if(mapContainer && settings.map_iframe_source) {
                const mapInput = settings.map_iframe_source.trim();
                if (mapInput.startsWith('<iframe')) {
                    mapContainer.innerHTML = mapInput;
                    const iframe = mapContainer.querySelector('iframe');
                    if(iframe) {
                        iframe.style.width = '100%';
                        iframe.style.height = '100%';
                        iframe.style.border = '0';
                    }
                } else {
                    mapContainer.innerHTML = `<iframe src="${mapInput}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`;
                }
            }

            // 2. Dynamic Contact Info
            const phoneEl = document.querySelector('p[data-phone]'); // I'll add this data attribute
            if (phoneEl && settings.phone_number) {
                try {
                    const numbers = JSON.parse(settings.phone_number);
                    if(numbers.length > 0) phoneEl.textContent = numbers[0];
                } catch(e) { phoneEl.textContent = settings.phone_number; }
            }
        }
    }

    // Handle pre-filled vehicle context
    const params = new URLSearchParams(window.location.search);
    const vehicle = params.get('vehicle');
    if(vehicle) {
        const messageEl = document.getElementById('message');
        if(messageEl) {
            messageEl.value = `Hello, I'm interested in the ${vehicle}. Please provide more information.`;
        }
    }

    // Handle form submission
    const form = document.getElementById('contact-form');
    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'SENDING...';
            submitBtn.disabled = true;

            const formData = {
                name: `${form.firstName.value} ${form.lastName.value}`,
                email: form.email.value,
                phone: form.phone.value,
                subject: form.inquiryType.value,
                message: form.message.value
            };

            if(window.supabaseClient) {
                const { error } = await window.supabaseClient.from('messages').insert([formData]);
                if(error) {
                    console.error('Supabase error:', error);
                    alert('Error submitting inquiry. Please try again.');
                } else {
                    alert('Message sent successfully!');
                    form.reset();
                }
            } else {
                // Fallback if supabase isn't injected yet
                alert('Message simulated successfully!');
                form.reset();
            }

            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    }
});
