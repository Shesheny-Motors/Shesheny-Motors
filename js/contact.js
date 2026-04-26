// js/contact.js

document.addEventListener('DOMContentLoaded', async () => {
    // Fetch Map settings
    if(window.DbCache && window.supabaseClient) {
        const {data: settingsData} = await window.DbCache.fetch('settings', () => window.supabaseClient.from('settings').select('*'));
        if(settingsData && settingsData.length > 0) {
            const settings = settingsData.reduce((acc, row) => ({...acc, [row.key]: row.value}), {});
            const mapContainer = document.getElementById('map-container');
            if(mapContainer && settings.map_iframe_source) {
                mapContainer.innerHTML = `<iframe src="${settings.map_iframe_source}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`;
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
