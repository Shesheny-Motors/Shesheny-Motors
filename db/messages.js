const messagesDb = {
    async getAll() {
        const { data, error } = await window.supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async create(message) {
        const { data, error } = await window.supabase
            .from('messages')
            .insert(message);
        if (error) throw error;
        return data;
    },

    async markAsRead(id) {
        const { data, error } = await window.supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async delete(id) {
        const { error } = await window.supabase
            .from('messages')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};

window.messagesDb = messagesDb;
