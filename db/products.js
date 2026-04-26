
const productsDb = {
    async getAll() {
        const cached = window.dbCache.get('products_all');
        if (cached) return cached;
        const { data, error } = await window.supabase
            .from('products')
            .select('*, brands(*)')
            .order('order_explore', { ascending: true });
        if (error) throw error;
        window.dbCache.set('products_all', data);
        return data;
    },

    async getSpotlight() {
        const cached = window.dbCache.get('products_spotlight');
        if (cached) return cached;
        const { data, error } = await window.supabase
            .from('products')
            .select('*, brands(*)')
            .eq('is_spotlight', true)
            .order('order_spotlight', { ascending: true });
        if (error) throw error;
        window.dbCache.set('products_spotlight', data);
        return data;
    },

    async getById(id) {
        const cacheKey = `products_id_${id}`;
        const cached = window.dbCache.get(cacheKey);
        if (cached) return cached;
        const { data, error } = await window.supabase
            .from('products')
            .select('*, brands(*)')
            .eq('id', id)
            .single();
        if (error) throw error;
        window.dbCache.set(cacheKey, data);
        return data;
    },

    async create(product) {
        const { data, error } = await window.supabase
            .from('products')
            .insert(product)
            .select()
            .single();
        if (error) throw error;
        window.dbCache.clear('products_all', 'products_spotlight');
        return data;
    },

    async update(id, product) {
        const { data, error } = await window.supabase
            .from('products')
            .update(product)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        window.dbCache.clear('products_all', 'products_spotlight', `products_id_${id}`);
        return data;
    },

    async delete(id) {
        const { error } = await window.supabase
            .from('products')
            .delete()
            .eq('id', id);
        if (error) throw error;
        window.dbCache.clear('products_all', 'products_spotlight', `products_id_${id}`);
    },

    async updateOrder(id, type, order) {
        const column = type === 'spotlight' ? 'order_spotlight' : 'order_explore';
        const { error } = await window.supabase
            .from('products')
            .update({ [column]: order })
            .eq('id', id);
        if (error) throw error;
        window.dbCache.clear('products_all', 'products_spotlight', `products_id_${id}`);
    }
};

window.productsDb = productsDb;
