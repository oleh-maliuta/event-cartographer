import { memo } from "react";
import cl from './.module.css';
import PropTypes from "prop-types";
import LoadingAnimation from "../LoadingAnimation/LoadingAnimation";
import { useTheme } from '../../hooks/useTheme';

const PanelButton = memo(({
    style,
    text,
    loading,
    disabled,
}) => {
    const { theme } = useTheme();

    return (
        <button className={`${cl.panel_button} ${cl[theme]}`}
            type="submit"
            disabled={disabled}
            style={style}>
            {
                loading ?
                    <LoadingAnimation
                        curveColor1="#FFFFFF"
                        curveColor2="#00000000"
                        size="20px"
                        curveWidth="3px" />
                    : text
            }
        </button>
    );
});

PanelButton.propTypes = {
    style: PropTypes.object,
    text: PropTypes.string,
    loading: PropTypes.bool,
    disabled: PropTypes.bool,
};

export default PanelButton;
