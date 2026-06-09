import { memo, useMemo, useState } from "react";
import cl from './.module.css';
import ascendingPng from '../../assets/sort-ascending.png';
import descendingPng from '../../assets/sort-descending.png';
import LoadingAnimation from '../LoadingAnimation/LoadingAnimation';
import PageNavigator from "../PageNavigator/PageNavigator";
import MarkersListElement from "../MarkerListElement/MarkerListElement";
import { useTranslation } from "react-i18next";
import BlockMessage from "../BlockMessage/BlockMessage";
import { useTheme } from '../../hooks/useTheme';
import { DEFAULT_DATE_TIME_FORMAT } from "../../utils/constants";
import { convertUtcToLocalTime } from "../../utils/time";
import { useTimeZone } from "../../hooks/useTimeZone";
import PropTypes from "prop-types";

const blockMessageStyle = { marginTop: '8px', width: 'calc(100% - 16px)' };

const MarkerListMenu = memo(({
    markers,
    loadingMarkers,
    markerSearchQuery,
    setMarkerSearchQuery,
    markerListSort,
    setMarkerListSort,
    markerListImportanceFilter,
    setMarkerListImportanceFilter,
    markerListTimeOfStartFilter,
    setMarkerListTimeOfStartFilter,
    markerListPageNavigationState,
    markerListMessageState,
    markersForListLoader,
    navigateToMarkerHandler,
    editMarkerHandler,
    removeMarkerHandler,

}) => {
    const [isMarkerListFilterOpen, setIsMarkerListFilterOpen] = useState(false);

    const { t } = useTranslation();

    const { theme } = useTheme();
    const { timeZone } = useTimeZone();

    const markerListElements = useMemo(() => {
        return markers?.map((el) => {
            return (
                <MarkersListElement
                    key={el.id}
                    marker={el}
                    navigate={navigateToMarkerHandler}
                    edit={editMarkerHandler}
                    remove={removeMarkerHandler} />
            );
        });
    }, [
        markers,
        editMarkerHandler,
        navigateToMarkerHandler,
        removeMarkerHandler
    ]);
    const dateTimeLocalMin = useMemo(() => markerListTimeOfStartFilter.min ?
        convertUtcToLocalTime(markerListTimeOfStartFilter.min, timeZone.name)
            .toLocaleString('en-US', DEFAULT_DATE_TIME_FORMAT) : undefined,
        [markerListTimeOfStartFilter.min, timeZone.name]);
    const dateTimeLocalMax = useMemo(() => markerListTimeOfStartFilter.max ?
        convertUtcToLocalTime(markerListTimeOfStartFilter.max, timeZone.name)
            .toLocaleString('en-US', DEFAULT_DATE_TIME_FORMAT) : undefined,
        [markerListTimeOfStartFilter.max, timeZone.name]);

    return (
        <div className={`${cl.marker_list_menu} ${cl[theme]}`}>
            <div className={`${cl.marker_list_panel}`}>
                <div className={cl.marker_list_panel__search}>
                    <input
                        className={`${cl.marker_list_search__input}`}
                        type='text'
                        placeholder={t('home.search-markers-input')}
                        value={markerSearchQuery}
                        onChange={(e) => setMarkerSearchQuery(e.target.value)} />
                    <button className={`${cl.marker_list__apply_button}`}
                        disabled={loadingMarkers}
                        onClick={() => markersForListLoader(1)}>
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
                style={blockMessageStyle}
                state={markerListMessageState} />
            {
                loadingMarkers ?
                    <div className={`${cl.marker_list_loading}`}>
                        <LoadingAnimation size="50px" curveWidth="10px" />
                    </div>
                    :
                    <>
                        <div className={`${cl.marker_list}`}>
                            {markerListElements}
                        </div>
                        <PageNavigator
                            state={markerListPageNavigationState}
                            loadData={markersForListLoader} />
                    </>
            }
        </div>
    );
});

MarkerListMenu.displayName = 'MarkerListMenu';

MarkerListMenu.propTypes = {
    markers: PropTypes.array.isRequired,
    loadingMarkers: PropTypes.bool.isRequired,
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
    markerListPageNavigationState: PropTypes.object.isRequired,
    markerListMessageState: PropTypes.object.isRequired,
    markersForListLoader: PropTypes.func.isRequired,
    navigateToMarkerHandler: PropTypes.func.isRequired,
    editMarkerHandler: PropTypes.func.isRequired,
    removeMarkerHandler: PropTypes.func.isRequired,
};

export default MarkerListMenu;