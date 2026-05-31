import { useContext } from "react";
import { TimeZoneContext } from "../providers/TimeZoneProvider";

/**
 * A custom hook to access the time zone context.
 * @returns {Object} An object containing the current time zone and a function to update it
 */
export const useTimeZone = () => {
    const context = useContext(TimeZoneContext);
    if (context === undefined) {
        throw new Error('useTimeZone must be used within a TimeZoneProvider');
    }
    return context;
};
