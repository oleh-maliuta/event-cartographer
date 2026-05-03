import React from "react";
import PropTypes from "prop-types";
import { useMap, useMapEvents } from "react-leaflet";

const MapEventHandler = React.memo(({
    load,
    click,
    moveend
}) => {
    const map = useMap();

    useMapEvents({
        click(e) {
            click(e);
        },
        moveend(e) {
            moveend(e);
        }
    })

    React.useEffect(() => {
        load(map);
    }, [load, map]);

    return null;
});

MapEventHandler.displayName = 'MapEventHandler';

MapEventHandler.propTypes = {
    load: PropTypes.func,
    click: PropTypes.func,
    moveend: PropTypes.func
};

export default MapEventHandler;
