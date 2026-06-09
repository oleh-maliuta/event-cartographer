import { useState, useRef, useEffect, useCallback, useReducer } from "react";
import cl from './.module.css';
import Map from "../../components/Map/Map";
import { useTranslation } from "react-i18next";
import YesNoDialog from "../../components/YesNoDialog/YesNoDialog";
import { useTheme } from '../../hooks/useTheme';
import { MessageStates, SidebarMenuModes } from "../../utils/constants";
import { convertLocalTimeToUtc } from "../../utils/time";
import MapInterface from "../../components/MapInterface/MapInterface";
import { messageListReducer, messageListState } from "../../utils/reducers/messageListReducer";
import SidebarMenu from "../../components/SidebarMenu/SidebarMenu";
import { pageNavigationReducer, pageNavigationState } from "../../utils/reducers/pageNavigationReducer";

const HomeLayout = () => {
    const { t } = useTranslation();

    const [newMarker, setNewMarker] = useState(null);
    const [markerToEdit, setMarkerToEdit] = useState(null);
    const [markerIdToRemove, setMarkerIdToRemove] = useState(null);
    const [mapBounds, setMapBounds] = useState(null);

    const [markersForMap, setMarkersForMap] = useState(null);
    const [markersForList, setMarkersForList] = useState(null);
    const [sidebarMenuMode, setSidebarMenuMode] = useState(null);
    const [isSidebarMenuOpen, setIsSidebarMenuOpen] = useState(false);

    const [loadingMarkersForMap, setLoadingMarkersForMap] = useState(false);
    const [loadingMarkersForList, setLoadingMarkersForList] = useState(false);

    const [markerListSort, setMarkerListSort] = useState({ type: 'importance', asc: false });
    const [markerListImportanceFilter, setMarkerListImportanceFilter] = useState([]);
    const [markerListTimeOfStartFilter, setMarkerListTimeOfStartFilter] = useState({ min: undefined, max: undefined });

    const [isYesNoDialogOpen, setIsYesNoDialogOpen] = useState(false);

    const [markerSearchQuery, setMarkerSearchQuery] = useState('');

    const [markerListPageNavigationState, dispatchMarkerListPageNavigation] = useReducer(
        pageNavigationReducer,
        pageNavigationState(),
    );
    const [editMarkerFormMessageState, dispatchEditMarkerFormMessageState] = useReducer(
        messageListReducer,
        messageListState()
    );
    const [markerListMessageState, dispatchMarkerListMessageState] = useReducer(
        messageListReducer,
        messageListState()
    );

    const mapRef = useRef(null);

    const { theme } = useTheme();

    const loadMarkersForList = useCallback(async (page) => {
        setLoadingMarkersForList(true);
        dispatchMarkerListMessageState({ type: 'CLEAR_MESSAGES' });

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

        dispatchMarkerListPageNavigation({
            type: 'SET_PAGE_NUMBER_AND_COUNT',
            payload: { page: page || 1, count: json.data.pageCount || 0 },
        });
        setMarkersForList(json.data.items || []);
        setLoadingMarkersForList(false);
    }, [markerListTimeOfStartFilter.max, markerListTimeOfStartFilter.min, markerListImportanceFilter, markerListSort.asc, markerListSort.type, markerSearchQuery]);

    const loadMarkersForMap = useCallback(async (bounds) => {
        setLoadingMarkersForMap(true);

        const northEastCoords = bounds.getNorthEast();
        const southWestCoords = bounds.getSouthWest();
        const url = new URL('/api/markers/map', window.location.origin);
        url.searchParams.append('n_e_lat', northEastCoords.lat);
        url.searchParams.append('n_e_long', northEastCoords.lng);
        url.searchParams.append('s_w_lat', southWestCoords.lat);
        url.searchParams.append('s_w_long', southWestCoords.lng);

        const response = await fetch(url, {
            method: "GET",
            credentials: "include"
        });
        const json = await response.json();

        setMarkersForMap(json.data || []);
        setLoadingMarkersForMap(false);
    }, []);

    const navigateToMarkerHandler = useCallback((marker) => {
        mapRef.current.flyTo(
            [marker.latitude, marker.longitude],
            13, { duration: 2 }
        );
    }, []);

    const editMarkerHandler = useCallback((marker) => {
        setIsSidebarMenuOpen(true);
        setSidebarMenuMode(SidebarMenuModes.EDIT);
        setMarkerToEdit(marker);
        dispatchMarkerListMessageState({ type: 'CLEAR_MESSAGES' });
    }, []);

    const loadMapEventHandler = useCallback((map) => {
        loadMarkersForMap(map.getBounds());
        setMapBounds(map.getBounds());
    }, [loadMarkersForMap]);

    const clickMapEventHandler = useCallback((e) => {
        setNewMarker({
            latitude: e.latlng.lat,
            longitude: e.latlng.lng
        });

        setSidebarMenuMode(SidebarMenuModes.ADD);
        setIsSidebarMenuOpen(true);
    }, []);

    const moveEndMapEventHandler = useCallback(() => {
        const bounds = mapRef.current?.getBounds();

        if (!bounds) {
            return;
        }

        loadMarkersForMap(bounds);
        setMapBounds(bounds);
    }, [loadMarkersForMap]);

    const onMarkerMenuToggle = useCallback(() => {
        if (!isSidebarMenuOpen && sidebarMenuMode === null) {
            setSidebarMenuMode(SidebarMenuModes.LIST);
        }
        setIsSidebarMenuOpen(p => !p);
    }, [isSidebarMenuOpen, sidebarMenuMode]);

    const removeMarkerRequest = useCallback(async (markerId) => {
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
                dispatchMarkerListMessageState({
                    type: 'SET_MESSAGES',
                    payload: { mode: MessageStates.ERROR, list: [t(json.message)] }
                });
            } else {
                const errors = [];

                for (const prop in json.errors) {
                    for (const err in json.errors[prop]) {
                        errors.push(t(json.errors[prop][err]));
                    }
                }

                dispatchMarkerListMessageState({
                    type: 'SET_MESSAGES',
                    payload: { mode: MessageStates.ERROR, list: errors }
                });
            }
        } else if (response.status >= 500 && response.status <= 599) {
            dispatchMarkerListMessageState({
                type: 'SET_MESSAGES',
                payload: { mode: MessageStates.ERROR, list: [t('general.server-error')] }
            });
        }
    }, [loadMarkersForList, markersForList, t]);

    const prepareToRemoveMarkerHandler = useCallback((marker) => {
        setMarkerIdToRemove(marker.id);
        setIsYesNoDialogOpen(true);
    }, []);

    const removeMarker = useCallback(() => {
        removeMarkerRequest(markerIdToRemove);
        setMarkerIdToRemove(null);
        setIsYesNoDialogOpen(false);
    }, [markerIdToRemove, removeMarkerRequest]);

    const cancelNewMarkerHandler = useCallback((e) => {
        e.stopPropagation();
        setNewMarker(null);
        setSidebarMenuMode(SidebarMenuModes.LIST);
        dispatchEditMarkerFormMessageState({ type: 'CLEAR_MESSAGES' });
    }, []);

    const cancelMarkerRemoving = useCallback(() => {
        setMarkerIdToRemove(null);
        setIsYesNoDialogOpen(false);
    }, []);

    useEffect(() => {
        const id = setTimeout(() => loadMarkersForList(1), 0);
        return () => clearTimeout(id);
    }, [loadMarkersForList]);

    useEffect(() => {
        const map = mapRef.current;
        if (map) {
            map.invalidateSize()
        }
    }, [isSidebarMenuOpen]);

    return (
        <div className={`${cl.main} ${cl[theme]} ${isSidebarMenuOpen ? '' : cl.hidden_menu}`}>
            <div className={`${cl.map_display}`}>
                <Map
                    newMarker={newMarker}
                    markers={markersForMap}
                    editMarkerHandler={editMarkerHandler}
                    removeMarkerHandler={prepareToRemoveMarkerHandler}
                    cancelNewMarkerHandler={cancelNewMarkerHandler}
                    loadMapEventHandler={loadMapEventHandler}
                    clickMapEventHandler={clickMapEventHandler}
                    moveEndMapEventHandler={moveEndMapEventHandler}
                    ref={mapRef} />
                <MapInterface
                    isLoading={loadingMarkersForMap}
                    onMarkerMenuToggle={onMarkerMenuToggle} />
            </div>
            <SidebarMenu
                open={isSidebarMenuOpen}
                setOpen={setIsSidebarMenuOpen}
                mode={sidebarMenuMode}
                setMode={setSidebarMenuMode}
                loadingMarkers={loadingMarkersForList}
                markers={markersForList}
                newMarker={newMarker}
                setNewMarker={setNewMarker}
                markerToEdit={markerToEdit}
                setMarkerToEdit={setMarkerToEdit}
                markerSearchQuery={markerSearchQuery}
                setMarkerSearchQuery={setMarkerSearchQuery}
                markerListSort={markerListSort}
                setMarkerListSort={setMarkerListSort}
                markerListImportanceFilter={markerListImportanceFilter}
                setMarkerListImportanceFilter={setMarkerListImportanceFilter}
                markerListTimeOfStartFilter={markerListTimeOfStartFilter}
                setMarkerListTimeOfStartFilter={setMarkerListTimeOfStartFilter}
                mapBounds={mapBounds}
                markerListPageNavigationState={markerListPageNavigationState}
                markerListMessageState={markerListMessageState}
                dispatchMarkerListMessageState={dispatchMarkerListMessageState}
                editMarkerFormMessageState={editMarkerFormMessageState}
                dispatchEditMarkerFormMessageState={dispatchEditMarkerFormMessageState}
                markersForListLoader={loadMarkersForList}
                markersForMapLoader={loadMarkersForMap}
                navigateToMarkerHandler={navigateToMarkerHandler}
                editMarkerHandler={editMarkerHandler}
                removeMarkerHandler={prepareToRemoveMarkerHandler} />
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
