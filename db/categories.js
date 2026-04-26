const categoriesDb = {
    async getAll() {
        const { data, error } = await window.supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });
        if (error) throw error;
        return data;
    },

    async create(category) {
        const { data, error } = await window.supabase
            .from('categories')
            .insert(category)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async update(id, category) {
        const { data, error } = await window.supabase
            .from('categories')
            .update(category)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async delete(id) {
        const { error } = await window.supabase
            .from('categories')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};

window.categoriesDb = categoriesDb;
