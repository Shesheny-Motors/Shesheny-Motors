// js/contact.js

document.addEventListener('DOMContentLoaded', async () => {
    // Fetch Map settings
    if(window.DbCache && window.supabaseClient) {
        const {data: settings} = await window.DbCache.fetch('settings', () => window.supabaseClient.from('settings').select('*'));
        if(settings && settings.length > 0 && settings[0].map_embed) {
            const mapContainer = document.getElementById('map-container');
            if(mapContainer) {
                mapContainer.innerHTML = settings[0].map_embed;
            }
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
                firstName: form.firstName.value,
                lastName: form.lastName.value,
                email: form.email.value,
                phone: form.phone.value,
                inquiryType: form.inquiryType.value,
                message: form.message.value,
                created_at: new Date().toISOString()
            };

            if(window.supabaseClient) {
                const { error } = await window.supabaseClient.from('inquiries').insert([formData]);
                if(error) {
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
