const settingsDb = {
    async getAll() {
        const cached = window.dbCache ? window.dbCache.get('settings_all') : null;
        if (cached) return cached;

        const { data, error } = await window.supabase
            .from('settings')
            .select('*');
        if (error) throw error;

        const settings = {};
        data.forEach(item => {
            settings[item.key] = item.value;
        });
        
        if (window.dbCache) window.dbCache.set('settings_all', settings);
        return settings;
    },

    async update(key, value) {
        const { data, error } = await window.supabase
            .from('settings')
            .upsert({ key, value, updated_at: new Date().toISOString() })
            .select()
            .single();
        if (error) throw error;
        if (window.dbCache) window.dbCache.clear('settings_all');
        return data;
    },

    async updateMultiple(settingsArray) {
        const { data, error } = await window.supabase
            .from('settings')
            .upsert(settingsArray.map(item => ({
                ...item,
                updated_at: new Date().toISOString()
            })))
            .select();
        if (error) throw error;
        if (window.dbCache) window.dbCache.clear('settings_all');
        return data;
    }
};

window.settingsDb = settingsDb;
