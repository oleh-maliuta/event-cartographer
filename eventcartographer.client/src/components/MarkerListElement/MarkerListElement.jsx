import React from "react";
import cl from "./.module.css";
import PropTypes from "prop-types";
import { useTheme } from '../../hooks/useTheme';

const MarkerListElement = React.memo(({
    marker,
    navigate,
    edit,
    remove
}) => {
    const { theme } = useTheme();

    function eventPassed(startsAt) {
        const processedDateTime = new Date(startsAt);
        processedDateTime.setMinutes(processedDateTime.getMinutes() - processedDateTime.getTimezoneOffset());
        return processedDateTime < new Date();
    }

    function getLocalTime(dateTime) {
        if (!dateTime) {
            return null;
        }

        const processedDateTime = new Date(dateTime);
        processedDateTime.setMinutes(processedDateTime.getMinutes() - processedDateTime.getTimezoneOffset());
        return processedDateTime;
    }

    return (
        <div className={`${cl.marker_list_element} ${cl[theme]}`}
            key={marker.id}>
            <div className={`${cl.marker_list_element__importance} ${cl[marker.importance]}`} />
            <div className={`${cl.marker_list_element__buttons}`}>
                <button className={`${cl.marker_list_element__navigate_button} ${cl.marker_list_element__button}`}
                    onClick={() => {
                        navigate(marker);
                    }}>
                    <img className={`${cl.marker_list_element__navigate_button__img} ${cl.marker_list_element__button__img}`}
                        alt="navigate" />
                </button>
                <button className={`${cl.marker_list_element__edit_button} ${cl.marker_list_element__button}`}
                    onClick={() => {
                        edit(marker);
                    }}>
                    <img className={`${cl.marker_list_element__edit_button__img} ${cl.marker_list_element__button__img}`}
                        alt="edit" />
                </button>
                <button className={`${cl.marker_list_element__delete_button} ${cl.marker_list_element__button}`}
                    onClick={() => {
                        remove(marker);
                    }}>
                    <img className={`${cl.marker_list_element__delete_button__img} ${cl.marker_list_element__button__img}`}
                        alt="delete" />
                </button>
            </div>
            <div className={`${cl.marker_list_element__title__cont}`}>
                <h3 className={`${cl.marker_list_element__title}`}>
                    {marker.title}
                </h3>
            </div>
            <div className={`${cl.marker_list_element__description__cont}`}>
                <p className={`${cl.marker_list_element__description}`}>
                    {marker.description}
                </p>
            </div>
            <div className={`${cl.marker_list_element__coordinates__cont}`}>
                <span className={`${cl.marker_list_element__latitude}`}>
                    lt: {marker.latitude}
                </span>
                <span className={`${cl.marker_list_element__longitude}`}>
                    lg: {marker.longitude}
                </span>
            </div>
            <div className={`${cl.marker_list_element__starts_at__cont}`}>
                <span className={`${cl.marker_list_element__starts_at} ${eventPassed(marker.startsAt) ? cl.passed : ''}`}>
                    {getLocalTime(marker.startsAt).toLocaleString()}
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
