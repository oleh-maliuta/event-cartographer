import { memo, useCallback, useMemo } from "react";
import cl from './.module.css';
import PropTypes from "prop-types";
import { useTheme } from '../../hooks/useTheme';

const CustomSelect = memo(({
    containerStyle,
    labelStyle,
    selectStyle,
    appearanceMode,
    id,
    name,
    label,
    required,
    value,
    defaultValue,
    valueMissingValidity,
    onChange,
    children,
}) => {
    const { theme } = useTheme();

    const renderLabel = useMemo(() => {
        return label ? (
            <label className={`${cl.custom_select__label} ${cl[appearanceMode]}`}
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
        }
    }, [valueMissingValidity]);

    return (
        <div className={`${cl.custom_select} ${cl[theme]}`}
            style={containerStyle}>
            {renderLabel}
            <select className={`${cl.custom_select__select} ${cl[appearanceMode]}`}
                style={selectStyle}
                id={id}
                name={name}
                required={required}
                value={value}
                defaultValue={defaultValue}
                onChange={onChange}
                onInput={customValidity}
                onInvalid={customValidity}>
                {children}
            </select>
        </div>
    );
});

CustomSelect.displayName = 'CustomSelect';

CustomSelect.propTypes = {
    containerStyle: PropTypes.object,
    labelStyle: PropTypes.object,
    selectStyle: PropTypes.object,
    appearanceMode: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    required: PropTypes.bool,
    value: PropTypes.object,
    defaultValue: PropTypes.object,
    valueMissingValidity: PropTypes.string,
    onChange: PropTypes.func,
    children: PropTypes.node,
};

export default CustomSelect;
