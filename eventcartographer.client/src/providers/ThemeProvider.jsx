import React from 'react';
import PropTypes from "prop-types";

const ThemeContext = React.createContext();

const ThemeProvider = ({
    children
}) => {
    const localStorageKey = "theme";
    const allowedThemeValues = ["light", "dark"];

    const getInitialTheme = () => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedPref = window.localStorage.getItem(localStorageKey);
            if (
                typeof storedPref === 'string' &&
                allowedThemeValues.includes(storedPref)
            ) {
                return storedPref;
            }

            const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
            if (userMedia.matches) {
                return 'dark';
            }
        }

        return 'light';
    };

    const checkIfThemeIsFromDevice = () => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedPref = window.localStorage.getItem(localStorageKey);
            if (
                typeof storedPref === 'string' &&
                allowedThemeValues.includes(storedPref)
            ) {
                return false;
            }
        }

        return true;
    };

    const [theme, setTheme] = React.useState(getInitialTheme);
    const [isDeviceTheme, setIsDeviceTheme] = React.useState(checkIfThemeIsFromDevice);

    const setThemeMode = (mode) => {
        const isModeAllowed = allowedThemeValues.includes(mode)

        setIsDeviceTheme(!isModeAllowed)

        if (isModeAllowed) {
            setTheme(mode);
            localStorage.setItem(localStorageKey, mode);
        } else {
            const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
            setTheme(userMedia.matches ? 'dark' : 'light');
            localStorage.removeItem(localStorageKey);
        }
    };

    const handleColorSchemeChange = React.useCallback(() => {
        if (isDeviceTheme) {
            setTheme(
                window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
            );
        }
    }, [isDeviceTheme]);

    React.useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        mediaQuery.addEventListener('change', handleColorSchemeChange);

        return () => {
            mediaQuery.removeEventListener('change', handleColorSchemeChange);
        };
    }, [handleColorSchemeChange]);

    return (
        <ThemeContext.Provider value={{ theme, isDeviceTheme, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

ThemeProvider.displayName = "Panel";

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
