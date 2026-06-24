import { memo, useCallback } from "react";
import cl from './.module.css';
import PropTypes from "prop-types";
import { useTheme } from '../../hooks/useTheme';

const PanelInput = memo(({
    containerStyle,
    labelStyle,
    inputStyle,
    appearanceMode,
    id,
    name,
    label,
    type,
    autoComplete,
    placeholder,
    pattern,
    minLength,
    maxLength,
    required,
    value,
    setValue,
    valueMissingValidity,
    tooShortValidity,
    typeMismatchValidity,
    patternValidity,
}) => {
    const { theme } = useTheme();

    const customValidity = useCallback((e) => {
        const obj = e.currentTarget;
        obj.setCustomValidity('')

        if (obj.validity.valueMissing && valueMissingValidity) {
            obj.setCustomValidity(valueMissingValidity);
        } else if (obj.validity.tooShort && tooShortValidity) {
            obj.setCustomValidity(tooShortValidity);
        } else if (obj.validity.typeMismatch && typeMismatchValidity) {
            obj.setCustomValidity(typeMismatchValidity);
        } else if (obj.validity.patternMismatch && patternValidity) {
            obj.setCustomValidity(patternValidity);
        }
    }, [valueMissingValidity, tooShortValidity, typeMismatchValidity, patternValidity]);

    const onChangeEvent = useCallback((e) => {
        if (value !== undefined)
            setValue(e.target.value);
    }, [value, setValue]);

    return (
        <div className={`${cl.panel_input} ${cl[theme]}`}
            style={containerStyle}>
            <label className={cl.panel_input__label}
                style={labelStyle}
                htmlFor={id}>
                {label}
            </label>
            <input className={`${cl.panel_input__input} ${cl[appearanceMode]}`}
                style={inputStyle}
                type={type}
                autoComplete={autoComplete}
                id={id}
                name={name}
                placeholder={placeholder}
                pattern={pattern}
                minLength={minLength}
                maxLength={maxLength}
                required={required}
                value={value}
                onChange={onChangeEvent}
                onInput={customValidity}
                onInvalid={customValidity} />
        </div>
    );
});

PanelInput.propTypes = {
    containerStyle: PropTypes.object,
    labelStyle: PropTypes.object,
    inputStyle: PropTypes.object,
    appearanceMode: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
    autoComplete: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    type: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    pattern: PropTypes.string,
    minLength: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maxLength: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    required: PropTypes.bool,
    value: PropTypes.string,
    setValue: PropTypes.func,
    valueMissingValidity: PropTypes.string,
    tooShortValidity: PropTypes.string,
    typeMismatchValidity: PropTypes.string,
    patternValidity: PropTypes.string,
    ref: PropTypes.object,
};

export default PanelInput;
