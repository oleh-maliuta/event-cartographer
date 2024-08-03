import React from "react";
import PropTypes from "prop-types";
import { MapContainer, TileLayer } from "react-leaflet";
import MapEventHandler from "../MapEventHandler/MapEventHandler";

const Map = React.memo(React.forwardRef(({
    load,
    click,
    moveend,
    renderMarkers
}, ref) => {
    const startPosition = [50.4, 30.5];

    return (
        <MapContainer
            center={startPosition}
            zoom={12}
            style={{ position: 'fixed', width: '100%', height: '100%' }}
            ref={ref}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapEventHandler
                load={load}
                click={click}
                moveend={moveend} />
            {renderMarkers()}
        </MapContainer>
    );
}));

Map.propTypes = {
    renderMarkers: PropTypes.func.isRequired,
    load: PropTypes.func,
    click: PropTypes.func,
    moveend: PropTypes.func
};

export default Map;
