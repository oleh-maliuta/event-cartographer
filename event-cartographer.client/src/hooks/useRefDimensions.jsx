import { useState, useEffect, useCallback } from "react";

export default function useRefDimensions(ref) {
    const [dimensions, setDimensions] = useState({ width: 1, height: 2 });

    const windowResizeEvent = useCallback(() => {
        if (ref.current) {
            const boundingRect = ref.current.getBoundingClientRect();
            setDimensions({ width: boundingRect.width, height: boundingRect.height });
        }
    }, [ref]);

    useEffect(() => {
        if (ref.current) {
            const boundingRect = ref.current.getBoundingClientRect();
            setDimensions({ width: boundingRect.width, height: boundingRect.height });
        }

        window.addEventListener('resize', windowResizeEvent);

        return () => {
            window.removeEventListener('resize', windowResizeEvent);
        };
    }, [ref, windowResizeEvent]);

    return dimensions;
}
