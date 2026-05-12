import { Temporal } from '@js-temporal/polyfill';

/**
 * Checks if a given UTC time is in the past.
 * @param {string} utcString - A UTC ISO string (e.g., "2024-05-11T15:00:00Z")
 * @returns {boolean} - True if the time is in the past, false otherwise.
 */
export function isTimeInPast(utcString) {
    return Temporal.Instant.compare(
        Temporal.Instant.from(utcString.endsWith('Z') ? utcString : utcString + 'Z'),
        Temporal.Now.instant()
    ) < 0;
}

/**
 * Returns a list of all supported time zones with their current offsets.
 * @returns {Array<{name: string, offset: string, offsetValue: number}>} An array of time zone objects, each containing the time zone name and its current offset from UTC.
 */
export function getTimeZones() {
    const timezones = Intl.supportedValuesOf('timeZone');
    const now = Temporal.Now.instant();

    return timezones.map(tzName => {
        const zdt = now.toZonedDateTimeISO(tzName);

        return {
            name: tzName,
            offset: zdt.offset,
            offsetValue: zdt.offsetNanoseconds,
        };
    }).sort((a, b) => a.offsetValue - b.offsetValue);
}

/**
 * Retrieves offset information for a specific IANA timezone name.
 * @param {string} tzName - Example: 'America/New_York'
 * @returns {{name: string, offset: string, offsetValue: number}|null} - The offset info or null if the name is invalid.
 */
export function getTimeZoneInfo(tzName) {
    try {
        const now = Temporal.Now.instant();
        const zdt = now.toZonedDateTimeISO(tzName);

        return {
            name: tzName,
            offset: zdt.offset,
            offsetValue: zdt.offsetNanoseconds
        };
    } catch {
        return null;
    }
}

/**
 * Returns the current time zone with its current offset.
 * @returns {{name: string, offset: string, offsetValue: number}} A time zone object containing the time zone name and its current offset from UTC.
 */
export function getCurrentTimeZone() {
    const tzName = Temporal.Now.timeZoneId();
    const zdt = Temporal.Now.instant().toZonedDateTimeISO(tzName);

    return {
        name: tzName,
        offset: zdt.offset,
        offsetValue: zdt.offsetNanoseconds,
    };
}

/**
 * Converts a UTC ISO string to a local format.
 * @param {string} utcString - Example: "2024-05-11T15:00:00Z"
 * @param {string} timeZone - The IANA timezone name (e.g., 'America/New_York')
 * @returns {Temporal.PlainDateTime} - A Temporal.PlainDateTime object representing the local date and time, without timezone information.
 */
export function convertUtcToLocalTime(utcString, timeZone) {
    const instant = Temporal.Instant.from(utcString.endsWith('Z') ? utcString : utcString + 'Z');
    const localZonedDateTime = instant.toZonedDateTimeISO(timeZone);
    return localZonedDateTime.toPlainDateTime();
}

/**
 * Converts a local date and time string to a UTC ISO string.
 * @param {string} localString - Example: "2024-05-11T15:00:00"
 * @param {string} timeZone - The IANA timezone name (e.g., 'America/New_York')
 * @returns {Temporal.Instant} - A Temporal.Instant object representing the UTC time.
 */
export function convertLocalTimeToUtc(localString, timeZone) {
    const plainDateTime = Temporal.PlainDateTime.from(localString);
    const zonedDateTime = plainDateTime.toZonedDateTime(timeZone);
    return zonedDateTime.toInstant();
}
