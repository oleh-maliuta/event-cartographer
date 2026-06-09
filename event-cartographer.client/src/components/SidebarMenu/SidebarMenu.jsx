import cl from './.module.css';
import { memo, useMemo } from 'react';
import { SidebarMenuModes } from '../../utils/constants';
import PropTypes from 'prop-types';
import EditMarkerForm from "../../components/EditMarkerForm/EditMarkerForm";
import MarkerListMenu from '../MarkerListMenu/MarkerListMenu';
import { useTheme } from '../../hooks/useTheme';

const SidebarMenu = memo(({
    open,
    setOpen,
    mode,
    setMode,
    loadingMarkers,
    markers,
    newMarker,
    setNewMarker,
    markerToEdit,
    setMarkerToEdit,
    markerSearchQuery,
    setMarkerSearchQuery,
    markerListSort,
    setMarkerListSort,
    markerListImportanceFilter,
    setMarkerListImportanceFilter,
    markerListTimeOfStartFilter,
    setMarkerListTimeOfStartFilter,
    mapBounds,
    markerListPageNavigationState,
    markerListMessageState,
    dispatchMarkerListMessageState,
    editMarkerFormMessageState,
    dispatchEditMarkerFormMessageState,
    markersForListLoader,
    markersForMapLoader,
    navigateToMarkerHandler,
    editMarkerHandler,
    removeMarkerHandler,
}) => {
    const { theme } = useTheme();

    const markerStateToHandle = useMemo(
        () => mode === 'add' ? newMarker : markerToEdit,
        [mode, newMarker, markerToEdit]);
    const markerStateSetterToHandle = useMemo(
        () => mode === 'add' ? setNewMarker : setMarkerToEdit,
        [mode, setMarkerToEdit, setNewMarker]);

    return (
        <div className={`${cl.sidebar_menu} ${cl[theme]} ${open ? '' : cl.hidden}`}>
            <button className={`${cl.sidebar_menu__marker_menu_button}`}
                type="button"
                onClick={() => {
                    if (!open && mode === null) {
                        setMode(SidebarMenuModes.LIST);
                    }
                    setOpen(p => !p);
                }}>
                <img className={`${cl.sidebar_menu__marker_menu_button__img}`}
                    alt='marker menu' />
            </button>
            <div className={`${cl.sidebar_menu__top_menu}`}>
                <button className={
                    `${cl.sidebar_menu__top_menu__option} 
                                    ${newMarker === null ? cl.unavailable : ''} 
                                    ${mode === SidebarMenuModes.ADD ? cl.current : ''}`}
                    type="button"
                    onClick={() => {
                        if (mode === SidebarMenuModes.LIST) {
                            dispatchMarkerListMessageState({ type: 'CLEAR_MESSAGES' });
                        }
                        if (newMarker) {
                            setMode(SidebarMenuModes.ADD);
                        }
                    }}>
                    <img className={`${cl.sidebar_menu__top_menu__option_img} ${cl.new_marker_img}`}
                        alt="add" />
                </button>
                <button
                    className={
                        `${cl.sidebar_menu__top_menu__option}
                        ${[SidebarMenuModes.LIST, SidebarMenuModes.EDIT].includes(mode) ? cl.current : ''}`}
                    type="button"
                    onClick={() => {
                        if (mode === SidebarMenuModes.ADD) {
                            dispatchEditMarkerFormMessageState({ type: 'CLEAR_MESSAGES' });
                        }
                        setMode(SidebarMenuModes.LIST);
                    }}>
                    <img className={`${cl.sidebar_menu__top_menu__option_img} ${cl.marker_list_img}`}
                        alt="list" />
                </button>
            </div>
            {
                open && mode === SidebarMenuModes.LIST
                    ? <MarkerListMenu
                        markers={markers}
                        loadingMarkers={loadingMarkers}
                        markerSearchQuery={markerSearchQuery}
                        setMarkerSearchQuery={setMarkerSearchQuery}
                        markerListSort={markerListSort}
                        setMarkerListSort={setMarkerListSort}
                        markerListImportanceFilter={markerListImportanceFilter}
                        setMarkerListImportanceFilter={setMarkerListImportanceFilter}
                        markerListTimeOfStartFilter={markerListTimeOfStartFilter}
                        setMarkerListTimeOfStartFilter={setMarkerListTimeOfStartFilter}
                        markerListPageNavigationState={markerListPageNavigationState}
                        markerListMessageState={markerListMessageState}
                        markersForListLoader={markersForListLoader}
                        navigateToMarkerHandler={navigateToMarkerHandler}
                        editMarkerHandler={editMarkerHandler}
                        removeMarkerHandler={removeMarkerHandler} /> : <></>
            }
            {
                open && [SidebarMenuModes.ADD, SidebarMenuModes.EDIT].includes(mode)
                    ? <EditMarkerForm
                        mode={mode}
                        setMode={setMode}
                        marker={markerStateToHandle}
                        setMarker={markerStateSetterToHandle}
                        messageState={editMarkerFormMessageState}
                        dispatchMessageState={dispatchEditMarkerFormMessageState}
                        onSuccess={() => {
                            markersForMapLoader(mapBounds);
                            markersForListLoader(1);
                        }} /> : <></>
            }
        </div>
    );
});

SidebarMenu.displayName = 'SidebarMenu';

SidebarMenu.propTypes = {
    open: PropTypes.bool.isRequired,
    setOpen: PropTypes.func.isRequired,
    mode: PropTypes.string.isRequired,
    setMode: PropTypes.func.isRequired,
    loadingMarkers: PropTypes.bool.isRequired,
    markers: PropTypes.array.isRequired,
    newMarker: PropTypes.object.isRequired,
    setNewMarker: PropTypes.func.isRequired,
    markerToEdit: PropTypes.object.isRequired,
    setMarkerToEdit: PropTypes.func.isRequired,
    markerSearchQuery: PropTypes.string.isRequired,
    setMarkerSearchQuery: PropTypes.func.isRequired,
    markerListSort: PropTypes.shape({
        type: PropTypes.string,
        asc: PropTypes.bool,
    }).isRequired,
    setMarkerListSort: PropTypes.func.isRequired,
    markerListImportanceFilter: PropTypes.arrayOf(PropTypes.string).isRequired,
    setMarkerListImportanceFilter: PropTypes.func.isRequired,
    markerListTimeOfStartFilter: PropTypes.shape({
        min: PropTypes.string,
        max: PropTypes.string,
    }).isRequired,
    setMarkerListTimeOfStartFilter: PropTypes.func.isRequired,
    mapBounds: PropTypes.object,
    markerListPageNavigationState: PropTypes.object.isRequired,
    markerListMessageState: PropTypes.object.isRequired,
    dispatchMarkerListMessageState: PropTypes.func.isRequired,
    editMarkerFormMessageState: PropTypes.object.isRequired,
    dispatchEditMarkerFormMessageState: PropTypes.func.isRequired,
    markersForListLoader: PropTypes.func.isRequired,
    markersForMapLoader: PropTypes.func.isRequired,
    navigateToMarkerHandler: PropTypes.func.isRequired,
    editMarkerHandler: PropTypes.func.isRequired,
    removeMarkerHandler: PropTypes.func.isRequired,
};

export default SidebarMenu;
