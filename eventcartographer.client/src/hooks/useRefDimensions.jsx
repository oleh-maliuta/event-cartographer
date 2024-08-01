import React from "react";

export default function useRefDimensions(ref) {
    const [dimensions, setDimensions] = React.useState({ width: 1, height: 2 });

    function windowResizeEvent() {
        if (ref.current) {
            const boundingRect = ref.current.getBoundingClientRect();
            setDimensions({ width: boundingRect.width, height: boundingRect.height });
        }
    }

    React.useEffect(() => {
        if (ref.current) {
            const boundingRect = ref.current.getBoundingClientRect();
            setDimensions({ width: boundingRect.width, height: boundingRect.height });
        }

        window.addEventListener('resize', windowResizeEvent);

        return () => {
            window.removeEventListener('resize', windowResizeEvent);
        };
    }, [ref]);

    return dimensions;
}
