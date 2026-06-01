import { memo } from "react";
import "./.css";
import PropTypes from "prop-types";
import { latLng, latLngBounds } from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";
import MapEventHandler from "../MapEventHandler/MapEventHandler";
import { useTheme } from '../../hooks/useTheme';

const bounds = latLngBounds(
    latLng(-90, -180),
    latLng(90, 180)
);

const Map = memo(({
    load,
    click,
    moveend,
    renderMarkers,
    containerClassName,
    ref,
}) => {
    const { theme } = useTheme();

    return (
        <div className={`map_container ${theme} ${containerClassName || ''}`.trim()}>
            <MapContainer className="map"
                center={[35, 0]}
                zoom={2}
                maxBounds={bounds}
                maxBoundsViscosity={1}
                ref={ref}>
                <TileLayer className="map_tile_layer"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    noWrap={true} />
                <MapEventHandler
                    load={load}
                    click={click}
                    moveend={moveend} />
                {renderMarkers()}
            </MapContainer>
        </div>
    );
});

Map.propTypes = {
    renderMarkers: PropTypes.func.isRequired,
    load: PropTypes.func,
    click: PropTypes.func,
    moveend: PropTypes.func,
    containerClassName: PropTypes.string,
    ref: PropTypes.object,
};

export default Map;
