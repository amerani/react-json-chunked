import { useSyncExternalStore, useEffect, useMemo } from 'react';
import { JsonEventStore } from './JsonEventStore';

function useJsonStream<P>(url: string) {
    const eventStore = useMemo(() => JsonEventStore<P>(url), [url]);

    useEffect(() => {
        (async () => {
            await eventStore.start();
        })();
    }, [eventStore]);

    const jsonStream = useSyncExternalStore(eventStore.subscribe, eventStore.getSnapshot);
    
    return jsonStream;
}

export default useJsonStream;