import { memo } from "react";
import "./.css";
import PropTypes from "prop-types";
import { latLng, latLngBounds } from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";
import { useTheme } from '../../hooks/useTheme';
import MapMarkerRenderer from "../MapMarkerRenderer/MapMarkerRenderer";
import MapEventHandler from "../MapEventHandler/MapEventHandler";

const initMapZoom = 2;
const initMapMaxBoundsViscosity = 1;
const initMapCenter = [35, 0];
const bounds = latLngBounds(
    latLng(-90, -180),
    latLng(90, 180)
);

const Map = memo(({
    newMarker,
    markers,
    editMarkerHandler,
    removeMarkerHandler,
    cancelNewMarkerHandler,
    loadMapEventHandler,
    clickMapEventHandler,
    moveEndMapEventHandler,
    ref,
}) => {
    const { theme } = useTheme();

    return (
        <div className={`map ${theme}`}>
            <MapContainer className="map_container"
                center={initMapCenter}
                zoom={initMapZoom}
                maxBounds={bounds}
                maxBoundsViscosity={initMapMaxBoundsViscosity}
                ref={ref}>
                <TileLayer className="map_tile_layer"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    noWrap={true} />
                <MapMarkerRenderer
                    newMarker={newMarker}
                    markers={markers}
                    editMarkerHandler={editMarkerHandler}
                    removeMarkerHandler={removeMarkerHandler}
                    cancelNewMarkerHandler={cancelNewMarkerHandler} />
                <MapEventHandler
                    load={loadMapEventHandler}
                    click={clickMapEventHandler}
                    moveend={moveEndMapEventHandler} />
            </MapContainer>
        </div>
    );
});

Map.displayName = 'Map';

Map.propTypes = {
    newMarker: PropTypes.object,
    markers: PropTypes.array,
    editMarkerHandler: PropTypes.func.isRequired,
    removeMarkerHandler: PropTypes.func.isRequired,
    cancelNewMarkerHandler: PropTypes.func.isRequired,
    loadMapEventHandler: PropTypes.func,
    clickMapEventHandler: PropTypes.func,
    moveEndMapEventHandler: PropTypes.func,
    ref: PropTypes.object,
};

export default Map;
