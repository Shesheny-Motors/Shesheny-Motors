// js/admin.js

document.addEventListener('DOMContentLoaded', async () => {
    // Basic Auth Check
    const checkAuth = async () => {
        if(window.supabaseClient) {
            const { data: { session } } = await window.supabaseClient.auth.getSession();
            if(!session) window.location.href = 'admin.html';
        } else {
            if(!localStorage.getItem('admin_auth')) window.location.href = 'admin.html';
        }
    };
    await checkAuth();

    // Tab Switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('active', 'text-primary');
                b.classList.add('text-on-surface-variant');
            });
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            e.currentTarget.classList.add('active', 'text-primary');
            e.currentTarget.classList.remove('text-on-surface-variant');
            document.getElementById(e.currentTarget.getAttribute('data-target')).classList.add('active');
        });
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', async () => {
        if(window.supabaseClient) {
            await window.supabaseClient.auth.signOut();
        }
        localStorage.removeItem('admin_auth');
        window.location.href = 'admin.html';
    });

    // Load Data
    loadVehicles();
    loadSettings();
    loadInquiries();

    // Event Listeners for Forms
    document.getElementById('add-vehicle-form').addEventListener('submit', handleVehicleSubmit);
    document.getElementById('settings-form').addEventListener('submit', handleSettingsSubmit);
});

async function loadVehicles() {
    if(window.supabaseClient) {
        const { data } = await window.supabaseClient.from('vehicles').select('*').order('id', { ascending: false });
        const list = document.getElementById('admin-inventory-list');
        if(data && list) {
            list.innerHTML = data.map(v => `
                <div class="flex items-center justify-between p-4 bg-surface rounded border border-outline-variant/10">
                    <div class="flex items-center gap-4">
                        <img src="${v.thumbnail}" class="w-16 h-16 object-cover rounded">
                        <div>
                            <div class="font-medium">${v.brand} ${v.model} (${v.year})</div>
                            <div class="text-sm text-on-surface-variant">${v.price_egp.toLocaleString()} EGP</div>
                        </div>
                    </div>
                    <button onclick="deleteVehicle(${v.id})" class="text-red-400 hover:text-red-300">Delete</button>
                </div>
            `).join('');
        }
    }
}

async function loadSettings() {
    if(window.supabaseClient) {
        const { data } = await window.supabaseClient.from('settings').select('*');
        if(data && data.length > 0) {
            const s = data[0];
            document.getElementById('s-whatsapp').value = s.whatsapp_number || '';
            document.getElementById('s-call').value = s.call_number || '';
            document.getElementById('s-map').value = s.map_embed || '';
            document.getElementById('s-theme').value = s.event_theme || 'none';
        }
    }
}

async function loadInquiries() {
    if(window.supabaseClient) {
        const { data } = await window.supabaseClient.from('inquiries').select('*').order('created_at', { ascending: false });
        const tbody = document.getElementById('inquiries-tbody');
        if(data && tbody) {
            tbody.innerHTML = data.map(i => `
                <tr class="hover:bg-surface-container-highest transition-colors">
                    <td class="p-4">${new Date(i.created_at).toLocaleDateString()}</td>
                    <td class="p-4">${i.firstName} ${i.lastName}</td>
                    <td class="p-4 text-xs">${i.email}<br/>${i.phone}</td>
                    <td class="p-4 capitalize">${i.inquiryType}</td>
                    <td class="p-4 max-w-xs truncate">${i.message}</td>
                </tr>
            `).join('');
        }
    }
}

async function handleVehicleSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const ogText = btn.textContent;
    btn.textContent = 'Uploading...';
    btn.disabled = true;

    // Simulate upload (in real life, upload to supabase storage first)
    const newVehicle = {
        brand: document.getElementById('v-brand').value,
        model: document.getElementById('v-model').value,
        year: parseInt(document.getElementById('v-year').value),
        price_egp: parseInt(document.getElementById('v-price-egp').value),
        price_usd: parseInt(document.getElementById('v-price-usd').value),
        condition: document.getElementById('v-condition').value,
        color: document.getElementById('v-color').value,
        hp: document.getElementById('v-hp').value,
        acceleration: parseFloat(document.getElementById('v-accel').value),
        miles: parseInt(document.getElementById('v-miles').value),
        video_url: document.getElementById('v-video').value,
        thumbnail: 'https://via.placeholder.com/600x400.png?text=New+Vehicle', // Placeholder for now
        gallery: []
    };

    if(window.supabaseClient) {
        const { error } = await window.supabaseClient.from('vehicles').insert([newVehicle]);
        if(error) alert('Error adding vehicle');
        else {
            alert('Vehicle added successfully');
            e.target.reset();
            loadVehicles();
        }
    }

    btn.textContent = ogText;
    btn.disabled = false;
}

async function handleSettingsSubmit(e) {
    e.preventDefault();
    const updates = {
        whatsapp_number: document.getElementById('s-whatsapp').value,
        call_number: document.getElementById('s-call').value,
        map_embed: document.getElementById('s-map').value,
        event_theme: document.getElementById('s-theme').value
    };

    if(window.supabaseClient) {
        // Assuming settings table has only 1 row with id=1
        const { error } = await window.supabaseClient.from('settings').update(updates).eq('id', 1);
        if(error) alert('Error updating settings');
        else alert('Settings updated successfully. They will be reflected across the site immediately.');
    }
}

window.deleteVehicle = async (id) => {
    if(confirm('Are you sure you want to delete this vehicle?')) {
        if(window.supabaseClient) {
            const { error } = await window.supabaseClient.from('vehicles').delete().eq('id', id);
            if(error) alert('Error deleting vehicle');
            else loadVehicles();
        }
    }
};

// Admin Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('SW registered!', reg))
            .catch(err => console.log('SW registration failed', err));
    });
}

