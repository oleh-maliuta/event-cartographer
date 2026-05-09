import { getTimeZones } from "./time";

export const ThemeValues = Object.freeze({
    LIGHT: 'light',
    DARK: 'dark',
});

export const LocalStorageKeys = Object.freeze({
    TIME_ZONE: 'timeZone',
    LANGUAGE: 'language',
    THEME: 'theme',
});

export const PageRoutes = Object.freeze({
    HOME: '/',
    SIGN_UP: '/sign-up',
    SIGN_IN: '/sign-in',
    RESET_PASSWORD: '/reset-password',
    USER_SETTINGS: '/settings',
});

export const TIME_ZONES = getTimeZones();
