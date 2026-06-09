import { memo } from "react";
import cl from "./.module.css";
import PropTypes from "prop-types";

const Switch = memo(({
    value,
    setValue
}) => {
    return (
        <div className={cl.switch}>
            <input className={cl.switch__input}
                type='checkbox'
                checked={value}
                readOnly={true} />
            <label className={cl.switch__label}
                onClick={() => setValue(x => !x)}></label>
        </div>
    );
});

Switch.displayName = 'Switch';

Switch.propTypes = {
    value: PropTypes.bool.isRequired,
    setValue: PropTypes.func.isRequired
};

export default Switch;
