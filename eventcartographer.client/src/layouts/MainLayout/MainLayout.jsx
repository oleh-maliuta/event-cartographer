import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import cl from './.module.css';
import { API_PORT, CLIENT_PORT, HOST } from '../../constants';
import { newMarkerIcon, lowImpMarkerIcon, mediumImpMarkerIcon, highImpMarkerIcon } from "../../map-icons";
import LoadingAnimation from '../../components/LoadingAnimation/LoadingAnimation';
import ascendingPng from '../../assets/sort-ascending.png';
import descendingPng from '../../assets/sort-descending.png';

export default function MainLayout() {
    const startPosition = [50.4, 30.5];

    const [newMarker, setNewMarker] = React.useState(null);
    const [editingMarker, setEditingMarker] = React.useState(null);
    const [reviewingMarker, setReviewingMarker] = React.useState(null);

    const [userInfo, setUserInfo] = React.useState(null);
    const [markersForMap, setMarkersForMap] = React.useState(null);
    const [markersForList, setMarkersForList] = React.useState(null);
    const [currentMarkerMenu, setMarkerMenu] = React.useState(null);
    const [isMarkerPanelVisible, setMarkerPanelVisibility] = React.useState(false);
    const [isMarkerListFilterVisible, setMarkerListFilterVisibility] = React.useState(false);

    const [markersForListLoading, setMarkersForListLoading] = React.useState(false);

    const [markerListSearch, setMarkerListSearch] = React.useState('');
    const [markerListSort, setMarkerListSort] = React.useState({ type: 'importance', asc: true });
    const [markerListImportanceFilter, setMarkerListImportanceFilter] = React.useState([]);
    const [markerListDateOfStartFilter, setMarkerListDateOfStartFilter] = React.useState({ min: undefined, max: undefined });

    const mapRef = React.useRef(null);
    const latitudeInputRef = React.useRef(null);
    const longitudeInputRef = React.useRef(null);
    const startsAtInputRef = React.useRef(null);
    const importanceInputRef = React.useRef(null);
    const titleInputRef = React.useRef(null);
    const descriptionInputRef = React.useRef(null);

    function MapEventHandler() {
        const map = useMapEvents({
            click(e) {
                console.log()
                setNewMarker({
                    latitude: e.latlng.lat,
                    longitude: e.latlng.lng
                });

                setMarkerMenu('add');
                setMarkerPanelVisibility(true);
            },
        })

        return null;
    }

    function getImportanceIcon(importance) {
        switch (importance) {
            case 'low':
                return lowImpMarkerIcon;
            case 'medium':
                return mediumImpMarkerIcon;
            case 'high':
                return highImpMarkerIcon;
            default:
                return undefined;
        }
    }

    function getDateTimeLocalFormat(dateTime) {
        if (!dateTime) {
            return null;
        }

        const processedDateTime = new Date(dateTime);
        processedDateTime.setMinutes(processedDateTime.getMinutes() - processedDateTime.getTimezoneOffset());
        return processedDateTime.toISOString().slice(0, 19);
    }

    async function logOutRequest() {
        const response = await fetch(`${HOST}:${API_PORT}/api/users/logout`, {
            method: "GET",
            mode: "cors",
            credentials: "include"
        });
        const json = await response.json();

        if (response.ok) {
            window.location.href = `${HOST}:${CLIENT_PORT}/sign-in`;
        } else if (!response.ok) {
            if (json.message) {
                alert(json.message);
            } else {
                let errors = "";
                for (const prop in json.errors) {
                    for (const err in json.errors[prop]) {
                        errors += `${json.errors[prop][err]}\n`;
                    }
                }
                errors = errors.slice(0, -1);
                alert(errors);
            }
        } else if (response.status >= 500 && response.status <= 599) {
            alert("Server error.");
        }
    }

    async function loadUserInfo() {
        const response = await fetch(`${HOST}:${API_PORT}/api/users/self`, {
            method: "GET",
            mode: "cors",
            credentials: "include"
        });
        const json = await response.json();

        setUserInfo(json.data || undefined);
    }

    async function loadMarkersForMap() {
        const response = await fetch(`${HOST}:${API_PORT}/api/markers/search?format=short`, {
            method: "GET",
            mode: "cors",
            credentials: "include"
        });
        const json = await response.json();

        setMarkersForMap(json.data || []);
    }

    async function loadMarkersForList() {
        setMarkersForListLoading(true);

        let queryPar =
            `?q=${markerListSearch}` +
            `&sort_type=${markerListSort.type}` +
            `&sort_by_asc=${markerListSort.asc}` +
            `&min_time=${getDateTimeLocalFormat(markerListDateOfStartFilter.min) ?? ''}` +
            `&max_time=${getDateTimeLocalFormat(markerListDateOfStartFilter.max) ?? ''}`;

        markerListImportanceFilter.forEach(el => {
            queryPar += `&imp=${el}`
        });

        const response = await fetch(
            `${HOST}:${API_PORT}/api/markers/search${queryPar}`, {
            method: "GET",
            mode: "cors",
            credentials: "include"
        });
        const json = await response.json();

        setMarkersForList(json.data || []);
        setMarkersForListLoading(false);
    }

    function renderMarkersOnMap() {
        const result = [];

        if (newMarker !== null) {
            result.push(
                <Marker
                    key={'new'}
                    position={[newMarker.latitude, newMarker.longitude]}
                    icon={newMarkerIcon}>
                    <Popup>
                        <button className={`${cl.marker_popup_cancel_button}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setNewMarker(null);
                                setMarkerMenu('list');
                            }}>Cancel</button>
                    </Popup>
                </Marker>
            );
        }

        markersForMap?.forEach(el => {
            result.push(
                <Marker
                    key={el.id}
                    position={[el.latitude, el.longitude]}
                    icon={getImportanceIcon(el.importance)}
                    eventHandlers={{
                        click: async () => {
                            if (reviewingMarker?.id === el.id) {
                                return;
                            }

                            if (markersForList?.map(x => x.id).includes(el.id)) {
                                setReviewingMarker(markersForList.find(x => x.id === el.id));
                                return;
                            }

                            const response = await fetch(`${HOST}:${API_PORT}/api/markers/${el.id}`, {
                                method: "GET",
                                mode: "cors",
                                credentials: "include"
                            });
                            const json = await response.json();

                            setReviewingMarker(json.data || null);
                        }
                    }}>
                    <Popup>
                        {
                            reviewingMarker?.id !== el.id ?
                                <LoadingAnimation size="30px" curveWidth="10px" />
                                :
                                <div className={cl.marker_popup_cont}>
                                    <h2 className={cl.marker_popup_title}>{reviewingMarker.title}</h2>
                                    <p className={cl.marker_popup_description}>{reviewingMarker.description}</p>
                                    <p className={cl.marker_popup_starts_at}>{new Date(reviewingMarker.startsAt).toLocaleString()}</p>
                                </div>
                        }
                    </Popup>
                </Marker>
            );
        });

        return result;
    }

    function renderMarkerList() {
        const displayMarkerList = () => {
            const result = [];

            markersForList?.forEach((el, idx) => {
                result.push(
                    <div className={`${cl.marker_list_element}`} key={idx}>
                        <div className={`${cl.marker_list_element_importance} ${cl[el.importance]}`} />
                        <div className={`${cl.marker_list_element_buttons}`}>
                            <div className={`${cl.marker_list_element_navigate_button} ${cl.marker_list_element_button}`}
                                onClick={() => {
                                    mapRef.current.flyTo([el.latitude, el.longitude], 13);
                                }}>
                                <img className={`${cl.marker_list_element_navigate_button_img} ${cl.marker_list_element_button_img}`} alt="navigate" />
                            </div>
                            <div className={`${cl.marker_list_element_edit_button} ${cl.marker_list_element_button}`}
                                onClick={() => {
                                    setMarkerMenu('edit');
                                    setEditingMarker(el);
                                }}>
                                <img className={`${cl.marker_list_element_edit_button_img} ${cl.marker_list_element_button_img}`} alt="edit" />
                            </div>
                            <div className={`${cl.marker_list_element_delete_button} ${cl.marker_list_element_button}`}
                                onClick={async () => {
                                    const response = await fetch(`${HOST}:${API_PORT}/api/markers/${el.id}`, {
                                        method: "DELETE",
                                        mode: "cors",
                                        credentials: "include"
                                    });
                                    const json = await response.json();

                                    if (response.ok) {
                                        setMarkersForMap(markersForList.filter(x => x.id !== el.id));
                                        setMarkersForList(markersForList.filter(x => x.id !== el.id));
                                    } else if (!response.ok) {
                                        if (json.message) {
                                            alert(json.message);
                                        } else {
                                            let errors = "";
                                            for (const prop in json.errors) {
                                                for (const err in json.errors[prop]) {
                                                    errors += `${json.errors[prop][err]}\n`;
                                                }
                                            }
                                            errors = errors.slice(0, -1);
                                            alert(errors);
                                        }
                                    } else if (response.status >= 500 && response.status <= 599) {
                                        alert("Server error.");
                                    }
                                }}>
                                <img className={`${cl.marker_list_element_delete_button_img} ${cl.marker_list_element_button_img}`} alt="delete" />
                            </div>
                        </div>
                        <div className={`${cl.marker_list_element_title_cont}`}>
                            <h3 className={`${cl.marker_list_element_title}`}>{el.title}</h3>
                        </div>
                        <div className={`${cl.marker_list_element_description_cont}`}>
                            <p className={`${cl.marker_list_element_description}`}>{el.description}</p>
                        </div>
                        <div className={`${cl.marker_list_element_coordinates_cont}`}>
                            <span className={`${cl.marker_list_element_latitude}`}>lt: {el.latitude}</span>
                            <span className={`${cl.marker_list_element_longitude}`}>lg: {el.longitude}</span>
                        </div>
                        <div className={`${cl.marker_list_element_starts_at_cont}`}>
                            <span className={`${cl.marker_list_element_starts_at}`}>{new Date(el.startsAt).toLocaleString()}</span>
                        </div>
                    </div>
                );
            });

            return result;
        }

        return (
            <>
                <div className={`${cl.marker_list_panel}`}>
                    <input
                        className={`${cl.marker_list_search_input}`}
                        type='text'
                        placeholder='Search'
                        value={markerListSearch}
                        onChange={(e) => { setMarkerListSearch(e.target.value) }}
                    />
                    <div className={`${cl.marker_list_sort_and_filter_cont}`}>
                        <span className={`${cl.marker_list_sort_label}`}>Sort by:</span>
                        <select className={`${cl.marker_list_sort_input}`}
                            value={markerListSort.type}
                            onChange={(e) => {
                                setMarkerListSort(p => {
                                    let newP = { ...p };
                                    newP.type = e.target.value;
                                    return newP;
                                });
                            }}>
                            <option className={`${cl.marker_list_sort_input_option}`} value='importance'>importance</option>
                            <option className={`${cl.marker_list_sort_input_option}`} value='title'>title</option>
                            <option className={`${cl.marker_list_sort_input_option}`} value='startsAt'>date of start</option>
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
                                className={`${cl.marker_list_direction_button_img}`}
                                src={markerListSort.asc ? ascendingPng : descendingPng}
                                alt='sort direction' />
                        </button>
                        <button className={`${cl.marker_list_filter_button}`}
                            onClick={() => { setMarkerListFilterVisibility(p => !p) }}>
                            <img className={`${cl.marker_list_filter_button_img}`} alt='filter' />
                        </button>
                        <button className={`${cl.marker_list_apply_button}`}
                            onClick={loadMarkersForList}>
                            Apply
                        </button>
                    </div>
                    <div className={`${cl.marker_list_filter_panel_cont}`} style={{ height: isMarkerListFilterVisible ? 'fit-content' : '0px' }}>
                        <div className={`${cl.marker_list_filter_panel}`}>
                            <div className={`${cl.marker_list_filter_panel_importance_cont}`}>
                                <h3 className={`${cl.marker_list_filter_panel_importance_header}`}>Importance</h3>
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
                                        >Low</span>
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
                                        >Medium</span>
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
                                        >High</span>
                                    </div>
                                </div>
                            </div>
                            <div className={`${cl.marker_list_filter_panel_sep_line_cont}`}>
                                <div className={`${cl.marker_list_filter_panel_sep_line}`} />
                            </div>
                            <div className={`${cl.marker_list_filter_panel_starts_at_cont}`}>
                                <h3 className={`${cl.marker_list_filter_panel_starts_at_header}`}>Date of start</h3>
                                <div className={`${cl.marker_list_filter_panel_starts_at}`}>
                                    <input
                                        className={`${cl.marker_list_filter_panel_starts_at_min} ${cl.marker_list_filter_panel_starts_at_input}`}
                                        type='datetime-local'
                                        value={getDateTimeLocalFormat(markerListDateOfStartFilter.min) ?? ''}
                                        onChange={(e) => {
                                            setMarkerListDateOfStartFilter(p => {
                                                const newP = { ...p };
                                                newP.min = e.target.value;
                                                return newP;
                                            });
                                        }}
                                    />
                                    <div className={`${cl.marker_list_filter_panel_starts_at_sep_line_cont}`}>
                                        <div className={`${cl.marker_list_filter_panel_starts_at_sep_line}`} />
                                    </div>
                                    <input
                                        className={`${cl.marker_list_filter_panel_starts_at_max} ${cl.marker_list_filter_panel_starts_at_input}`}
                                        type='datetime-local'
                                        value={getDateTimeLocalFormat(markerListDateOfStartFilter.max) ?? ''}
                                        onChange={(e) => {
                                            setMarkerListDateOfStartFilter(p => {
                                                const newP = { ...p };
                                                newP.max = e.target.value;
                                                return newP;
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {
                    markersForListLoading ?
                        <div className={`${cl.marker_list_loading}`}>
                            <LoadingAnimation size="50px" curveWidth="10px" />
                        </div>
                        :
                        <div className={`${cl.marker_list}`}>
                            {displayMarkerList()}
                        </div>
                }
            </>
        );
    }

    function renderMenuForMarkerEditing() {
        const isForAdding = currentMarkerMenu === 'add';

        return (
            <>
                <div className={cl.editing_marker_coordinates}>
                    <div className={`${cl.editing_marker_coordinate} ${cl.editing_marker_latitude}`}>
                        <p className={`${cl.editing_marker_field_label} ${cl.editing_marker_latitude_label}`}>Latitude:</p>
                        <input
                            className={`${cl.editing_marker_field_input} ${cl.editing_marker_latitude_input}`}
                            value={isForAdding ? newMarker.latitude : editingMarker.latitude}
                            type='number'
                            ref={latitudeInputRef}
                            onChange={(e) => {
                                if (isForAdding) {
                                    setNewMarker(p => {
                                        let newP = { ...p };
                                        newP.latitude = e.target.value;
                                        return newP;
                                    });
                                } else {
                                    setEditingMarker(p => {
                                        let newP = { ...p };
                                        newP.latitude = e.target.value;
                                        return newP;
                                    });
                                }
                            }}
                        />
                    </div>
                    <div className={`${cl.editing_marker_coordinate} ${cl.editing_marker_longitude}`}>
                        <p className={`${cl.editing_marker_field_label} ${cl.editing_marker_longitude_label}`}>Longitude:</p>
                        <input
                            className={`${cl.editing_marker_field_input} ${cl.editing_marker_longitude_input}`}
                            value={isForAdding ? newMarker.longitude : editingMarker.longitude}
                            type='number'
                            ref={longitudeInputRef}
                            onChange={(e) => {
                                if (isForAdding) {
                                    setNewMarker(p => {
                                        let newP = { ...p };
                                        newP.longitude = e.target.value;
                                        return newP;
                                    });
                                } else {
                                    setEditingMarker(p => {
                                        let newP = { ...p };
                                        newP.longitude = e.target.value;
                                        return newP;
                                    });
                                }
                            }}
                        />
                    </div>
                </div>
                <div className={cl.editing_marker_time_and_importance}>
                    <div className={`${cl.editing_marker_starts_at}`}>
                        <p className={`${cl.editing_marker_field_label} ${cl.editing_marker_starts_at_label}}`}>Starts at:</p>
                        <input
                            className={`${cl.editing_marker_field_input} ${cl.editing_marker_starts_at_input}`}
                            type='datetime-local'
                            defaultValue={isForAdding ? undefined : getDateTimeLocalFormat(editingMarker.startsAt)}
                            ref={startsAtInputRef} />
                    </div>
                    <div className={`${cl.editing_marker_importance}`}>
                        <p className={`${cl.editing_marker_field_label} ${cl.editing_marker_importance_label}`}>Importance:</p>
                        <select
                            className={`${cl.editing_marker_field_input} ${cl.editing_marker_importance_input}`}
                            defaultValue={isForAdding ? undefined : editingMarker.importance}
                            ref={importanceInputRef}>
                            <option className={cl.editing_marker_importance_input__low_value} value='low'>Low</option>
                            <option className={cl.editing_marker_importance_input__medium_value} value='medium'>Medium</option>
                            <option className={cl.editing_marker_importance_input__high_value} value='high'>High</option>
                        </select>
                    </div>
                </div>
                <div className={`${cl.editing_marker_title}`}>
                    <p className={`${cl.editing_marker_field_label} ${cl.editing_marker_title_label}}`}>Title:</p>
                    <input
                        className={`${cl.editing_marker_field_input} ${cl.editing_marker_title_input}`}
                        type='text'
                        maxLength='100'
                        defaultValue={isForAdding ? undefined : editingMarker.title}
                        ref={titleInputRef} />
                </div>
                <div className={`${cl.editing_marker_description}`}>
                    <p className={`${cl.editing_marker_field_label} ${cl.editing_marker_description_label}}`}>Description:</p>
                    <textarea
                        className={`${cl.editing_marker_field_input} ${cl.editing_marker_description_input}`}
                        maxLength='5000'
                        defaultValue={isForAdding ? undefined : editingMarker.description}
                        ref={descriptionInputRef}></textarea>
                </div>
                {
                    isForAdding ?
                        <div className={`${cl.editing_marker_buttons}`}>
                            <button className={`${cl.editing_marker_button} ${cl.editing_marker_cancel_button}`}
                                onClick={() => {
                                    setNewMarker(null);
                                    setMarkerMenu('list');
                                }}>Cancel</button>
                            <button className={`${cl.editing_marker_button} ${cl.editing_marker_add_button}`}
                                onClick={async () => {
                                    const response = await fetch(`${HOST}:${API_PORT}/api/markers`, {
                                        method: "POST",
                                        mode: "cors",
                                        credentials: "include",
                                        headers: {
                                            "Content-Type": "application/json"
                                        },
                                        body: JSON.stringify({
                                            latitude: Number(latitudeInputRef.current.value) || null,
                                            longitude: Number(longitudeInputRef.current.value) || null,
                                            startsAt: new Date(startsAtInputRef.current.value) || null,
                                            importance: importanceInputRef.current.value || null,
                                            title: titleInputRef.current.value || null,
                                            description: descriptionInputRef.current.value || null
                                        })
                                    });
                                    const json = await response.json();

                                    if (response.ok) {
                                        const newMapMarker = {
                                            id: json.data.id,
                                            importance: json.data.importance,
                                            latitude: json.data.latitude,
                                            longitude: json.data.longitude
                                        };

                                        setMarkersForMap([...markersForMap, newMapMarker]);
                                        setMarkersForList([...markersForList, json.data]);
                                        setMarkerMenu('list');
                                    } else if (!response.ok) {
                                        if (json.message) {
                                            alert(json.message);
                                        } else {
                                            let errors = "";
                                            for (const prop in json.errors) {
                                                for (const err in json.errors[prop]) {
                                                    errors += `${json.errors[prop][err]}\n`;
                                                }
                                            }
                                            errors = errors.slice(0, -1);
                                            alert(errors);
                                        }
                                    } else if (response.status >= 500 && response.status <= 599) {
                                        alert("Server error.");
                                    }
                                }}>Add</button>
                        </div>
                        :
                        <div className={`${cl.editing_marker_buttons}`}>
                            <button className={`${cl.editing_marker_button} ${cl.editing_marker_go_back_button}`}
                                onClick={() => {
                                    setEditingMarker(null);
                                    setMarkerMenu('list');
                                }}>Go back to list</button>
                            <button className={`${cl.editing_marker_button} ${cl.editing_marker_edit_button}`}
                                onClick={async () => {
                                    const response = await fetch(`${HOST}:${API_PORT}/api/markers/${editingMarker.id}`, {
                                        method: "PUT",
                                        mode: "cors",
                                        credentials: "include",
                                        headers: {
                                            "Content-Type": "application/json"
                                        },
                                        body: JSON.stringify({
                                            latitude: Number(latitudeInputRef.current.value) || null,
                                            longitude: Number(longitudeInputRef.current.value) || null,
                                            startsAt: new Date(startsAtInputRef.current.value) || null,
                                            importance: importanceInputRef.current.value || null,
                                            title: titleInputRef.current.value || null,
                                            description: descriptionInputRef.current.value || null
                                        })
                                    });
                                    const json = await response.json();

                                    if (response.ok) {
                                        const newList = markersForList.map((el) => {
                                            if (el.id === json.data.id) {
                                                return json.data;
                                            }

                                            return el;
                                        });

                                        setMarkersForMap(newList);
                                        setMarkersForList(newList);
                                        setMarkerMenu('list');
                                    } else if (!response.ok) {
                                        if (json.message) {
                                            alert(json.message);
                                        } else {
                                            let errors = "";
                                            for (const prop in json.errors) {
                                                for (const err in json.errors[prop]) {
                                                    errors += `${json.errors[prop][err]}\n`;
                                                }
                                            }
                                            errors = errors.slice(0, -1);
                                            alert(errors);
                                        }
                                    } else if (response.status >= 500 && response.status <= 599) {
                                        alert("Server error.");
                                    }
                                }}>Edit</button>
                        </div>
                }
            </>
        );
    }

    React.useEffect(() => {
        if (userInfo === null) {
            loadUserInfo();
        }

        if (markersForMap === null) {
            loadMarkersForMap();
        }

        if (markersForList === null) {
            loadMarkersForList();
        }
    });

    return (
        <div className={cl.main}>
            <MapContainer
                center={startPosition}
                zoom={12}
                style={{ position: 'fixed', width: '100%', height: '100%' }}
                ref={mapRef}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapEventHandler />
                {renderMarkersOnMap()}
            </MapContainer>
            <div className={`${cl.marker_panel} ${isMarkerPanelVisible ? '' : cl.hided}`}>
                <div className={`${cl.marker_panel__top_menu}`}>
                    <div
                        className={
                            `${cl.marker_panel__top_menu__option} 
                            ${newMarker === null ? cl.unavailable : ''} 
                            ${currentMarkerMenu === 'add' ? cl.current : ''}`}
                        onClick={() => {
                            if (newMarker) {
                                setMarkerMenu('add');
                            }
                        }}>
                        <img className={`${cl.marker_panel__top_menu__option_img} ${cl.new_marker_img}`} alt="add" />
                    </div>
                    <div
                        className={
                            `${cl.marker_panel__top_menu__option} 
                            ${currentMarkerMenu === 'list' || currentMarkerMenu === 'edit' ? cl.current : ''}`}
                        onClick={() => setMarkerMenu('list')}>
                        <img className={`${cl.marker_panel__top_menu__option_img} ${cl.marker_list_img}`} />
                    </div>
                </div>
                {isMarkerPanelVisible && currentMarkerMenu === 'list' ? renderMarkerList() : <></>}
                {isMarkerPanelVisible && ['add', 'edit'].includes(currentMarkerMenu) ? renderMenuForMarkerEditing() : <></>}
            </div>
            <div className={`${cl.right_side_menu} ${isMarkerPanelVisible ? '' : cl.hided}`}>
                <div className={`${cl.right_side_menu__user_name__cont}`}>
                    <span className={`${cl.right_side_menu__user_name}`}>{userInfo?.name}</span>
                </div>
                <button
                    className={`${cl.right_side_menu__marker_menu_button}`}
                    onClick={() => {
                        if (!isMarkerPanelVisible && currentMarkerMenu === null) {
                            setMarkerMenu('list');
                        }
                        setMarkerPanelVisibility(p => !p);
                    }}>
                    <img className={`${cl.right_side_menu__marker_menu_button__img}`} alt='marker menu' />
                </button>
                <button className={`${cl.right_side_menu__settings_button}`}
                    onClick={() => window.location.href = `${HOST}:${CLIENT_PORT}/settings`}>
                    <img
                        className={`${cl.right_side_menu__settings_button__img}`}
                        alt='log out' />
                </button>
                <button className={`${cl.right_side_menu__log_out_button}`} onClick={logOutRequest}>
                    <img
                        className={`${cl.right_side_menu__log_out_button__img}`}
                        alt='log out' />
                </button>
            </div>
        </div>
    );
}