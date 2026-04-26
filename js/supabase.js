// Mock Supabase SDK for Shesheny Motors
// The user will replace this with the actual Supabase client later

const mockInventory = [
    {
        id: 1,
        brand: 'Porsche',
        model: '911 Carrera 4S',
        year: 2022,
        miles: 4200,
        price_egp: 8500000,
        price_usd: 170000,
        color: 'Silver',
        condition: 'Used',
        hp: 443,
        acceleration: 3.4,
        is_spotlight: true,
        thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDr_96eUdJ2Qys0njzmaEwVxyVu67fSaszoDTwIWNhnEKkNrD9_lZ3KZk7MzSXwQYYZQnZZ3SlbWhV7l-8aENnyu3DA7t-Zo7Qk3WtgpNQKp3mbCu-pdnY44NWRMQF8nzs6skQkAaWMiQr6CtCsV9R46MuMhnEAsiOR5XNj1NWO_9YoYQYEQy1b1dIXhbP2hELifIxCcoUrawaNrEqvf1oIp43cTf2lShTALk0ORNP6X50P_B8a4F6BWc1fMkAE3va8pM5ppC_tTgAe',
        gallery: [
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDr_96eUdJ2Qys0njzmaEwVxyVu67fSaszoDTwIWNhnEKkNrD9_lZ3KZk7MzSXwQYYZQnZZ3SlbWhV7l-8aENnyu3DA7t-Zo7Qk3WtgpNQKp3mbCu-pdnY44NWRMQF8nzs6skQkAaWMiQr6CtCsV9R46MuMhnEAsiOR5XNj1NWO_9YoYQYEQy1b1dIXhbP2hELifIxCcoUrawaNrEqvf1oIp43cTf2lShTALk0ORNP6X50P_B8a4F6BWc1fMkAE3va8pM5ppC_tTgAe'
        ],
        video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    {
        id: 2,
        brand: 'McLaren',
        model: '720S',
        year: 2021,
        miles: 2100,
        price_egp: 12000000,
        price_usd: 240000,
        color: 'Grey',
        condition: 'Used',
        hp: 710,
        acceleration: 2.8,
        is_spotlight: true,
        thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwbL8NHZFCk1yct-OOxYgIcXSddloOEi1q7a5scdlVi6tyy9Hwh65IxHyFyd4gwdS3zn69BYYj0i0ad5V784_uIgaNRmpubXepPCPGGoCd47YrqpvzsmLfyo6Vyc9149wkNCFnisgOPHyQMeuRra19tHsU5DXTJcj3fozvma0FQdNztauZTigzK4v1Z18eGobNOGqaqYJoOyue0hmYMFym8e2t2o1StnhYlqyt2FHZsRbzQUhKFbL9biEXitOKgDJi6SYICuTRKP9f',
        gallery: [],
        video_url: null
    },
    {
        id: 3,
        brand: 'Ferrari',
        model: 'F8 Tributo',
        year: 2023,
        miles: 850,
        price_egp: 15000000,
        price_usd: 300000,
        color: 'Red',
        condition: 'New',
        hp: 710,
        acceleration: 2.9,
        is_spotlight: true,
        thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9s4Vct6fs1uwwvwJJu-ApxOgXFRkTUPnmWfzQvX7RZvxYT2EJ5utBP-iYbxHcDg0l96lXZz1Hxp8mPAJocXexIzWYTtFPqttWT_UlwoWBCLUx7yZLPpt2BMg0Ebdv8pd5eBjMTpB4kNehQQHER2_4LSNlGTdooIJM99P_C3jaEBVgnMd9nAYJIhqNw7AxLXNmMs21AUk23SEDbNmhUerOlHTB_uQIdaD75H-f9apQm-aFDS_Cro1pW9NG3xJuKV_W58sNR1Z2CcjC',
        gallery: [],
        video_url: null
    }
];

const mockSettings = {
    whatsapp_number: '+201000000000',
    call_number: '+201000000000',
    instagram: '#',
    facebook: '#',
    tiktok: '#',
    exchange_rate: 50.0, // 1 USD = 50 EGP
    active_event: 'none', // 'ramadan', 'coptic-christmas', 'police-day', 'none'
    hero_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDF_MybtEdEThKyz-oDXeUMJU2FbzVliP-rdTDwR95WX_xuH9WbkY0hxlCwpiEFtF3cmAmmmMvj4M6i7fU760Nts8uPuc2kCpxSI6PzjQv5bzY2blI3fM3pwLb221DWQOXDmjidr-loPYI637bD9rqcw940_20D6PlqqMiXEJ-3UJwbOwEtefUPKUCFWtUM08LwqOE7ZOFxZW6H6pZ3dMOD7T4QEzJ_ZPEmysTsfqzBAhwiUn7EKgmJ25faloIYIstHPJCYJYuqs2X0',
    map_embed: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110502.61185040645!2d31.1765851!3d30.0596113!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14583fa60b21beeb%3A0x79dfb296e8423bba!2sCairo%2C%20Cairo%20Governorate!5e0!3m2!1sen!2seg!4v1700000000000!5m2!1sen!2seg" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
};

const supabase = {
    from: (table) => {
        return {
            select: async (query) => {
                // Simulate network delay
                await new Promise(r => setTimeout(r, 500));
                
                if (table === 'vehicles') {
                    if (query === '*') return { data: mockInventory, error: null };
                    // Very basic mock filtering if needed
                    return { data: mockInventory, error: null };
                }
                if (table === 'settings') {
                    return { data: [mockSettings], error: null };
                }
                return { data: [], error: null };
            },
            insert: async (data) => {
                await new Promise(r => setTimeout(r, 500));
                return { data, error: null };
            },
            update: async (data) => {
                await new Promise(r => setTimeout(r, 500));
                return { data, error: null };
            },
            delete: async () => {
                await new Promise(r => setTimeout(r, 500));
                return { error: null };
            }
        }
    },
    auth: {
        signInWithPassword: async ({ email, password }) => {
            await new Promise(r => setTimeout(r, 500));
            if (email === 'admin@shesheny.com' && password === 'admin') {
                return { data: { user: { id: 1 } }, error: null };
            }
            return { data: null, error: { message: 'Invalid credentials' } };
        },
        signOut: async () => {
            await new Promise(r => setTimeout(r, 500));
            return { error: null };
        }
    }
};

window.supabaseClient = supabase;
