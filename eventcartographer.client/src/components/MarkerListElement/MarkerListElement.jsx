import React from "react";
import cl from "./.module.css";
import PropTypes from "prop-types";
import useTheme from '../../hooks/useTheme';

const MarkerListElement = React.memo(({
    marker,
    navigate,
    edit,
    remove
}) => {
    const theme = useTheme();

    return (
        <div className={`${cl.marker_list_element} ${cl[theme.ls ?? theme.cs]}`}
            key={marker.id}>
            <div className={`${cl.marker_list_element_importance} ${cl[marker.importance]}`} />
            <div className={`${cl.marker_list_element_buttons}`}>
                <button className={`${cl.marker_list_element_navigate_button} ${cl.marker_list_element_button}`}
                    onClick={() => {
                        navigate(marker);
                    }}>
                    <img className={`${cl.marker_list_element_navigate_button_img} ${cl.marker_list_element_button_img}`}
                        alt="navigate" />
                </button>
                <button className={`${cl.marker_list_element_edit_button} ${cl.marker_list_element_button}`}
                    onClick={() => {
                        edit(marker);
                    }}>
                    <img className={`${cl.marker_list_element_edit_button_img} ${cl.marker_list_element_button_img}`}
                        alt="edit" />
                </button>
                <button className={`${cl.marker_list_element_delete_button} ${cl.marker_list_element_button}`}
                    onClick={() => {
                        remove(marker);
                    }}>
                    <img className={`${cl.marker_list_element_delete_button_img} ${cl.marker_list_element_button_img}`}
                        alt="delete" />
                </button>
            </div>
            <div className={`${cl.marker_list_element_title_cont}`}>
                <h3 className={`${cl.marker_list_element_title}`}>
                    {marker.title}
                </h3>
            </div>
            <div className={`${cl.marker_list_element_description_cont}`}>
                <p className={`${cl.marker_list_element_description}`}>
                    {marker.description}
                </p>
            </div>
            <div className={`${cl.marker_list_element_coordinates_cont}`}>
                <span className={`${cl.marker_list_element_latitude}`}>
                    lt: {marker.latitude}
                </span>
                <span className={`${cl.marker_list_element_longitude}`}>
                    lg: {marker.longitude}
                </span>
            </div>
            <div className={`${cl.marker_list_element_starts_at_cont}`}>
                <span className={`${cl.marker_list_element_starts_at}`}>
                    {new Date(marker.startsAt).toLocaleString()}
                </span>
            </div>
        </div>
    );
});

MarkerListElement.displayName = 'MarkerListElement';

MarkerListElement.propTypes = {
    marker: PropTypes.any.isRequired,
    navigate: PropTypes.func.isRequired,
    edit: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired
};

export default MarkerListElement;
