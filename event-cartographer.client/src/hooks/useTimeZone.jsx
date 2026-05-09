import { useContext } from "react";
import { TimeZoneContext } from "../providers/TimeZoneProvider";

export const useTimeZone = () => {
    const context = useContext(TimeZoneContext);
    if (context === undefined) {
        throw new Error('useTimeZone must be used within a TimeZoneProvider');
    }
    return context;
};
