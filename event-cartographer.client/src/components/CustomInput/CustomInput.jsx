import { memo, useCallback, useMemo } from "react";
import cl from './.module.css';
import PropTypes from "prop-types";
import { useTheme } from '../../hooks/useTheme';

const CustomInput = memo(({
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
    max,
    min,
    step,
    required,
    value,
    defaultValue,
    valueMissingValidity,
    tooShortValidity,
    typeMismatchValidity,
    patternValidity,
    rangeUnderflowValidity,
    rangeOverflowValidity,
    onChange,
}) => {
    const { theme } = useTheme();

    const renderLabel = useMemo(() => {
        return label ? (
            <label className={`${cl.custom_input__label} ${cl[appearanceMode]}`}
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
        } else if (obj.validity.typeMismatch && typeMismatchValidity) {
            obj.setCustomValidity(typeMismatchValidity);
        } else if (obj.validity.patternMismatch && patternValidity) {
            obj.setCustomValidity(patternValidity);
        } else if (obj.validity.rangeUnderflow) {
            obj.setCustomValidity(rangeUnderflowValidity);
        } else if (obj.validity.rangeOverflow) {
            obj.setCustomValidity(rangeOverflowValidity);
        }
    }, [
        valueMissingValidity, tooShortValidity, typeMismatchValidity,
        patternValidity, rangeUnderflowValidity, rangeOverflowValidity
    ]);

    return (
        <div className={`${cl.custom_input} ${cl[theme]}`}
            style={containerStyle}>
            {renderLabel}
            <input className={`${cl.custom_input__input} ${cl[appearanceMode]}`}
                style={inputStyle}
                type={type}
                autoComplete={autoComplete}
                id={id}
                name={name}
                placeholder={placeholder}
                pattern={pattern}
                minLength={minLength}
                maxLength={maxLength}
                max={max}
                min={min}
                step={step}
                required={required}
                value={value}
                defaultValue={defaultValue}
                onChange={onChange}
                onInput={customValidity}
                onInvalid={customValidity} />
        </div>
    );
});

CustomInput.displayName = 'CustomInput';

CustomInput.propTypes = {
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
    max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    required: PropTypes.bool,
    value: PropTypes.object,
    defaultValue: PropTypes.object,
    valueMissingValidity: PropTypes.string,
    tooShortValidity: PropTypes.string,
    typeMismatchValidity: PropTypes.string,
    patternValidity: PropTypes.string,
    rangeUnderflowValidity: PropTypes.string,
    rangeOverflowValidity: PropTypes.string,
    onChange: PropTypes.func,
};

export default CustomInput;
