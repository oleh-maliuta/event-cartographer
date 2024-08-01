import React from "react";
import cl from './.module.css';

const PanelInput = React.memo(React.forwardRef(({
    containerStyle,
    labelStyle,
    inputStyle,
    label,
    type,
    placeholder,
    maxLength
}, ref) => {
    return (
        <div className={cl.main}
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

export default PanelInput;
