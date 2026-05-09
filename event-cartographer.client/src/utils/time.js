import { Temporal } from '@js-temporal/polyfill';

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
