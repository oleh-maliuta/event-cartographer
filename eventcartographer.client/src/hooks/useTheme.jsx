import React from "react";

export default function useTheme() {
    const localStorageKey = "theme";

    const [lsValue] = React.useState(localStorage.getItem(localStorageKey));
    const [colorScheme, setColorScheme] = React.useState(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    function handleColorSchemeChange() {
        setColorScheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }

    React.useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        mediaQuery.addEventListener('change', handleColorSchemeChange);

        return () => {
            mediaQuery.removeEventListener('change', handleColorSchemeChange);
        };
    }, []);

    return { ls: lsValue, cs: colorScheme };
}
