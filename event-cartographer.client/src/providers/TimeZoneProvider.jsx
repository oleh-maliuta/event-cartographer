import { createContext, useCallback, useMemo, useState } from 'react';
import PropTypes from "prop-types";
import { LocalStorageKeys, TIME_ZONES } from '../utils/constants';
import { getCurrentTimeZone, getTimeZoneInfo } from '../utils/time';

const TimeZoneContext = createContext();

const TimeZoneProvider = ({
    children
}) => {
    const [timeZone, setTimeZone] = useState(
        getTimeZoneInfo(localStorage.getItem(LocalStorageKeys.TIME_ZONE)) || getCurrentTimeZone());

    const setTimeZoneMode = useCallback((mode) => {
        const isModeAllowed = Object
            .values(TIME_ZONES.map((tz) => tz.name)).includes(mode)

        if (isModeAllowed) {
            setTimeZone(getTimeZoneInfo(mode));
            localStorage.setItem(LocalStorageKeys.TIME_ZONE, mode);
        } else {
            setTimeZone(getCurrentTimeZone());
            localStorage.removeItem(LocalStorageKeys.TIME_ZONE);
        }
    }, []);

    const timeZoneContextValue = useMemo(() => ({
        timeZone,
        setTimeZoneMode,
    }), [timeZone, setTimeZoneMode]);

    return (
        <TimeZoneContext.Provider value={timeZoneContextValue}>
            {children}
        </TimeZoneContext.Provider>
    );
};

TimeZoneProvider.displayName = "TimeZoneProvider";

TimeZoneProvider.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]).isRequired
};

export {
    TimeZoneContext,
    TimeZoneProvider
};
