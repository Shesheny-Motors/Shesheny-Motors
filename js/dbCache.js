// dbCache.js - Caches database queries in localStorage for 15 minutes

const CACHE_EXPIRATION_MS = 15 * 60 * 1000; // 15 minutes

class DbCache {
    /**
     * Fetch data with caching
     * @param {string} cacheKey - The unique key for this query
     * @param {Function} fetchFunction - The async function that fetches fresh data (returns {data, error})
     * @param {boolean} forceRefresh - If true, bypasses the cache
     */
    static async fetch(cacheKey, fetchFunction, forceRefresh = false) {
        if (!forceRefresh) {
            const cachedString = localStorage.getItem(`db_cache_${cacheKey}`);
            if (cachedString) {
                try {
                    const cachedData = JSON.parse(cachedString);
                    const now = new Date().getTime();
                    if (now - cachedData.timestamp < CACHE_EXPIRATION_MS) {
                        console.log(`[dbCache] Cache hit for ${cacheKey}`);
                        return { data: cachedData.data, error: null, cached: true };
                    }
                } catch (e) {
                    console.warn(`[dbCache] Failed to parse cache for ${cacheKey}`, e);
                }
            }
        }

        console.log(`[dbCache] Fetching fresh data for ${cacheKey}`);
        const { data, error } = await fetchFunction();
        
        if (!error && data) {
            const cacheObject = {
                data: data,
                timestamp: new Date().getTime()
            };
            try {
                localStorage.setItem(`db_cache_${cacheKey}`, JSON.stringify(cacheObject));
            } catch (e) {
                console.warn(`[dbCache] Failed to save cache for ${cacheKey} (possibly Quota Exceeded)`, e);
            }
        }

        return { data, error, cached: false };
    }

    static invalidate(cacheKey) {
        localStorage.removeItem(`db_cache_${cacheKey}`);
    }

    static clearAll() {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('db_cache_')) {
                localStorage.removeItem(key);
            }
        }
    }
}

window.DbCache = DbCache;
