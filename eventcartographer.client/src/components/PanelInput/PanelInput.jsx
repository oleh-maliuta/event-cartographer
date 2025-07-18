import React from "react";
import cl from './.module.css';
import PropTypes from "prop-types";
import { useTheme } from "../../providers/ThemeProvider";

const PanelInput = React.memo(React.forwardRef(({
    containerStyle,
    labelStyle,
    inputStyle,
    label,
    type,
    placeholder,
    maxLength,
    invalidationText
}, ref) => {
    const { theme } = useTheme();

    return (
        <div className={`${cl.panel_input} ${cl[theme]}`}
            style={containerStyle}>
            <label className={cl.panel_input__label}
                style={labelStyle}>
                {label}
            </label>
            {
                invalidationText ?
                    <p className={cl.panel_input__invalidation}>
                        {invalidationText}
                    </p>
                    : <></>
            }
            <input className={`${cl.panel_input__input} ${invalidationText !== undefined ? cl.invalid : ''}`}
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
    invalidationText: PropTypes.string
};

export default PanelInput;
