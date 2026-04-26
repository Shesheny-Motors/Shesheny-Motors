const brandsDb = {
    async getAll() {
        const cached = window.dbCache ? window.dbCache.get('brands_all') : null;
        if (cached) return cached;
        
        const { data, error } = await window.supabase
            .from('brands')
            .select('*')
            .order('name', { ascending: true });
        if (error) throw error;
        
        if (window.dbCache) window.dbCache.set('brands_all', data);
        return data;
    },

    async create(brand) {
        const { data, error } = await window.supabase
            .from('brands')
            .insert(brand)
            .select()
            .single();
        if (error) throw error;
        if (window.dbCache) window.dbCache.clear('brands_all');
        return data;
    },

    async update(id, brand) {
        const { data, error } = await window.supabase
            .from('brands')
            .update(brand)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        if (window.dbCache) window.dbCache.clear('brands_all');
        return data;
    },

    async delete(id) {
        const { error } = await window.supabase
            .from('brands')
            .delete()
            .eq('id', id);
        if (error) throw error;
        if (window.dbCache) window.dbCache.clear('brands_all');
    }
};

window.brandsDb = brandsDb;
