import { memo, useMemo } from "react";
import cl from './.module.css';
import PropTypes from "prop-types";
import mapIcons from "../../utils/map-icons";
import { convertUtcToLocalTime, isInPast } from "../../utils/time";
import { useTimeZone } from "../../hooks/useTimeZone";
import { DEFAULT_DATE_TIME_FORMAT } from "../../utils/constants";
import { useTranslation } from "react-i18next";
import { Marker, Popup } from "react-leaflet";
import { useTheme } from "../../hooks/useTheme";

/**
 * Returns the appropriate icon for a marker based on its importance and start time.
 * @param {string} importance 
 * @param {string} startsAt 
 * @returns {import('leaflet').Icon | null} Icon for marker with specified importance and time of the start.
 */
function getImportanceIcon(importance, startsAt) {
    if (!['low', 'medium', 'high'].includes(importance)) return null;

    const prefix = isInPast(startsAt) ? 'past' : '';
    const capitalizedImp = importance.charAt(0).toUpperCase() + importance.slice(1);
    const iconKey = prefix
        ? `${prefix}${capitalizedImp}ImpMarkerIcon`
        : `${importance}ImpMarkerIcon`;

    return mapIcons[iconKey] || null;
};

const MapMarkerRenderer = memo(({
    newMarker,
    markers,
    editMarkerHandler,
    removeMarkerHandler,
    cancelNewMarkerHandler,
}) => {
    const { theme } = useTheme();
    const { timeZone } = useTimeZone();

    const { t, i18n } = useTranslation();

    const markerElements = useMemo(() => {
        const result = markers?.map(el => {
            const dateTimeLocal = convertUtcToLocalTime(el.startsAt, timeZone.name)
                .toLocaleString(i18n.language, DEFAULT_DATE_TIME_FORMAT);

            return (
                <Marker
                    key={el.id}
                    position={[el.latitude, el.longitude]}
                    icon={getImportanceIcon(el.importance, el.startsAt) || undefined}>
                    <Popup className="marker_popup">
                        <div className={`${cl.marker_popup} ${cl[theme]}`}>
                            <div className={cl.marker_popup__main}>
                                <h2 className={cl.marker_popup__title}>{el.title}</h2>
                                <p className={cl.marker_popup__description}>{el.description}</p>
                            </div>
                            <p className={`${cl.marker_popup__starts_at} ${isInPast(el.startsAt) ? cl.past : ''}`}>
                                {dateTimeLocal}
                            </p>
                            <div className={cl.marker_popup__actions}>
                                <button className={`${cl.marker_popup__edit_button} ${cl.marker_popup__button}`}
                                    onClick={() => editMarkerHandler(el)}>
                                    <img className={`${cl.marker_popup__edit_button__img} ${cl.marker_popup__button__img}`}
                                        alt="edit" />
                                </button>
                                <button className={`${cl.marker_popup__delete_button} ${cl.marker_popup__button}`}
                                    onClick={() => removeMarkerHandler(el)}>
                                    <img className={`${cl.marker_popup__delete_button__img} ${cl.marker_popup__button__img}`}
                                        alt="delete" />
                                </button>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            );
        }) || [];

        if (newMarker !== null) {
            return [...result, (
                <Marker
                    key='new'
                    position={[newMarker.latitude, newMarker.longitude]}
                    icon={mapIcons.newMarkerIcon}>
                    <Popup className="marker_popup">
                        <div className={`${cl.marker_popup} ${cl[theme]}`}>
                            <button className={`${cl.marker_popup__cancel_button}`}
                                onClick={cancelNewMarkerHandler}
                            >{t('components.map-marker-renderer.cancel-marker-editing')}</button>
                        </div>
                    </Popup>
                </Marker>
            )];
        }

        return result;
    }, [
        cancelNewMarkerHandler,
        editMarkerHandler,
        markers,
        removeMarkerHandler,
        newMarker,
        t,
        theme,
        timeZone.name,
        i18n.language,
    ]);

    return markerElements;
});

MapMarkerRenderer.displayName = 'MapMarkerRenderer';

MapMarkerRenderer.propTypes = {
    newMarker: PropTypes.object,
    markers: PropTypes.array,
    editMarkerHandler: PropTypes.func.isRequired,
    removeMarkerHandler: PropTypes.func.isRequired,
    cancelNewMarkerHandler: PropTypes.func.isRequired,
};

export default MapMarkerRenderer;
