import React from "react";
import cl from "./.module.css";
import PropTypes from "prop-types";

const Switch = React.memo(({
    value,
    setValue
}) => {
    const inputRef = React.useRef(null);

    return (
        <div className={cl.switch}>
            <input className={cl.switch__input}
                type="checkbox"
                checked={value}
                ref={inputRef}
                onChange={() => setValue(x => !x)} />
            <label className={cl.switch__label}
                onClick={() => inputRef.current.click()}>
                Toggle
            </label>
        </div>
    );
});

Switch.displayName = "Switch";

Switch.propTypes = {
    value: PropTypes.bool.isRequired,
    setValue: PropTypes.func.isRequired
};

export default Switch;
