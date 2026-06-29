import { memo } from "react";
import cl from "./.module.css";
import PropTypes from "prop-types";

const Switch = memo(({
    id,
    name,
    checked,
    defaultChecked,
    onChange,
}) => {
    return (
        <div className={cl.switch}>
            <input className={cl.switch__input}
                type='checkbox'
                id={id}
                name={name}
                checked={checked}
                defaultChecked={defaultChecked}
                onClick={onChange} />
            <label className={cl.switch__label}
                htmlFor={id}></label>
        </div>
    );
});

Switch.displayName = 'Switch';

Switch.propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    checked: PropTypes.bool,
    defaultChecked: PropTypes.bool,
    onChange: PropTypes.func,
};

export default Switch;
