import React from 'react';
import useEventStream from '../../useEventStream';

interface ReactJsonStreamProps<T> {
    url: string;
    onEvent: (event: T) => string|undefined;
    render: (stream: string) => React.ReactNode;
}

function ReactJsonStream<T>({ 
    url, 
    onEvent, 
    render 
}: ReactJsonStreamProps<T>) {
    const stream = useEventStream<T>(
        url, 
        onEvent
    )!;

    return render(stream);
}

export default ReactJsonStream;