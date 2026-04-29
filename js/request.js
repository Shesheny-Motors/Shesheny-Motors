document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('request-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('req-submit-btn');
        const successMsg = document.getElementById('req-success');
        const errorMsg = document.getElementById('req-error');
        
        btn.disabled = true;
        btn.textContent = 'Submitting...';
        successMsg.classList.add('hidden');
        errorMsg.classList.add('hidden');

        const requestData = {
            name: document.getElementById('req-name').value,
            phone: document.getElementById('req-phone').value,
            email: document.getElementById('req-email').value,
            car: document.getElementById('req-car').value,
            budget: document.getElementById('req-budget').value,
            message: document.getElementById('req-message').value
        };

        if (window.supabaseClient) {
            const { error } = await window.supabaseClient
                .from('custom_requests')
                .insert([requestData]);

            if (error) {
                console.error('Request submission error:', error);
                errorMsg.classList.remove('hidden');
                btn.disabled = false;
                btn.textContent = 'Submit Request';
            } else {
                successMsg.classList.remove('hidden');
                form.reset();
                btn.textContent = 'Submitted';
            }
        } else {
            errorMsg.classList.remove('hidden');
            btn.disabled = false;
            btn.textContent = 'Submit Request';
        }
    });
});
