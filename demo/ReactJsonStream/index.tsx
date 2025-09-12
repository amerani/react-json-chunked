import React from 'react';
import useEventStream from '../../useEventStream';

interface ReactJsonStreamProps<T> {
    url: string;
    render: (stream: T) => React.ReactNode;
}

function ReactJsonStream<T>({ 
    url, 
    render 
}: ReactJsonStreamProps<T>) {
    const stream = useEventStream<T>(
        url,        
    )!;

    return render(stream);
}

export default ReactJsonStream;