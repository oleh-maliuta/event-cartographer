import React from "react";

export default function useRefDimensions(ref) {
    const [dimensions, setDimensions] = React.useState({ width: 1, height: 2 });

    const windowResizeEvent = React.useCallback(() => {
        if (ref.current) {
            const boundingRect = ref.current.getBoundingClientRect();
            setDimensions({ width: boundingRect.width, height: boundingRect.height });
        }
    }, [ref]);

    React.useEffect(() => {
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
