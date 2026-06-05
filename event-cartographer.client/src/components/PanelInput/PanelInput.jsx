import { memo, useCallback } from "react";
import cl from './.module.css';
import PropTypes from "prop-types";
import { useTheme } from '../../hooks/useTheme';

const PanelInput = memo(({
    containerStyle,
    labelStyle,
    inputStyle,
    name,
    label,
    type,
    placeholder,
    pattern,
    condition = () => true,
    minLength,
    maxLength,
    required,
    valueMissingValidity,
    tooShortValidity,
    typeMismatchValidity,
    patternValidity,
    conditionalValidity,
    ref,
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
        } else if (!condition() && conditionalValidity) {
            obj.setCustomValidity(conditionalValidity);
        }

    }, [
        valueMissingValidity, tooShortValidity,
        typeMismatchValidity, patternValidity,
        condition, conditionalValidity
    ]);

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
                pattern={pattern}
                minLength={minLength}
                maxLength={maxLength}
                required={required}
                ref={ref}
                onInput={customValidity}
                onInvalid={customValidity} />
        </div>
    );
});

PanelInput.propTypes = {
    containerStyle: PropTypes.object,
    labelStyle: PropTypes.object,
    inputStyle: PropTypes.object,
    name: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    type: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    pattern: PropTypes.string,
    condition: PropTypes.func,
    minLength: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maxLength: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    required: PropTypes.bool,
    valueMissingValidity: PropTypes.string,
    tooShortValidity: PropTypes.string,
    typeMismatchValidity: PropTypes.string,
    patternValidity: PropTypes.string,
    conditionalValidity: PropTypes.string,
    ref: PropTypes.object,
};

export default PanelInput;
