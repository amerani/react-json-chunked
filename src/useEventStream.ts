import { useSyncExternalStore, useEffect, useMemo } from 'react';
import { EventStore } from './EventStore';

function useJsonStream<P>(url: string) {
    const eventStore = useMemo(() => EventStore<P>(url), [url]);

    useEffect(() => {
        eventStore.start();
    }, [eventStore]);

    const jsonStream = useSyncExternalStore(eventStore.subscribe, eventStore.getSnapshot);
    
    return jsonStream;
}

export default useJsonStream;