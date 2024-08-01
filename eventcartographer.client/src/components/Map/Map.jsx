import React from "react";
import PropTypes from "prop-types";
import { MapContainer, TileLayer } from "react-leaflet";

const Map = React.memo(React.forwardRef(({
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
            {renderMarkers()}
        </MapContainer>
    );
}));

Map.propTypes = {
    renderMarkers: PropTypes.func.isRequired
};

export default Map;
