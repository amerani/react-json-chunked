import { useSyncExternalStore, useEffect, useMemo } from 'react';
import { JsonEventStore } from './JsonEventStore';

function useJsonStream<P>(url: string|URL|Request, fetchOptions?: RequestInit) {
    const eventStore = useMemo(() => JsonEventStore<P>(url, fetchOptions || {}), [url]);

    useEffect(() => {
        (async () => {
            try {
                await eventStore.start();
            } catch (error) {
                console.error(error);
            }
        })();
    }, [eventStore]);

    const jsonStream = useSyncExternalStore(eventStore.subscribe, eventStore.getSnapshot);
    
    return jsonStream;
}

export default useJsonStream;