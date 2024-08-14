import React from "react";
import cl from './.module.css';
import PropTypes from "prop-types";
import useTheme from "../../hooks/useTheme";

const PanelInput = React.memo(React.forwardRef(({
    containerStyle,
    labelStyle,
    inputStyle,
    label,
    type,
    placeholder,
    maxLength
}, ref) => {
    const theme = useTheme();

    return (
        <div className={`${cl.panel_input} ${cl[theme.ls ?? theme.cs]}`}
            style={containerStyle}>
            <label className={cl.label}
                style={labelStyle}>
                {label}
            </label>
            <input className={cl.input}
                style={inputStyle}
                type={type}
                placeholder={placeholder}
                maxLength={maxLength}
                ref={ref} />
        </div>
    );
}));

PanelInput.propTypes = {
    containerStyle: PropTypes.object,
    labelStyle: PropTypes.object,
    inputStyle: PropTypes.object,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    type: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    maxLength: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default PanelInput;
