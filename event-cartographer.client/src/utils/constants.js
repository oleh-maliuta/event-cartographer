import { getTimeZones } from "./time";

export const PanelInputAppearanceModes = Object.freeze({
    CREDENTIALS: 'credentials',
    SIMPLE: 'simple',
    SETTINGS: 'settings',
});

export const SidebarMenuModes = Object.freeze({
    ADD: 'add',
    EDIT: 'edit',
    LIST: 'list',
});

export const MessageStates = Object.freeze({
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
});

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

export const DEFAULT_DATE_TIME_FORMAT = Object.freeze({
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});
