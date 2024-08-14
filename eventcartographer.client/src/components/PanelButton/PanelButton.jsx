import React from "react";
import cl from './.module.css';
import PropTypes from "prop-types";
import LoadingAnimation from "../LoadingAnimation/LoadingAnimation";
import useTheme from "../../hooks/useTheme";

const PanelButton = React.memo(React.forwardRef(({
    style,
    text,
    loading,
    onClick
}, ref) => {
    const theme = useTheme();

    return (
        <button className={`${cl.panel_button} ${cl[theme.ls ?? theme.cs]}`}
            style={style}
            ref={ref}
            onClick={() => {
                if (!loading) {
                    onClick();
                }
            }}>
            {
                loading ?
                    <LoadingAnimation
                        curveColor1="#FFFFFF"
                        curveColor2="#00000000"
                        size="20px"
                        curveWidth="3px" />
                    :
                    <span>{text}</span>
            }
        </button>
    );
}));

PanelButton.propTypes = {
    style: PropTypes.object,
    text: PropTypes.string,
    loading: PropTypes.bool,
    onClick: PropTypes.func
};

export default PanelButton;
