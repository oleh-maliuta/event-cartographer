import { useState, useRef, useEffect, useCallback } from "react";
import { Marker, Popup } from "react-leaflet";
import cl from './.module.css';
import mapIcons from "../../utils/map-icons";
import LoadingAnimation from '../../components/LoadingAnimation/LoadingAnimation';
import ascendingPng from '../../assets/sort-ascending.png';
import descendingPng from '../../assets/sort-descending.png';
import Map from "../../components/Map/Map";
import PageNavigator from "../../components/PageNavigator/PageNavigator";
import MarkerListElement from "../../components/MarkerListElement/MarkerListElement";
import { useTranslation } from "react-i18next";
import BlockMessage from "../../components/BlockMessage/BlockMessage";
import YesNoDialog from "../../components/YesNoDialog/YesNoDialog";
import { useTheme } from '../../hooks/useTheme';
import { DEFAULT_DATE_TIME_FORMAT } from "../../utils/constants";
import { convertLocalTimeToUtc, convertUtcToLocalTime, isTimeInPast } from "../../utils/time";
import { useTimeZone } from "../../hooks/useTimeZone";
import MapInterface from "../../components/MapInterface/MapInterface";

/**
 * Returns the appropriate icon for a marker based on its importance and start time.
 * @param {string} importance 
 * @param {string} startsAt 
 * @returns {import('leaflet').Icon | null} Icon for marker with specified importance and time of the start.
 */
function getImportanceIcon(importance, startsAt) {
    const isInPast = isTimeInPast(startsAt);
    switch (importance) {
        case 'low':
            return isInPast ? mapIcons.pastLowImpMarkerIcon : mapIcons.lowImpMarkerIcon;
        case 'medium':
            return isInPast ? mapIcons.pastMediumImpMarkerIcon : mapIcons.mediumImpMarkerIcon;
        case 'high':
            return isInPast ? mapIcons.pastHighImpMarkerIcon : mapIcons.highImpMarkerIcon;
        default:
            return null;
    }
};

const HomeLayout = () => {
    const { t } = useTranslation();

    const [editMarkerMessages, setEditMarkerMessages] = useState([]);
    const [markerListMessages, setMarkerListMessages] = useState([]);

    const [newMarker, setNewMarker] = useState(null);
    const [editingMarker, setEditingMarker] = useState(null);
    const [markerIdToRemove, setMarkerIdToRemove] = useState(null);
    const [markerListPage, setMarkerListPage] = useState(1);
    const [markerListPageCount, setMarkerListPageCount] = useState(0);
    const [mapBounds, setMapBounds] = useState(null);

    const [markersForMap, setMarkersForMap] = useState(null);
    const [markersForList, setMarkersForList] = useState(null);
    const [markerMenuMode, setMarkerMenuMode] = useState(null);
    const [isMarkerPanelOpen, setIsMarkerPanelOpen] = useState(false);
    const [isMarkerListFilterOpen, setIsMarkerListFilterOpen] = useState(false);

    const [loadingMarkersForMap, setLoadingMarkersForMap] = useState(false);
    const [loadingMarkersForList, setLoadingMarkersForList] = useState(false);
    const [updatingMarkerList, setUpdatingMarkerList] = useState(false);

    const [markerListSort, setMarkerListSort] = useState({ type: 'importance', asc: false });
    const [markerListImportanceFilter, setMarkerListImportanceFilter] = useState([]);
    const [markerListTimeOfStartFilter, setMarkerListTimeOfStartFilter] = useState({ min: undefined, max: undefined });

    const [isYesNoDialogOpen, setIsYesNoDialogOpen] = useState(false);

    const [markerSearchQuery, setMarkerSearchQuery] = useState('');

    const mapRef = useRef(null);

    const { theme } = useTheme();
    const { timeZone } = useTimeZone();

    const loadMarkersForList = useCallback(async (page) => {
        setLoadingMarkersForList(true);
        setMarkerListMessages([]);

        const url = new URL('/api/markers/search', window.location.origin);
        url.searchParams.append('page_size', '10');
        url.searchParams.append('page', page || '1');
        url.searchParams.append('q', markerSearchQuery);
        url.searchParams.append('sort_type', markerListSort.type);
        url.searchParams.append('sort_by_asc', markerListSort.asc);
        url.searchParams.append('min_time', markerListTimeOfStartFilter.min
            ? convertLocalTimeToUtc(markerListTimeOfStartFilter.min).toString() : '');
        url.searchParams.append('max_time', markerListTimeOfStartFilter.max
            ? convertLocalTimeToUtc(markerListTimeOfStartFilter.max).toString() : '');

        markerListImportanceFilter.forEach(el => {
            url.searchParams.append('imp', el);
        });

        const response = await fetch(url, {
            method: "GET",
            credentials: "include"
        });
        const json = await response.json();

        setMarkersForList(json.data.items || []);
        setMarkerListPage(page || 1);
        setMarkerListPageCount(json.data.pageCount || 0);
        setLoadingMarkersForList(false);
    }, [markerListTimeOfStartFilter.max, markerListTimeOfStartFilter.min, markerListImportanceFilter, markerListSort.asc, markerListSort.type, markerSearchQuery]);

    const loadMarkersForMap = useCallback(async (bounds) => {
        setLoadingMarkersForMap(true);

        let url = '/api/markers/map';
        url += `?n_e_lat=${bounds.getNorthEast().lat}`;
        url += `&n_e_long=${bounds.getNorthEast().lng}`;
        url += `&s_w_lat=${bounds.getSouthWest().lat}`;
        url += `&s_w_long=${bounds.getSouthWest().lng}`;

        const response = await fetch(url, {
            method: "GET",
            credentials: "include"
        });
        const json = await response.json();

        setMarkersForMap(json.data || []);

        setLoadingMarkersForMap(false);
    }, []);

    const navigateToMarker = useCallback((marker) => {
        mapRef.current.flyTo([marker.latitude, marker.longitude], 13);
    }, []);

    const editMarker = useCallback((marker) => {
        setMarkerMenuMode('edit');
        setEditingMarker(marker);
        setMarkerListMessages([]);
    }, []);

    const mapLoadEvent = useCallback((map) => {
        loadMarkersForMap(map.getBounds());
        setMapBounds(map.getBounds());
    }, [loadMarkersForMap]);

    const mapClickEvent = useCallback((e) => {
        setNewMarker({
            latitude: e.latlng.lat,
            longitude: e.latlng.lng
        });

        setMarkerMenuMode('add');
        setIsMarkerPanelOpen(true);
    }, []);

    const mapMoveendEvent = useCallback(() => {
        const bounds = mapRef.current?.getBounds();

        if (!bounds) {
            return;
        }

        loadMarkersForMap(bounds);
        setMapBounds(bounds);
    }, [loadMarkersForMap]);

    const onMarkerMenuToggle = useCallback(() => {
        if (!isMarkerPanelOpen && markerMenuMode === null) {
            setMarkerMenuMode('list');
        }
        setIsMarkerPanelOpen(p => !p);
    }, [isMarkerPanelOpen, markerMenuMode]);

    function renderMarkerList() {
        const displayMarkerList = () => {
            const result = [];

            markersForList?.forEach((el, idx) => {
                result.push(
                    <MarkerListElement
                        key={idx}
                        marker={el}
                        navigate={navigateToMarker}
                        edit={editMarker}
                        remove={prepareToRemoveMarker} />
                );
            });

            return result;
        }
        const dateTimeLocalMin = markerListTimeOfStartFilter.min ?
            convertUtcToLocalTime(markerListTimeOfStartFilter.min, timeZone.name)
                .toLocaleString('en-US', DEFAULT_DATE_TIME_FORMAT) : undefined;
        const dateTimeLocalMax = markerListTimeOfStartFilter.max ?
            convertUtcToLocalTime(markerListTimeOfStartFilter.max, timeZone.name)
                .toLocaleString('en-US', DEFAULT_DATE_TIME_FORMAT) : undefined;

        return (
            <>
                <div className={`${cl.marker_list_panel}`}>
                    <div className={cl.marker_list_panel__search}>
                        <input
                            className={`${cl.marker_list_search__input}`}
                            type='text'
                            placeholder={t('home.search-markers-input')}
                            value={markerSearchQuery}
                            onChange={(e) => setMarkerSearchQuery(e.target.value)} />
                        <button className={`${cl.marker_list__apply_button}`}
                            onClick={() => {
                                if (!loadingMarkersForList) {
                                    loadMarkersForList(1);
                                }
                            }}>
                            <img className={cl.marker_list__apply_button__img}
                                alt="search" />
                        </button>
                    </div>
                    <div className={`${cl.marker_list_sort_and_filter_cont}`}>
                        <span className={`${cl.marker_list_sort_label}`}>
                            {t('home.sorting-label')}
                        </span>
                        <select className={`${cl.marker_list_sort_input}`}
                            value={markerListSort.type}
                            onChange={(e) => {
                                setMarkerListSort(p => {
                                    let newP = { ...p };
                                    newP.type = e.target.value;
                                    return newP;
                                });
                            }}>
                            <option className={`${cl.marker_list_sort_input_option}`} value='importance'>
                                {t('home.sort-by-importance-value')}
                            </option>
                            <option className={`${cl.marker_list_sort_input_option}`} value='title'>
                                {t('home.sort-by-title-value')}
                            </option>
                            <option className={`${cl.marker_list_sort_input_option}`} value='startsAt'>
                                {t('home.sort-by-time-value')}
                            </option>
                        </select>
                        <button className={`${cl.marker_list_sort_direction_button}`}
                            onClick={() => {
                                setMarkerListSort(p => {
                                    let newP = { ...p };
                                    newP.asc = !newP.asc;
                                    return newP;
                                });
                            }}>
                            <img
                                className={`${cl.marker_list_sort_direction_button_img}`}
                                src={markerListSort.asc ? ascendingPng : descendingPng}
                                alt='sort direction' />
                        </button>
                        <button className={`${cl.marker_list_filter_button}`}
                            onClick={() => { setIsMarkerListFilterOpen(p => !p) }}>
                            <img className={`${cl.marker_list_filter_button_img}`} alt='filter' />
                        </button>
                    </div>
                    <div className={`${cl.marker_list_filter_panel_cont}`} style={{ height: isMarkerListFilterOpen ? 'fit-content' : '0px' }}>
                        <div className={`${cl.marker_list_filter_panel}`}>
                            <div className={`${cl.marker_list_filter_panel_importance_cont}`}>
                                <h3 className={cl.marker_list_filter_panel__section_header}>
                                    {t('home.importance-filter-title')}
                                </h3>
                                <div className={`${cl.marker_list_filter_panel_importance}`}>
                                    <div className={`${cl.marker_list_filter_panel_importance_checkbox_cont}`}>
                                        <input
                                            className={`${cl.marker_list_filter_panel_importance_checkbox_low} ${cl.marker_list_filter_panel_importance_checkbox}`}
                                            type='checkbox'
                                            checked={markerListImportanceFilter.includes('low')}
                                            onChange={() => {
                                                setMarkerListImportanceFilter(p => {
                                                    const impValue = 'low';
                                                    let newP = [...p];

                                                    if (newP.includes(impValue)) {
                                                        newP = newP.filter(el => el !== impValue);
                                                    } else {
                                                        newP.push(impValue);
                                                    }

                                                    return newP;
                                                });
                                            }} />
                                        <span
                                            className={`${cl.marker_list_filter_panel_importance_label_low} ${cl.marker_list_filter_panel_importance_label}`}
                                        >{t('home.low-importance-value')}</span>
                                    </div>
                                    <div className={`${cl.marker_list_filter_panel_importance_checkbox_cont}`}>
                                        <input
                                            className={`${cl.marker_list_filter_panel_importance_checkbox_medium} ${cl.marker_list_filter_panel_importance_checkbox}`}
                                            type='checkbox'
                                            checked={markerListImportanceFilter.includes('medium')}
                                            onChange={() => {
                                                setMarkerListImportanceFilter(p => {
                                                    const impValue = 'medium';
                                                    let newP = [...p];

                                                    if (newP.includes(impValue)) {
                                                        newP = newP.filter(el => el !== impValue);
                                                    } else {
                                                        newP.push(impValue);
                                                    }

                                                    return newP;
                                                });
                                            }} />
                                        <span
                                            className={`${cl.marker_list_filter_panel_importance_label_medium} ${cl.marker_list_filter_panel_importance_label}`}
                                        >{t('home.medium-importance-value')}</span>
                                    </div>
                                    <div className={`${cl.marker_list_filter_panel_importance_checkbox_cont}`}>
                                        <input
                                            className={`${cl.marker_list_filter_panel_importance_checkbox_high} ${cl.marker_list_filter_panel_importance_checkbox}`}
                                            type='checkbox'
                                            checked={markerListImportanceFilter.includes('high')}
                                            onChange={() => {
                                                setMarkerListImportanceFilter(p => {
                                                    const impValue = 'high';
                                                    let newP = [...p];

                                                    if (newP.includes(impValue)) {
                                                        newP = newP.filter(el => el !== impValue);
                                                    } else {
                                                        newP.push(impValue);
                                                    }

                                                    return newP;
                                                });
                                            }} />
                                        <span
                                            className={`${cl.marker_list_filter_panel_importance_label_high} ${cl.marker_list_filter_panel_importance_label}`}
                                        >{t('home.high-importance-value')}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={`${cl.marker_list_filter_panel_sep_line_cont}`}>
                                <div className={`${cl.marker_list_filter_panel_sep_line}`} />
                            </div>
                            <div className={`${cl.marker_list_filter_panel_starts_at_cont}`}>
                                <h3 className={cl.marker_list_filter_panel__section_header}>
                                    {t('home.time-of-the-start-filter-title')}
                                </h3>
                                <div className={`${cl.marker_list_filter_panel_starts_at}`}>
                                    <input
                                        className={`${cl.marker_list_filter_panel_starts_at_min} ${cl.marker_list_filter_panel_starts_at_input}`}
                                        type='datetime-local'
                                        value={dateTimeLocalMin}
                                        onChange={(e) => {
                                            setMarkerListTimeOfStartFilter(p => {
                                                const newP = { ...p };
                                                newP.min = e.target.value;
                                                return newP;
                                            });
                                        }} />
                                    <div className={`${cl.marker_list_filter_panel_starts_at_sep_line_cont}`}>
                                        <div className={`${cl.marker_list_filter_panel_starts_at_sep_line}`} />
                                    </div>
                                    <input
                                        className={`${cl.marker_list_filter_panel_starts_at_max} ${cl.marker_list_filter_panel_starts_at_input}`}
                                        type='datetime-local'
                                        value={dateTimeLocalMax}
                                        onChange={(e) => {
                                            setMarkerListTimeOfStartFilter(p => {
                                                const newP = { ...p };
                                                newP.max = e.target.value;
                                                return newP;
                                            });
                                        }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <BlockMessage
                    style={{ marginTop: '8px', width: 'calc(100% - 16px)' }}
                    state='error'
                    messages={markerListMessages} />
                {
                    loadingMarkersForList ?
                        <div className={`${cl.marker_list_loading}`}>
                            <LoadingAnimation size="50px" curveWidth="10px" />
                        </div>
                        :
                        <>
                            <div className={`${cl.marker_list}`}>
                                {displayMarkerList()}
                            </div>
                            <PageNavigator
                                currentPage={markerListPage}
                                pageCount={markerListPageCount}
                                loadData={loadMarkersForList} />
                        </>
                }
            </>
        );
    }

    function renderMenuForMarkerEditing() {
        const isForAdding = markerMenuMode === 'add';
        const marker = isForAdding ? newMarker : editingMarker;
        const setMarker = isForAdding ? setNewMarker : setEditingMarker;
        const dateTimeLocalValue = marker?.startsAt
            ? convertUtcToLocalTime(marker.startsAt, timeZone.name).toString() : '';

        return (
            <form onSubmit={(e) => {
                e.preventDefault();
                if (updatingMarkerList) return;
                if (isForAdding) { addMarkerRequest(); }
                else { editMarkerRequest(); }
            }}>
                <div className={`${cl.editing_marker_field} ${cl.editing_marker_latitude}`}>
                    <p className={`${cl.editing_marker_field_label} ${cl.editing_marker_latitude_label}`}>
                        {t('home.marker-edit-latitude-label')}
                    </p>
                    <input
                        className={`${cl.editing_marker_field_input} ${cl.editing_marker_latitude_input}`}
                        type='number'
                        value={marker?.latitude ?? ''}
                        required
                        onChange={(e) => setMarker(p => ({ ...p, latitude: e.target.value }))} />
                </div>
                <div className={`${cl.editing_marker_field} ${cl.editing_marker_longitude}`}>
                    <p className={`${cl.editing_marker_field_label} ${cl.editing_marker_longitude_label}`}>
                        {t('home.marker-edit-longitude-label')}
                    </p>
                    <input
                        className={`${cl.editing_marker_field_input} ${cl.editing_marker_longitude_input}`}
                        type='number'
                        value={marker?.longitude ?? ''}
                        required
                        onChange={(e) => setMarker(p => ({ ...p, longitude: e.target.value }))} />
                </div>
                <div className={`${cl.editing_marker_field} ${cl.editing_marker_starts_at}`}>
                    <p className={`${cl.editing_marker_field_label} ${cl.editing_marker_starts_at_label}`}>
                        {t('home.marker-edit-starts-at-label')}
                    </p>
                    <input
                        className={`${cl.editing_marker_field_input} ${cl.editing_marker_starts_at_input}`}
                        type='datetime-local'
                        value={dateTimeLocalValue}
                        step="60"
                        required
                        onChange={(e) => {
                            const utcValue = e.target.value ?
                                convertLocalTimeToUtc(e.target.value, timeZone.name) : null;
                            setMarker(p => ({ ...p, startsAt: utcValue?.toString() }));
                        }} />
                </div>
                <div className={`${cl.editing_marker_field} ${cl.editing_marker_importance}`}>
                    <p className={`${cl.editing_marker_field_label} ${cl.editing_marker_importance_label}`}>
                        {t('home.marker-edit-importance-label')}
                    </p>
                    <select
                        className={`${cl.editing_marker_field_input} ${cl.editing_marker_importance_input}`}
                        value={marker?.importance ?? ''}
                        required
                        onChange={(e) => setMarker(p => ({ ...p, importance: e.target.value }))}>
                        <option className={cl.editing_marker_importance_input__no_value} value=''>
                            {t('home.no-importance-value')}
                        </option>
                        <option className={cl.editing_marker_importance_input__high_value} value='high'>
                            {t('home.high-importance-value')}
                        </option>
                        <option className={cl.editing_marker_importance_input__medium_value} value='medium'>
                            {t('home.medium-importance-value')}
                        </option>
                        <option className={cl.editing_marker_importance_input__low_value} value='low'>
                            {t('home.low-importance-value')}
                        </option>
                    </select>
                </div>
                <div className={`${cl.editing_marker_field} ${cl.editing_marker_title}`}>
                    <p className={`${cl.editing_marker_field_label} ${cl.editing_marker_title_label}`}>
                        {t('home.marker-edit-title-label')}
                    </p>
                    <input
                        className={`${cl.editing_marker_field_input} ${cl.editing_marker_title_input}`}
                        type='text'
                        maxLength='100'
                        value={marker?.title ?? ''}
                        required
                        onChange={(e) => setMarker(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div className={`${cl.editing_marker_field} ${cl.editing_marker_description}`}>
                    <p className={`${cl.editing_marker_field_label} ${cl.editing_marker_description_label}`}>
                        {t('home.marker-edit-description-label')}
                    </p>
                    <textarea
                        className={`${cl.editing_marker_field_input} ${cl.editing_marker_description_input}`}
                        maxLength='5000'
                        value={marker?.description ?? ''}
                        onChange={(e) => setMarker(p => ({ ...p, description: e.target.value }))}
                    ></textarea>
                </div>
                <BlockMessage
                    style={{ marginTop: '8px', width: 'calc(100% - 22px)' }}
                    state='error'
                    messages={editMarkerMessages} />
                {
                    isForAdding ?
                        <div className={`${cl.editing_marker_buttons}`}>
                            <button className={`${cl.editing_marker_button} ${cl.editing_marker_cancel_button}`}
                                type="button"
                                onClick={() => {
                                    setNewMarker(null);
                                    setMarkerMenuMode('list');
                                    setEditMarkerMessages([]);
                                }}>
                                {t('home.cancel-marker-adding')}
                            </button>
                            <button className={`${cl.editing_marker_button} ${cl.editing_marker_add_button}`}
                                type="submit">
                                {
                                    updatingMarkerList ?
                                        <LoadingAnimation
                                            curveColor1="#FFFFFF"
                                            curveColor2="#00000000"
                                            size="15px"
                                            curveWidth="3px" />
                                        :
                                        <span>
                                            {t('home.add-marker')}
                                        </span>
                                }
                            </button>
                        </div>
                        :
                        <div className={`${cl.editing_marker_buttons}`}>
                            <button className={`${cl.editing_marker_button} ${cl.editing_marker_go_back_button}`}
                                type="button"
                                onClick={() => {
                                    setEditingMarker(null);
                                    setMarkerMenuMode('list');
                                    setEditMarkerMessages([]);
                                }}>
                                {t('home.go-to-the-list')}
                            </button>
                            <button className={`${cl.editing_marker_button} ${cl.editing_marker_edit_button}`}
                                type="submit">
                                {
                                    updatingMarkerList ?
                                        <LoadingAnimation
                                            curveColor1="#FFFFFF"
                                            curveColor2="#00000000"
                                            size="15px"
                                            curveWidth="3px" />
                                        :
                                        <span>
                                            {t('home.edit-marker')}
                                        </span>
                                }
                            </button>
                        </div>
                }
            </form>
        );
    }

    const renderMarkersOnMap = useCallback(() => {
        const result = [];

        if (newMarker !== null) {
            result.push(
                <Marker
                    key='new'
                    position={[newMarker.latitude, newMarker.longitude]}
                    icon={mapIcons.newMarkerIcon}>
                    <Popup className="marker_popup">
                        <button className={`${cl.marker_popup__cancel_button}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setNewMarker(null);
                                setMarkerMenuMode('list');
                                setEditMarkerMessages([]);
                            }}>{t('home.cancel-marker-adding')}</button>
                    </Popup>
                </Marker>
            );
        }

        markersForMap?.forEach(el => {
            const dateTimeLocal = convertUtcToLocalTime(el.startsAt, timeZone.name)
                .toLocaleString('en-US', DEFAULT_DATE_TIME_FORMAT);

            result.push(
                <Marker
                    key={el.id}
                    position={[el.latitude, el.longitude]}
                    icon={getImportanceIcon(el.importance, el.startsAt) || undefined}>
                    <Popup className="marker_popup">
                        <div className={cl.marker_popup__cont}>
                            <div className={cl.marker_popup__main}>
                                <h2 className={cl.marker_popup__title}>{el.title}</h2>
                                <p className={cl.marker_popup__description}>{el.description}</p>
                            </div>
                            <p className={`${cl.marker_popup__starts_at} ${isTimeInPast(el.startsAt) ? cl.past : ''}`}>
                                {dateTimeLocal}
                            </p>
                            <div className={cl.marker_popup__actions}>
                                <button className={`${cl.marker_popup__edit_button} ${cl.marker_popup__button}`}
                                    onClick={() => {
                                        setIsMarkerPanelOpen(true);
                                        editMarker(el);
                                    }}>
                                    <img className={`${cl.marker_popup__edit_button__img} ${cl.marker_popup__button__img}`}
                                        alt="edit" />
                                </button>
                                <button className={`${cl.marker_popup__delete_button} ${cl.marker_popup__button}`}
                                    onClick={() => { prepareToRemoveMarker(el); }}>
                                    <img className={`${cl.marker_popup__delete_button__img} ${cl.marker_popup__button__img}`}
                                        alt="delete" />
                                </button>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            );
        });

        return result;
    }, [newMarker, markersForMap, t, timeZone.name, editMarker]);

    async function addMarkerRequest() {
        setUpdatingMarkerList(true);

        const response = await fetch('/api/markers', {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                latitude: Number(newMarker.latitude) || null,
                longitude: Number(newMarker.longitude) || null,
                startsAt: newMarker.startsAt || null,
                importance: newMarker.importance || null,
                title: newMarker.title || null,
                description: newMarker.description || null
            })
        });
        const json = await response.json();

        if (response.ok) {
            loadMarkersForMap(mapBounds);
            loadMarkersForList(1);
            setMarkerMenuMode('list');
            setNewMarker(null);
            setEditMarkerMessages([]);
        } else if (!response.ok) {
            if (json.message) {
                setEditMarkerMessages([t(json.message)]);
            } else {
                const errors = [];

                for (const prop in json.errors) {
                    for (const err in json.errors[prop]) {
                        errors.push(t(json.errors[prop][err]));
                    }
                }

                setEditMarkerMessages(errors);
            }
        } else if (response.status >= 500 && response.status <= 599) {
            setEditMarkerMessages([t('general.server-error')]);
        }

        setUpdatingMarkerList(false);
    }

    async function editMarkerRequest() {
        setUpdatingMarkerList(true);

        const response = await fetch(`/api/markers/${editingMarker.id}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                latitude: Number(editingMarker.latitude) || null,
                longitude: Number(editingMarker.longitude) || null,
                startsAt: editingMarker.startsAt || null,
                importance: editingMarker.importance || null,
                title: editingMarker.title || null,
                description: editingMarker.description || null
            })
        });
        const json = await response.json();

        if (response.ok) {
            loadMarkersForMap(mapBounds);
            loadMarkersForList(1);
            setMarkerMenuMode('list');
            setEditingMarker(null);
            setEditMarkerMessages([]);
        } else if (!response.ok) {
            if (json.message) {
                setEditMarkerMessages([t(json.message)]);
            } else {
                const errors = [];

                for (const prop in json.errors) {
                    for (const err in json.errors[prop]) {
                        errors.push(t(json.errors[prop][err]));
                    }
                }

                setEditMarkerMessages(errors);
            }
        } else if (response.status >= 500 && response.status <= 599) {
            setEditMarkerMessages([t('general.server-error')]);
        }

        setUpdatingMarkerList(false);
    }

    async function removeMarkerRequest(markerId) {
        const response = await fetch(`/api/markers/${markerId}`, {
            method: "DELETE",
            credentials: "include"
        });
        const json = await response.json();

        if (response.ok) {
            setMarkersForMap(markersForList.filter(x => x.id !== markerId));
            loadMarkersForList(1);
        } else if (!response.ok) {
            if (json.message) {
                setMarkerListMessages([t(json.message)]);
            } else {
                const errors = [];

                for (const prop in json.errors) {
                    for (const err in json.errors[prop]) {
                        errors.push(t(json.errors[prop][err]));
                    }
                }

                setMarkerListMessages(errors);
            }
        } else if (response.status >= 500 && response.status <= 599) {
            setMarkerListMessages([t('general.server-error')]);
        }
    }

    function prepareToRemoveMarker(marker) {
        setMarkerIdToRemove(marker.id);
        setIsYesNoDialogOpen(true);
    }

    function removeMarker() {
        removeMarkerRequest(markerIdToRemove);
        setMarkerIdToRemove(null);
        setIsYesNoDialogOpen(false);
    }

    function cancelMarkerRemoving() {
        setMarkerIdToRemove(null);
        setIsYesNoDialogOpen(false);
    }

    useEffect(() => {
        const id = setTimeout(() => loadMarkersForList(1), 0);
        return () => clearTimeout(id);
    }, [loadMarkersForList]);

    useEffect(() => {
        const map = mapRef.current;
        if (map) {
            map.invalidateSize()
        }
    }, [isMarkerPanelOpen]);

    return (
        <div className={`${cl.main} ${cl[theme]} ${isMarkerPanelOpen ? '' : cl.hidden_menu}`}>
            <div className={`${cl.map_display}`}>
                <Map
                    load={mapLoadEvent}
                    click={mapClickEvent}
                    moveend={mapMoveendEvent}
                    renderMarkers={renderMarkersOnMap}
                    ref={mapRef}
                    containerClassName={isMarkerPanelOpen ? 'with_panel' : ''}
                />
                <MapInterface
                    isLoading={loadingMarkersForMap}
                    onMarkerMenuToggle={onMarkerMenuToggle}
                />
            </div>
            <div className={`${cl.marker_panel}`}>
                <button className={`${cl.marker_panel__marker_menu_button}`}
                    type="button"
                    onClick={() => {
                        if (!isMarkerPanelOpen && markerMenuMode === null) {
                            setMarkerMenuMode('list');
                        }
                        setIsMarkerPanelOpen(p => !p);
                    }}>
                    <img className={`${cl.marker_panel__marker_menu_button__img}`}
                        alt='marker menu' />
                </button>
                <div className={`${cl.marker_panel__top_menu}`}>
                    <button className={
                        `${cl.marker_panel__top_menu__option} 
                            ${newMarker === null ? cl.unavailable : ''} 
                            ${markerMenuMode === 'add' ? cl.current : ''}`}
                        type="button"
                        onClick={() => {
                            if (markerMenuMode === 'list') {
                                setMarkerListMessages([]);
                            }
                            if (newMarker) {
                                setMarkerMenuMode('add');
                            }
                        }}>
                        <img className={`${cl.marker_panel__top_menu__option_img} ${cl.new_marker_img}`}
                            alt="add" />
                    </button>
                    <button
                        className={
                            `${cl.marker_panel__top_menu__option} 
                            ${['list', 'edit'].includes(markerMenuMode) ? cl.current : ''}`}
                        type="button"
                        onClick={() => {
                            if (markerMenuMode === 'add') {
                                setEditMarkerMessages([]);
                            }
                            setMarkerMenuMode('list');
                        }}>
                        <img className={`${cl.marker_panel__top_menu__option_img} ${cl.marker_list_img}`}
                            alt="list" />
                    </button>
                </div>
                {isMarkerPanelOpen && markerMenuMode === 'list' ? renderMarkerList() : <></>}
                {isMarkerPanelOpen && ['add', 'edit'].includes(markerMenuMode) ? renderMenuForMarkerEditing() : <></>}
            </div>
            <YesNoDialog
                dialogState={isYesNoDialogOpen}
                title={t('home.remove-marker.dialog-title')}
                description={t('home.remove-marker.dialog-description')}
                onYesButtonClick={removeMarker}
                onNoButtonClick={cancelMarkerRemoving} />
        </div>
    );
};

export default HomeLayout;
