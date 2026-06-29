import { memo, useCallback, useMemo } from "react";
import cl from './.module.css';
import PropTypes from "prop-types";
import { useTheme } from '../../hooks/useTheme';

const CustomTextarea = memo(({
    containerStyle,
    labelStyle,
    textareaStyle,
    appearanceMode,
    id,
    name,
    label,
    autoComplete,
    placeholder,
    minLength,
    maxLength,
    required,
    value,
    defaultValue,
    valueMissingValidity,
    tooShortValidity,
    onChange,
}) => {
    const { theme } = useTheme();

    const renderLabel = useMemo(() => {
        return label ? (
            <label className={`${cl.custom_textarea__label} ${cl[appearanceMode]}`}
                style={labelStyle}
                htmlFor={id}>
                {label}
            </label>
        ) : null;
    }, [appearanceMode, id, label, labelStyle]);

    const customValidity = useCallback((e) => {
        const obj = e.currentTarget;
        obj.setCustomValidity('')

        if (obj.validity.valueMissing && valueMissingValidity) {
            obj.setCustomValidity(valueMissingValidity);
        } else if (obj.validity.tooShort && tooShortValidity) {
            obj.setCustomValidity(tooShortValidity);
        }
    }, [valueMissingValidity, tooShortValidity]);

    return (
        <div className={`${cl.custom_textarea} ${cl[theme]}`}
            style={containerStyle}>
            {renderLabel}
            <textarea className={`${cl.custom_textarea__textarea} ${cl[appearanceMode]}`}
                style={textareaStyle}
                autoComplete={autoComplete}
                id={id}
                name={name}
                placeholder={placeholder}
                minLength={minLength}
                maxLength={maxLength}
                required={required}
                value={value}
                defaultValue={defaultValue}
                onChange={onChange}
                onInput={customValidity}
                onInvalid={customValidity}>
            </textarea>
        </div>
    );
});

CustomTextarea.displayName = 'CustomTextarea';

CustomTextarea.propTypes = {
    containerStyle: PropTypes.object,
    labelStyle: PropTypes.object,
    textareaStyle: PropTypes.object,
    appearanceMode: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
    autoComplete: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    placeholder: PropTypes.string,
    minLength: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maxLength: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    required: PropTypes.bool,
    value: PropTypes.object,
    defaultValue: PropTypes.object,
    valueMissingValidity: PropTypes.string,
    tooShortValidity: PropTypes.string,
    onChange: PropTypes.func,
};

export default CustomTextarea;
