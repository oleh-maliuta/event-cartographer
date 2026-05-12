import { useContext } from "react";
import { ThemeContext } from "../providers/ThemeProvider";

/**
 * A custom hook to access the theme context.
 * @returns {Object} An object containing the current theme and a function to toggle the theme
 */
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
