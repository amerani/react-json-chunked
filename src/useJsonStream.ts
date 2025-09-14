import { useSyncExternalStore, useEffect, useMemo } from 'react';
import { JsonEventStore } from './JsonEventStore';

function useJsonStream<P>(url: string, fetchOptions?: RequestInit) {
    const eventStore = useMemo(() => JsonEventStore<P>(url, fetchOptions || {}), [url]);

    useEffect(() => {
        (async () => {
            await eventStore.start();
        })();
    }, [eventStore]);

    const jsonStream = useSyncExternalStore(eventStore.subscribe, eventStore.getSnapshot);
    
    return jsonStream;
}

export default useJsonStream;