import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from "prop-types";
import { LocalStorageKeys, ThemeValues } from '../utils/constants';

const ThemeContext = createContext();

const ThemeProvider = ({
    children
}) => {
    const getInitialTheme = () => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedPref = window.localStorage.getItem(LocalStorageKeys.THEME);
            if (
                typeof storedPref === 'string' &&
                Object.values(ThemeValues).includes(storedPref)
            ) {
                return storedPref;
            }

            const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
            if (userMedia.matches) {
                return ThemeValues.DARK;
            }
        }

        return ThemeValues.LIGHT;
    };

    const checkIfThemeIsFromDevice = () => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedPref = window.localStorage.getItem(LocalStorageKeys.THEME);
            if (
                typeof storedPref === 'string' &&
                Object.values(ThemeValues).includes(storedPref)
            ) {
                return false;
            }
        }

        return true;
    };

    const [theme, setTheme] = useState(getInitialTheme);
    const [isDeviceTheme, setIsDeviceTheme] = useState(checkIfThemeIsFromDevice);

    const setThemeMode = useCallback((mode) => {
        const isModeAllowed = Object.values(ThemeValues).includes(mode)

        setIsDeviceTheme(!isModeAllowed)

        if (isModeAllowed) {
            setTheme(mode);
            localStorage.setItem(LocalStorageKeys.THEME, mode);
        } else {
            const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
            setTheme(userMedia.matches ? ThemeValues.DARK : ThemeValues.LIGHT);
            localStorage.removeItem(LocalStorageKeys.THEME);
        }
    }, []);

    const handleColorSchemeChange = useCallback(() => {
        if (isDeviceTheme) {
            setTheme(
                window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? ThemeValues.DARK : ThemeValues.LIGHT
            );
        }
    }, [isDeviceTheme]);

    const themeContextValue = useMemo(() => ({
        theme,
        isDeviceTheme,
        setThemeMode,
    }), [theme, isDeviceTheme, setThemeMode]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        mediaQuery.addEventListener('change', handleColorSchemeChange);

        return () => {
            mediaQuery.removeEventListener('change', handleColorSchemeChange);
        };
    }, [handleColorSchemeChange]);

    return (
        <ThemeContext.Provider value={themeContextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

ThemeProvider.displayName = "ThemeProvider";

ThemeProvider.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]).isRequired
};

export {
    ThemeContext,
    ThemeProvider
};
