import React from "react";
import cl from './.module.css';
import PropTypes from "prop-types";
import { useTheme } from '../../hooks/useTheme';

const PanelInput = React.memo(React.forwardRef(({
    containerStyle,
    labelStyle,
    inputStyle,
    name,
    label,
    type,
    placeholder,
    minLength,
    maxLength,
    required
}, ref) => {
    const { theme } = useTheme();

    return (
        <div className={`${cl.panel_input} ${cl[theme]}`}
            style={containerStyle}>
            <label className={cl.panel_input__label}
                style={labelStyle}>
                {label}
            </label>
            <input className={cl.panel_input__input}
                style={inputStyle}
                type={type}
                name={name}
                placeholder={placeholder}
                minLength={minLength}
                maxLength={maxLength}
                required={required}
                ref={ref} />
        </div>
    );
}));

PanelInput.propTypes = {
    containerStyle: PropTypes.object,
    labelStyle: PropTypes.object,
    inputStyle: PropTypes.object,
    name: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    type: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    minLength: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maxLength: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    required: PropTypes.bool
};

export default PanelInput;
